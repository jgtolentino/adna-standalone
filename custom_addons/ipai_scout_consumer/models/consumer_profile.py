from odoo import fields, models

GENDER_SELECTION = [
    ("female", "Female"),
    ("male", "Male"),
    ("non_binary", "Non-binary"),
    ("unknown", "Unknown / Not inferred"),
]

AGE_BRACKET_SELECTION = [
    ("under_18", "Under 18"),
    ("18_24", "18–24"),
    ("25_34", "25–34"),
    ("35_44", "35–44"),
    ("45_54", "45–54"),
    ("55_64", "55–64"),
    ("65_plus", "65+"),
    ("unknown", "Unknown"),
]


class IpaiConsumerProfile(models.Model):
    _name = "ipai.consumer.profile"
    _description = "IPAI Consumer Profile (Anonymous)"
    _inherit = ["mail.thread", "mail.activity.mixin"]

    name = fields.Char(
        string="Profile Label",
        help="Human-friendly label (e.g. 'Young Budget-Conscious Female').",
    )
    gender = fields.Selection(
        selection=GENDER_SELECTION,
        string="Gender (Inferred)",
        tracking=True,
    )
    age_bracket = fields.Selection(
        selection=AGE_BRACKET_SELECTION,
        string="Age Bracket (Inferred)",
        tracking=True,
    )
    region_id = fields.Many2one(
        "ipai.region",
        string="Region (Inferred)",
    )
    city_id = fields.Many2one(
        "ipai.city",
        string="City / Municipality (Inferred)",
    )
    barangay_id = fields.Many2one(
        "ipai.barangay",
        string="Barangay (Inferred)",
    )
    demographics_json = fields.Json(
        string="Demographics (Raw JSON)",
        help="Raw demographic inference payload from AI or analytics pipeline.",
    )
    note = fields.Text(
        string="Notes",
        help="Optional notes or explanation of how this profile was created.",
    )
    transaction_ids = fields.One2many(
        "sale.order",
        "consumer_profile_id",
        string="Related Transactions",
    )
