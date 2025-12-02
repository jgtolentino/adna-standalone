from odoo import api, fields, models


class IpaiBrandImage(models.Model):
    _name = "ipai.brand.image"
    _description = "Brand Detection Image"
    _order = "captured_at desc, id desc"

    store_id = fields.Many2one(
        "res.partner",
        string="Store",
        domain=[("is_scout_store", "=", True)],
        required=True,
    )
    aisle_id = fields.Many2one("ipai.store.aisle", string="Aisle")
    shelf_id = fields.Many2one("ipai.store.shelf", string="Shelf")
    captured_at = fields.Datetime(required=True)
    source = fields.Selection(
        [
            ("field_app", "Field App"),
            ("cctv", "CCTV"),
            ("upload", "Manual Upload"),
        ],
        default="field_app",
        required=True,
    )
    image = fields.Binary("Image", attachment=True)
    image_path = fields.Char("External Image Path")
    processed_at = fields.Datetime()
    model_version = fields.Char()

    detection_ids = fields.One2many(
        "ipai.brand.detection", "image_id", string="Detections"
    )
    metric_ids = fields.One2many(
        "ipai.shelf.brand.metric", "last_image_id", string="Shelf Metrics"
    )

    detection_count = fields.Integer(compute="_compute_detection_count", store=True)

    @api.depends("detection_ids")
    def _compute_detection_count(self):
        for record in self:
            record.detection_count = len(record.detection_ids)


class IpaiBrandDetection(models.Model):
    _name = "ipai.brand.detection"
    _description = "Brand Detection"
    _order = "confidence desc"

    image_id = fields.Many2one("ipai.brand.image", required=True, ondelete="cascade")
    store_id = fields.Many2one(related="image_id.store_id", store=True, readonly=True)

    product_id = fields.Many2one("product.product", string="Product / SKU")
    brand_id = fields.Many2one("product.brand", string="Brand")
    class_name = fields.Char("Model Class Name")
    confidence = fields.Float(digits=(16, 6))

    x_min = fields.Float()
    y_min = fields.Float()
    x_max = fields.Float()
    y_max = fields.Float()
    area_px = fields.Float()

    is_meta = fields.Boolean(compute="_compute_is_meta", store=True, readonly=True)

    @api.depends("class_name")
    def _compute_is_meta(self):
        for record in self:
            record.is_meta = bool(
                record.class_name and record.class_name.upper().startswith("META_")
            )

    @api.onchange("product_id")
    def _onchange_product_id(self):
        for record in self:
            if (
                record.product_id
                and not record.brand_id
                and record.product_id.product_tmpl_id.brand_id
            ):
                record.brand_id = record.product_id.product_tmpl_id.brand_id
