from odoo import api, fields, models

TIME_BUCKET_SELECTION = [
    ("early_morning", "Early Morning"),
    ("morning", "Morning"),
    ("afternoon", "Afternoon"),
    ("evening", "Evening"),
    ("late_night", "Late Night"),
]

REQUEST_TYPE_SELECTION = [
    ("branded", "Branded Request"),
    ("category", "Category-only Request"),
    ("unsure", "Unsure / Ambiguous"),
]

REQUEST_CHANNEL_SELECTION = [
    ("verbal", "Verbal Request"),
    ("pointing", "Pointing / Gesture"),
    ("indirect", "Indirect / Other"),
]

SUBSTITUTION_REASON_SELECTION = [
    ("oos", "Out of Stock"),
    ("price", "Price-driven"),
    ("preference", "Consumer Preference"),
    ("unknown", "Unknown"),
]


class SaleOrder(models.Model):
    _inherit = "sale.order"

    scout_txn_uuid = fields.Char(
        string="Scout Transaction UUID",
        help="External UUID used by Scout / Supabase for this transaction.",
        index=True,
    )
    time_bucket = fields.Selection(
        selection=TIME_BUCKET_SELECTION,
        string="Time of Day Bucket",
        compute="_compute_time_fields",
        store=True,
    )
    is_weekend = fields.Boolean(
        string="Weekend Transaction",
        compute="_compute_time_fields",
        store=True,
    )
    txn_duration_seconds = fields.Integer(
        string="Transaction Duration (seconds)",
        help="Duration inferred from audio/video recording.",
    )
    basket_size = fields.Integer(
        string="Basket Size (Distinct SKUs)",
        compute="_compute_basket_size",
        store=True,
        help="Number of distinct products in this transaction.",
    )
    request_type = fields.Selection(
        selection=REQUEST_TYPE_SELECTION,
        string="Request Type",
        help="How the product was requested (branded, category-only, etc.).",
    )
    request_channel = fields.Selection(
        selection=REQUEST_CHANNEL_SELECTION,
        string="Request Channel",
        help="Mode of request (verbal, pointing, indirect).",
    )
    suggestion_accepted = fields.Boolean(
        string="Storeowner Suggestion Accepted",
        help="True if the shopper accepted the storeowner's suggestion.",
    )
    consumer_profile_id = fields.Many2one(
        "ipai.consumer.profile",
        string="Consumer Profile",
        help="Anonymous consumer profile inferred for this transaction.",
    )

    @api.depends("date_order")
    def _compute_time_fields(self):
        for order in self:
            if not order.date_order:
                order.time_bucket = False
                order.is_weekend = False
                continue

            dt = fields.Datetime.from_string(order.date_order)
            hour = dt.hour
            if 5 <= hour < 9:
                bucket = "early_morning"
            elif 9 <= hour < 12:
                bucket = "morning"
            elif 12 <= hour < 17:
                bucket = "afternoon"
            elif 17 <= hour < 22:
                bucket = "evening"
            else:
                bucket = "late_night"

            order.time_bucket = bucket
            order.is_weekend = bool(dt.weekday() >= 5)

    @api.depends("order_line.product_id")
    def _compute_basket_size(self):
        for order in self:
            product_ids = order.order_line.mapped("product_id").ids
            order.basket_size = len(set(product_ids))


class SaleOrderLine(models.Model):
    _inherit = "sale.order.line"

    is_substitution = fields.Boolean(
        string="Is Substitution",
        help="True if the purchased item was a substitution from the originally requested brand.",
    )
    requested_brand_id = fields.Many2one(
        "product.brand",
        string="Requested Brand",
        help="Brand the shopper initially requested.",
    )
    substituted_from_brand_id = fields.Many2one(
        "product.brand",
        string="Substituted From Brand",
        help="Original brand that was substituted away from.",
    )
    substitution_reason = fields.Selection(
        selection=SUBSTITUTION_REASON_SELECTION,
        string="Substitution Reason",
    )
    unbranded_request = fields.Boolean(
        string="Unbranded Commodity Request",
        help="True if the request was category-only (no brand).",
    )
