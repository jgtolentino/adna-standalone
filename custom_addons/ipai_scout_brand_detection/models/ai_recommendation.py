from odoo import fields, models


class IpaiAIRecommendation(models.Model):
    _inherit = "ipai.ai.recommendation"

    metric_id = fields.Many2one(
        "ipai.shelf.brand.metric",
        string="Shelf Metric",
        help="Link to shelf-level brand metrics that triggered this recommendation.",
    )
    trigger_type = fields.Selection(
        [
            ("oos", "Out-of-Stock"),
            ("low_share", "Low Share of Shelf"),
            ("other", "Other"),
        ],
        string="Trigger Type",
        default="other",
        index=True,
    )
    action_code = fields.Selection(
        [
            ("restock", "Restock"),
            ("remerch", "Re-merchandise"),
            ("promo_push", "Promo Push"),
            ("check_planogram", "Check Planogram"),
        ],
        string="Suggested Action",
    )
    priority = fields.Selection(
        [("low", "Low"), ("normal", "Normal"), ("high", "High"), ("urgent", "Urgent")],
        default="normal",
    )
