from odoo import fields, models


class IpaiStoreAisle(models.Model):
    _name = "ipai.store.aisle"
    _description = "Store Aisle"
    _order = "store_id, sequence, name"

    name = fields.Char(required=True)
    store_id = fields.Many2one(
        "res.partner",
        string="Store",
        domain=[("is_scout_store", "=", True)],
        required=True,
    )
    sequence = fields.Integer(default=10)
    shelf_ids = fields.One2many("ipai.store.shelf", "aisle_id", string="Shelves")


class IpaiStoreShelf(models.Model):
    _name = "ipai.store.shelf"
    _description = "Store Shelf"
    _order = "aisle_id, sequence, name"

    name = fields.Char(required=True)
    aisle_id = fields.Many2one("ipai.store.aisle", string="Aisle", required=True)
    store_id = fields.Many2one(related="aisle_id.store_id", store=True, readonly=True)
    level = fields.Integer(help="Vertical level (1 = eye level)")
    sequence = fields.Integer(default=10)
