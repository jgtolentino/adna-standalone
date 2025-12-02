from odoo import fields, models


class IpaiRegion(models.Model):
    _name = "ipai.region"
    _description = "IPAI Region (Philippines)"

    name = fields.Char(required=True)
    code = fields.Char(help="Short code, e.g. NCR, Region IV-A.")
    country_id = fields.Many2one(
        "res.country",
        string="Country",
        default=lambda self: self.env.ref("base.ph", raise_if_not_found=False),
    )
    state_id = fields.Many2one(
        "res.country.state",
        string="Linked State/Region",
        help="Optional link to built-in res.country.state.",
    )


class IpaiCity(models.Model):
    _name = "ipai.city"
    _description = "IPAI City / Municipality"

    name = fields.Char(required=True)
    code = fields.Char()
    region_id = fields.Many2one("ipai.region", required=True)
    state_id = fields.Many2one(
        "res.country.state",
        string="Country State",
        help="Optional: mirror to Odoo state if used.",
    )


class IpaiBarangay(models.Model):
    _name = "ipai.barangay"
    _description = "IPAI Barangay"

    name = fields.Char(required=True)
    code = fields.Char()
    city_id = fields.Many2one("ipai.city", required=True)
    region_id = fields.Many2one(related="city_id.region_id", store=True)
