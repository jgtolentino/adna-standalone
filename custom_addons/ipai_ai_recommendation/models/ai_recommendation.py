from odoo import api, fields, models

TARGET_TYPE_SELECTION = [
    ("store", "Store"),
    ("region", "Region"),
    ("transaction", "Transaction"),
    ("product", "Product / SKU"),
    ("segment", "Segment / Consumer Profile"),
]

RECO_TYPE_SELECTION = [
    ("assortment", "Assortment"),
    ("pricing", "Pricing"),
    ("promotion", "Promotion"),
    ("layout", "Layout / Merchandising"),
    ("operations", "Operations"),
    ("other", "Other"),
]


class IpaiAIRecommendation(models.Model):
    _name = "ipai.ai.recommendation"
    _description = "IPAI AI Recommendation"
    _inherit = ["mail.thread", "mail.activity.mixin"]

    name = fields.Char(
        string="Title",
        required=True,
        help="Short label for the recommendation.",
    )
    target_type = fields.Selection(
        selection=TARGET_TYPE_SELECTION,
        string="Target Type",
        required=True,
        tracking=True,
    )
    reco_type = fields.Selection(
        selection=RECO_TYPE_SELECTION,
        string="Recommendation Type",
        required=True,
        tracking=True,
    )
    store_partner_id = fields.Many2one(
        "res.partner",
        string="Target Store",
        domain=[("is_scout_store", "=", True)],
    )
    region_id = fields.Many2one(
        "ipai.region",
        string="Target Region",
    )
    transaction_id = fields.Many2one(
        "sale.order",
        string="Target Transaction",
    )
    product_id = fields.Many2one(
        "product.product",
        string="Target Product / SKU",
    )
    consumer_profile_id = fields.Many2one(
        "ipai.consumer.profile",
        string="Target Consumer Profile",
    )
    recommendation_text = fields.Text(
        string="Recommendation",
        required=True,
        help="Human-readable recommendation text.",
    )
    confidence_score = fields.Float(
        string="Confidence Score",
        help="Model confidence or heuristic score between 0 and 1.",
    )
    source_system = fields.Char(
        string="Source System",
        help="E.g. Scout AI, SariCoach, external model identifier.",
    )
    metadata_json = fields.Json(
        string="Metadata (JSON)",
        help="Raw JSON payload (feature importance, metrics, prompt IDs, etc.).",
    )
    active = fields.Boolean(default=True)

    @api.constrains(
        "target_type",
        "store_partner_id",
        "region_id",
        "transaction_id",
        "product_id",
        "consumer_profile_id",
    )
    def _check_target_consistency(self):
        for rec in self:
            if not any(
                [
                    rec.store_partner_id,
                    rec.region_id,
                    rec.transaction_id,
                    rec.product_id,
                    rec.consumer_profile_id,
                ]
            ):
                continue

    def toggle_active(self):
        for rec in self:
            rec.active = not rec.active
