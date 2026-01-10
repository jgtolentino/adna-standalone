"""Odoo JSON-RPC Client for ETL operations."""

import os
import json
import requests
from typing import Any, Dict, List, Optional
from dataclasses import dataclass


@dataclass
class OdooConfig:
    """Odoo connection configuration."""
    base_url: str
    db: str
    username: str
    password: str
    jsonrpc_path: str = "/jsonrpc"

    @classmethod
    def from_env(cls) -> "OdooConfig":
        """Load configuration from environment variables."""
        return cls(
            base_url=os.environ["ODOO_BASE_URL"],
            db=os.environ["ODOO_DB"],
            username=os.environ["ODOO_USERNAME"],
            password=os.environ["ODOO_PASSWORD"],
            jsonrpc_path=os.environ.get("ODOO_JSONRPC_PATH", "/jsonrpc"),
        )


class OdooClient:
    """JSON-RPC client for Odoo API."""

    def __init__(self, config: OdooConfig):
        self.config = config
        self.url = f"{config.base_url}{config.jsonrpc_path}"
        self._uid: Optional[int] = None
        self._request_id = 0

    def _make_request(self, service: str, method: str, args: List[Any]) -> Any:
        """Make a JSON-RPC request to Odoo."""
        self._request_id += 1
        payload = {
            "jsonrpc": "2.0",
            "method": "call",
            "params": {
                "service": service,
                "method": method,
                "args": args,
            },
            "id": self._request_id,
        }

        response = requests.post(
            self.url,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=60,
        )
        response.raise_for_status()

        result = response.json()
        if "error" in result:
            error = result["error"]
            raise OdooRPCError(
                f"Odoo RPC Error: {error.get('message', 'Unknown error')}"
            )

        return result.get("result")

    def authenticate(self) -> int:
        """Authenticate and get user ID."""
        if self._uid is not None:
            return self._uid

        self._uid = self._make_request(
            "common",
            "authenticate",
            [self.config.db, self.config.username, self.config.password, {}],
        )

        if not self._uid:
            raise OdooAuthError("Authentication failed")

        return self._uid

    def search_read(
        self,
        model: str,
        domain: List[Any] = None,
        fields: List[str] = None,
        limit: int = None,
        offset: int = 0,
        order: str = None,
    ) -> List[Dict[str, Any]]:
        """Search and read records from Odoo model."""
        uid = self.authenticate()

        kwargs: Dict[str, Any] = {}
        if fields:
            kwargs["fields"] = fields
        if limit:
            kwargs["limit"] = limit
        if offset:
            kwargs["offset"] = offset
        if order:
            kwargs["order"] = order

        return self._make_request(
            "object",
            "execute_kw",
            [
                self.config.db,
                uid,
                self.config.password,
                model,
                "search_read",
                [domain or []],
                kwargs,
            ],
        )

    def get_pos_orders(
        self,
        since: Optional[str] = None,
        limit: int = 500,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        """Fetch POS orders from Odoo.

        Args:
            since: ISO timestamp to fetch orders modified after
            limit: Maximum records to fetch
            offset: Pagination offset

        Returns:
            List of POS order dictionaries
        """
        domain = [("state", "in", ["paid", "done", "invoiced"])]
        if since:
            domain.append(("write_date", ">", since))

        return self.search_read(
            "pos.order",
            domain=domain,
            fields=[
                "id",
                "name",
                "date_order",
                "partner_id",
                "config_id",
                "session_id",
                "amount_total",
                "amount_paid",
                "amount_tax",
                "amount_return",
                "state",
                "lines",
                "payment_ids",
                "write_date",
            ],
            limit=limit,
            offset=offset,
            order="write_date asc",
        )

    def get_pos_order_lines(self, order_ids: List[int]) -> List[Dict[str, Any]]:
        """Fetch POS order lines for given order IDs."""
        if not order_ids:
            return []

        return self.search_read(
            "pos.order.line",
            domain=[("order_id", "in", order_ids)],
            fields=[
                "id",
                "order_id",
                "product_id",
                "qty",
                "price_unit",
                "price_subtotal",
                "price_subtotal_incl",
                "discount",
                "tax_ids",
            ],
        )

    def get_products(self, product_ids: List[int] = None) -> List[Dict[str, Any]]:
        """Fetch products from Odoo."""
        domain = []
        if product_ids:
            domain.append(("id", "in", product_ids))

        return self.search_read(
            "product.product",
            domain=domain,
            fields=[
                "id",
                "name",
                "default_code",
                "categ_id",
                "list_price",
                "type",
                "active",
                # OCA product_brand fields (if installed)
                "product_brand_id",
            ],
        )

    def get_partners(
        self,
        partner_type: str = None,
        since: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Fetch partners (customers/stores) from Odoo."""
        domain = []
        if partner_type:
            domain.append(("type", "=", partner_type))
        if since:
            domain.append(("write_date", ">", since))

        return self.search_read(
            "res.partner",
            domain=domain,
            fields=[
                "id",
                "name",
                "type",
                "street",
                "street2",
                "city",
                "state_id",
                "country_id",
                "zip",
                "phone",
                "email",
                "customer_rank",
                "is_company",
                "write_date",
                # Custom fields for Philippine geography
                "x_barangay",
                "x_region_code",
                "x_province",
            ],
        )


class OdooRPCError(Exception):
    """Odoo RPC call failed."""


class OdooAuthError(Exception):
    """Odoo authentication failed."""
