from odoo import fields, models


class SaleOrder(models.Model):
    _inherit = "sale.order"

    consumer_profile_id = fields.Many2one(
        "ipai.consumer.profile",
        string="Consumer Profile",
        help="Anonymous consumer profile inferred for this transaction.",
    )
