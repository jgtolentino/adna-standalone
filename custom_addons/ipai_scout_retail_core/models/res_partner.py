from odoo import fields, models


class ResPartner(models.Model):
    _inherit = "res.partner"

    is_scout_store = fields.Boolean(
        string="Scout Store",
        help="Flag partner as a sari-sari / retail store in the Scout ecosystem.",
    )
    ipai_region_id = fields.Many2one(
        "ipai.region",
        string="IPAI Region",
    )
    ipai_city_id = fields.Many2one(
        "ipai.city",
        string="IPAI City / Municipality",
    )
    ipai_barangay_id = fields.Many2one(
        "ipai.barangay",
        string="IPAI Barangay",
    )
    scout_store_code = fields.Char(
        string="Scout Store Code",
        help="External store code used in Scout/Supabase.",
    )
