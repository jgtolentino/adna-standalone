import json
import logging

import requests
from odoo import api, fields, models, _
from odoo.exceptions import UserError

_logger = logging.getLogger(__name__)


class IpaiMarketChannel(models.Model):
    _name = "ipai.market.channel"
    _description = "Market Channel"

    name = fields.Char(required=True)
    code = fields.Char(required=True, index=True)
    active = fields.Boolean(default=True)
    description = fields.Text()


class IpaiProductCompetitor(models.Model):
    _name = "ipai.product.competitor"
    _description = "Competitor Product Mapping"
    _rec_name = "display_name"

    display_name = fields.Char(compute="_compute_display_name", store=True)
    product_id = fields.Many2one(
        "product.product",
        string="Our Product",
        required=True,
        ondelete="cascade",
    )
    competitor_name = fields.Char(required=True)
    competitor_sku = fields.Char(string="Competitor SKU / ID")
    competitor_brand = fields.Char()
    channel_id = fields.Many2one("ipai.market.channel", string="Channel")
    website_url = fields.Char(string="Product URL")
    active = fields.Boolean(default=True)

    @api.depends("product_id", "competitor_name", "channel_id")
    def _compute_display_name(self):
        for record in self:
            parts = [
                record.product_id.display_name or "",
                record.competitor_name or "",
                record.channel_id.code or "",
            ]
            record.display_name = " / ".join([part for part in parts if part])


class IpaiProductPriceSnapshot(models.Model):
    _name = "ipai.product.price.snapshot"
    _description = "Product Price Snapshot"
    _order = "snapshot_at desc, product_id"

    product_id = fields.Many2one(
        "product.product",
        required=True,
        ondelete="cascade",
    )
    competitor_id = fields.Many2one(
        "ipai.product.competitor",
        string="Competitor Mapping",
        ondelete="set null",
    )
    channel_id = fields.Many2one("ipai.market.channel", string="Channel")
    currency_id = fields.Many2one(
        "res.currency",
        required=True,
        default=lambda self: self.env.company.currency_id.id,
    )
    our_price = fields.Monetary(string="Our Price", currency_field="currency_id")
    competitor_price = fields.Monetary(
        string="Competitor Price", currency_field="currency_id"
    )
    competitor_promo_price = fields.Monetary(
        string="Promo Price", currency_field="currency_id"
    )
    promo_flag = fields.Boolean(string="Promo Active")
    in_stock = fields.Boolean(default=True)
    snapshot_at = fields.Datetime(required=True, default=fields.Datetime.now)
    source = fields.Selection(
        [("scraper", "Scraper"), ("api", "API"), ("manual", "Manual")],
        default="scraper",
    )
    raw_payload = fields.Text(help="Raw payload returned by the scraper/API")
    price_diff_abs = fields.Monetary(
        string="Price Difference",
        currency_field="currency_id",
        compute="_compute_price_diff",
        store=True,
    )
    price_diff_pct = fields.Float(
        string="Price Difference (%)", digits=(16, 4), compute="_compute_price_diff", store=True
    )

    @api.depends("our_price", "competitor_price")
    def _compute_price_diff(self):
        for record in self:
            if record.our_price and record.competitor_price:
                record.price_diff_abs = record.competitor_price - record.our_price
                record.price_diff_pct = (
                    (record.competitor_price - record.our_price)
                    / record.our_price
                    * 100.0
                )
            else:
                record.price_diff_abs = 0.0
                record.price_diff_pct = 0.0


class IpaiMarketScraperConfig(models.Model):
    _name = "ipai.market.scraper.config"
    _description = "Market Scraper Config"
    _rec_name = "name"

    name = fields.Char(default="Default Market Scraper Config")
    active = fields.Boolean(default=True)
    sku_scraper_url = fields.Char(
        string="SKU Scraper URL",
        help="Endpoint that accepts SKU catalog payloads to refresh the scraper mapping.",
    )
    price_scraper_url = fields.Char(
        string="Price Scraper URL",
        help="Endpoint that returns competitor price snapshots.",
    )
    auth_token = fields.Char(
        string="Auth Token",
        help="Bearer/API token for the external scraper service.",
    )
    timeout = fields.Integer(default=30, help="HTTP timeout in seconds.")

    def _get_singleton(self):
        config = self.search([("active", "=", True)], limit=1)
        if not config:
            raise UserError(_("Please configure a Market Scraper Config record."))
        return config

    @api.model
    def cron_sync_sku_catalog(self):
        config = self._get_singleton()
        if not config.sku_scraper_url:
            _logger.warning("SKU scraper URL not configured; skipping sync.")
            return

        products = self.env["product.product"].search(
            [("sale_ok", "=", True), ("active", "=", True)], limit=2000
        )
        competitors = self.env["ipai.product.competitor"].search([])
        competitors_by_product = {}
        for competitor in competitors:
            competitors_by_product.setdefault(competitor.product_id.id, []).append(competitor)

        payload = []
        for product in products:
            competitor_payload = [
                {
                    "competitor_id": competitor.id,
                    "competitor_name": competitor.competitor_name,
                    "competitor_sku": competitor.competitor_sku,
                    "competitor_brand": competitor.competitor_brand,
                    "channel": competitor.channel_id.code,
                    "url": competitor.website_url,
                }
                for competitor in competitors_by_product.get(product.id, [])
            ]
            payload.append(
                {
                    "product_id": product.id,
                    "internal_reference": product.default_code,
                    "barcode": product.barcode,
                    "name": product.display_name,
                    "brand": getattr(product.product_tmpl_id, "brand_id", False)
                    and product.product_tmpl_id.brand_id.name
                    or "",
                    "list_price": product.list_price,
                    "competitors": competitor_payload,
                }
            )

        headers = {"Content-Type": "application/json"}
        if config.auth_token:
            headers["Authorization"] = f"Bearer {config.auth_token}"

        try:
            response = requests.post(
                config.sku_scraper_url,
                data=json.dumps({"products": payload}),
                headers=headers,
                timeout=config.timeout or 30,
            )
            response.raise_for_status()
            _logger.info(
                "SKU catalog sync sent %s products to scraper; status=%s",
                len(products),
                response.status_code,
            )
        except Exception as error:
            _logger.exception("Error during SKU catalog sync: %s", error)

    @api.model
    def cron_fetch_competitor_prices(self):
        config = self._get_singleton()
        if not config.price_scraper_url:
            _logger.warning("Price scraper URL not configured; skipping fetch.")
            return

        headers = {"Accept": "application/json"}
        if config.auth_token:
            headers["Authorization"] = f"Bearer {config.auth_token}"

        try:
            response = requests.get(
                config.price_scraper_url,
                headers=headers,
                timeout=config.timeout or 30,
            )
            response.raise_for_status()
        except Exception as error:
            _logger.exception("Error calling price scraper: %s", error)
            return

        try:
            data = response.json()
        except Exception as error:
            _logger.exception("Invalid JSON from price scraper: %s", error)
            return

        snapshots_data = data.get("snapshots", [])
        if not snapshots_data:
            _logger.info("No snapshots returned by price scraper.")
            return

        product_model = self.env["product.product"]
        competitor_model = self.env["ipai.product.competitor"]
        channel_model = self.env["ipai.market.channel"]
        snapshot_model = self.env["ipai.product.price.snapshot"]
        currency_model = self.env["res.currency"]

        for item in snapshots_data:
            product = product_model.browse(item.get("product_id"))
            if not product.exists():
                continue

            competitor = competitor_model.browse(item.get("competitor_id"))
            channel = channel_model.search([("code", "=", item.get("channel_code"))], limit=1)
            if not channel:
                channel = channel_model.create(
                    {
                        "name": item.get("channel_code") or "Unknown",
                        "code": item.get("channel_code") or "UNKNOWN",
                    }
                )

            currency = currency_model.search(
                [("name", "=", item.get("currency") or "PHP")],
                limit=1,
            )
            if not currency:
                currency = self.env.company.currency_id

            snapshot_at_str = item.get("snapshot_at")
            if snapshot_at_str:
                try:
                    snapshot_at = fields.Datetime.from_string(snapshot_at_str)
                except Exception:
                    snapshot_at = fields.Datetime.now()
            else:
                snapshot_at = fields.Datetime.now()

            snapshot_model.create(
                {
                    "product_id": product.id,
                    "competitor_id": competitor.id if competitor.exists() else False,
                    "channel_id": channel.id,
                    "currency_id": currency.id,
                    "our_price": item.get("our_price") or product.list_price,
                    "competitor_price": item.get("competitor_price") or 0.0,
                    "competitor_promo_price": item.get("competitor_promo_price") or 0.0,
                    "promo_flag": bool(item.get("promo_flag")),
                    "in_stock": bool(item.get("in_stock", True)),
                    "snapshot_at": snapshot_at,
                    "source": "api",
                    "raw_payload": json.dumps(item.get("raw") or {}, ensure_ascii=False),
                }
            )

        _logger.info(
            "Created %s price snapshots from scraper.",
            len(snapshots_data),
        )
