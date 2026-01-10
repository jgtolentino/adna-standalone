#!/usr/bin/env python3
"""Main Odoo → Supabase sync script."""

import os
import sys
import argparse
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

from dotenv import load_dotenv

from odoo_client import OdooClient, OdooConfig
from transformers import transform_pos_order, ScoutTransaction, TBWA_CLIENT_BRANDS
from supabase_loader import SupabaseLoader

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

CHECKPOINT_ID = "odoo_pos_sync"


def run_sync(
    full_sync: bool = False,
    dry_run: bool = False,
    batch_size: int = 500,
) -> Dict[str, Any]:
    """Run the Odoo → Supabase sync.

    Args:
        full_sync: If True, sync all data (ignore checkpoint)
        dry_run: If True, don't write to database
        batch_size: Number of records per batch

    Returns:
        Dict with sync results
    """
    started_at = datetime.utcnow()
    results = {
        "started_at": started_at.isoformat(),
        "records_fetched": 0,
        "records_transformed": 0,
        "records_loaded": 0,
        "errors": [],
        "status": "pending",
    }

    try:
        # Initialize clients
        logger.info("Initializing Odoo client...")
        odoo_config = OdooConfig.from_env()
        odoo = OdooClient(odoo_config)
        odoo.authenticate()
        logger.info("Odoo authentication successful")

        loader = SupabaseLoader()

        # Get checkpoint
        since = None
        if not full_sync:
            checkpoint = loader.get_checkpoint(CHECKPOINT_ID)
            if checkpoint and checkpoint.get("last_sync_at"):
                since = checkpoint["last_sync_at"]
                logger.info(f"Incremental sync from: {since}")
            else:
                logger.info("No checkpoint found, doing full sync")

        # Fetch POS orders
        logger.info("Fetching POS orders from Odoo...")
        orders = odoo.get_pos_orders(since=since, limit=batch_size)
        results["records_fetched"] = len(orders)
        logger.info(f"Fetched {len(orders)} orders")

        if not orders:
            logger.info("No new orders to sync")
            results["status"] = "success"
            results["completed_at"] = datetime.utcnow().isoformat()
            return results

        # Get order line details
        order_ids = [o["id"] for o in orders]
        logger.info("Fetching order lines...")
        lines = odoo.get_pos_order_lines(order_ids)
        lines_by_order = {}
        for line in lines:
            order_id = line["order_id"][0] if isinstance(line["order_id"], (list, tuple)) else line["order_id"]
            if order_id not in lines_by_order:
                lines_by_order[order_id] = []
            lines_by_order[order_id].append(line)

        # Get products
        product_ids = list(set(
            line["product_id"][0]
            for line in lines
            if line.get("product_id") and isinstance(line["product_id"], (list, tuple))
        ))
        logger.info(f"Fetching {len(product_ids)} products...")
        products_list = odoo.get_products(product_ids)
        products = {p["id"]: p for p in products_list}

        # Get partners (for store/customer info)
        partner_ids = list(set(
            o["partner_id"][0]
            for o in orders
            if o.get("partner_id") and isinstance(o["partner_id"], (list, tuple))
        ))
        logger.info(f"Fetching {len(partner_ids)} partners...")
        partners_list = odoo.get_partners() if partner_ids else []
        partners = {p["id"]: p for p in partners_list}

        # Transform orders to Scout transactions
        logger.info("Transforming to Scout format...")
        all_transactions: List[ScoutTransaction] = []
        for order in orders:
            order_lines = lines_by_order.get(order["id"], [])
            try:
                txns = transform_pos_order(
                    order, order_lines, products, partners, TBWA_CLIENT_BRANDS
                )
                all_transactions.extend(txns)
            except Exception as e:
                logger.error(f"Error transforming order {order['id']}: {e}")
                results["errors"].append(f"Transform error: {order['id']}: {str(e)}")

        results["records_transformed"] = len(all_transactions)
        logger.info(f"Transformed {len(all_transactions)} transactions")

        # Load to Supabase
        if dry_run:
            logger.info("DRY RUN - skipping database writes")
            results["status"] = "dry_run"
        else:
            logger.info("Loading to Supabase...")
            tx_dicts = [tx.to_dict() for tx in all_transactions]
            loaded = loader.upsert_transactions(tx_dicts, batch_size=batch_size)
            results["records_loaded"] = loaded
            logger.info(f"Loaded {loaded} transactions")

            # Update checkpoint
            if all_transactions:
                latest_sync = max(tx.synced_at for tx in all_transactions if tx.synced_at)
                loader.update_checkpoint(
                    CHECKPOINT_ID,
                    last_sync_at=latest_sync,
                    records_synced=loaded,
                    status="success",
                )

            # Refresh silver layer
            logger.info("Refreshing silver layer...")
            try:
                loader.refresh_silver_layer()
            except Exception as e:
                logger.warning(f"Silver refresh failed (may not exist yet): {e}")

            results["status"] = "success"

        # Log sync run
        completed_at = datetime.utcnow()
        results["completed_at"] = completed_at.isoformat()

        if not dry_run:
            loader.log_sync_run(
                checkpoint_id=CHECKPOINT_ID,
                started_at=started_at,
                completed_at=completed_at,
                records_processed=results["records_loaded"],
                status=results["status"],
                error_count=len(results["errors"]),
                error_details="\n".join(results["errors"]) if results["errors"] else None,
            )

    except Exception as e:
        logger.error(f"Sync failed: {e}")
        results["status"] = "failed"
        results["errors"].append(str(e))
        results["completed_at"] = datetime.utcnow().isoformat()

    return results


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(description="Odoo → Supabase ETL Sync")
    parser.add_argument(
        "--full",
        action="store_true",
        help="Full sync (ignore checkpoint)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Don't write to database",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=500,
        help="Records per batch (default: 500)",
    )
    args = parser.parse_args()

    # Load environment variables
    load_dotenv()

    # Validate required env vars
    required_vars = [
        "ODOO_BASE_URL",
        "ODOO_DB",
        "ODOO_USERNAME",
        "ODOO_PASSWORD",
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY",
    ]
    missing = [v for v in required_vars if not os.environ.get(v)]
    if missing:
        logger.error(f"Missing required environment variables: {', '.join(missing)}")
        sys.exit(1)

    # Run sync
    results = run_sync(
        full_sync=args.full,
        dry_run=args.dry_run,
        batch_size=args.batch_size,
    )

    # Print results
    print("\n" + "=" * 60)
    print("SYNC RESULTS")
    print("=" * 60)
    print(f"Status:      {results['status']}")
    print(f"Started:     {results['started_at']}")
    print(f"Completed:   {results.get('completed_at', 'N/A')}")
    print(f"Fetched:     {results['records_fetched']}")
    print(f"Transformed: {results['records_transformed']}")
    print(f"Loaded:      {results['records_loaded']}")
    if results["errors"]:
        print(f"Errors:      {len(results['errors'])}")
        for err in results["errors"][:5]:
            print(f"  - {err}")
    print("=" * 60)

    sys.exit(0 if results["status"] in ("success", "dry_run") else 1)


if __name__ == "__main__":
    main()
