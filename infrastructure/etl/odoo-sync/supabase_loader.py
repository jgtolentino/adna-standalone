"""Supabase loader for Scout data."""

import os
import json
from datetime import datetime
from typing import Any, Dict, List, Optional
from supabase import create_client, Client


def get_supabase_client() -> Client:
    """Get Supabase client from environment variables."""
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    return create_client(url, key)


class SupabaseLoader:
    """Load transformed data into Supabase."""

    def __init__(self, client: Optional[Client] = None):
        self.client = client or get_supabase_client()

    def upsert_transactions(
        self,
        transactions: List[Dict[str, Any]],
        batch_size: int = 500,
    ) -> int:
        """Upsert transactions to scout.bronze_transactions.

        Args:
            transactions: List of transaction dictionaries
            batch_size: Number of records per batch

        Returns:
            Number of records upserted
        """
        if not transactions:
            return 0

        total = 0
        for i in range(0, len(transactions), batch_size):
            batch = transactions[i : i + batch_size]

            # Remove raw_data before insert (too large)
            for tx in batch:
                tx.pop("raw_data", None)

            result = (
                self.client.schema("scout")
                .table("bronze_transactions")
                .upsert(batch, on_conflict="source_id")
                .execute()
            )
            total += len(result.data) if result.data else 0

        return total

    def upsert_stores(self, stores: List[Dict[str, Any]]) -> int:
        """Upsert stores to scout.stores."""
        if not stores:
            return 0

        result = (
            self.client.schema("scout")
            .table("stores")
            .upsert(stores, on_conflict="store_code")
            .execute()
        )
        return len(result.data) if result.data else 0

    def upsert_products(self, products: List[Dict[str, Any]]) -> int:
        """Upsert products to scout.products."""
        if not products:
            return 0

        result = (
            self.client.schema("scout")
            .table("products")
            .upsert(products, on_conflict="sku")
            .execute()
        )
        return len(result.data) if result.data else 0

    def get_checkpoint(self, checkpoint_id: str) -> Optional[Dict[str, Any]]:
        """Get last sync checkpoint."""
        result = (
            self.client.schema("scout")
            .table("sync_checkpoints")
            .select("*")
            .eq("id", checkpoint_id)
            .single()
            .execute()
        )
        return result.data

    def update_checkpoint(
        self,
        checkpoint_id: str,
        last_sync_at: datetime,
        records_synced: int,
        status: str = "success",
        error_message: Optional[str] = None,
    ) -> None:
        """Update sync checkpoint."""
        self.client.schema("scout").table("sync_checkpoints").upsert(
            {
                "id": checkpoint_id,
                "last_sync_at": last_sync_at.isoformat(),
                "records_synced": records_synced,
                "status": status,
                "error_message": error_message,
            },
            on_conflict="id",
        ).execute()

    def log_sync_run(
        self,
        checkpoint_id: str,
        started_at: datetime,
        completed_at: datetime,
        records_processed: int,
        status: str,
        error_count: int = 0,
        error_details: Optional[str] = None,
    ) -> None:
        """Log a sync run to scout.sync_logs."""
        self.client.schema("scout").table("sync_logs").insert(
            {
                "checkpoint_id": checkpoint_id,
                "started_at": started_at.isoformat(),
                "completed_at": completed_at.isoformat(),
                "records_processed": records_processed,
                "status": status,
                "error_count": error_count,
                "error_details": error_details,
            }
        ).execute()

    def refresh_silver_layer(self) -> None:
        """Trigger silver layer refresh (dedupe + validate).

        This calls a Supabase function that:
        1. Deduplicates bronze_transactions
        2. Validates data quality
        3. Inserts into silver_transactions
        """
        self.client.rpc("refresh_scout_silver_layer").execute()

    def refresh_gold_views(self) -> None:
        """Refresh materialized gold views.

        This calls a Supabase function that refreshes:
        - scout_gold_daily_metrics
        - scout_gold_brand_performance
        - scout_gold_regional_metrics
        """
        self.client.rpc("refresh_scout_gold_views").execute()
