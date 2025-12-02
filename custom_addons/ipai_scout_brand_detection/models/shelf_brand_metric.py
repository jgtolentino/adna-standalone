from datetime import timedelta

from odoo import api, fields, models


class IpaiShelfBrandMetric(models.Model):
    _name = "ipai.shelf.brand.metric"
    _description = "Shelf Brand Metrics"
    _order = "date desc, store_id, brand_id"

    store_id = fields.Many2one(
        "res.partner",
        domain=[("is_scout_store", "=", True)],
        required=True,
    )
    aisle_id = fields.Many2one("ipai.store.aisle", string="Aisle")
    shelf_id = fields.Many2one("ipai.store.shelf", string="Shelf")
    date = fields.Date(required=True)

    brand_id = fields.Many2one("product.brand", required=True)
    facings = fields.Integer(required=True, default=0)
    share_of_shelf = fields.Float(string="Share of Shelf (%)", digits=(16, 4))
    oos_flag = fields.Boolean(string="Out of Stock")

    last_image_id = fields.Many2one("ipai.brand.image", string="Last Image")
    recommendation_ids = fields.One2many(
        "ipai.ai.recommendation",
        "metric_id",
        string="AI Recommendations",
    )
    feedback_ids = fields.One2many(
        "ipai.brand.feedback",
        "metric_id",
        string="Feedback Records",
    )
    priority_brand = fields.Boolean(
        string="Priority Brand",
        help="When enabled, always open a feedback loop if facings are missing.",
        default=False,
    )
    low_share_threshold = fields.Float(
        string="Low Share Threshold (%)",
        default=10.0,
        help="Threshold under which low share-of-shelf recommendations are generated.",
    )

    @api.model
    def cron_compute_daily_metrics(self):
        detection_model = self.env["ipai.brand.detection"]
        brand_image_model = self.env["ipai.brand.image"]

        context_date = self.env.context.get("target_date")
        if context_date:
            target_date = fields.Date.from_string(context_date)
        else:
            target_date = fields.Date.context_today(self) - timedelta(days=1)

        date_from = f"{target_date} 00:00:00"
        date_to = f"{target_date} 23:59:59"

        domain = [
            ("is_meta", "=", False),
            ("image_id.captured_at", ">=", date_from),
            ("image_id.captured_at", "<=", date_to),
        ]

        grouped = detection_model.read_group(
            domain,
            [
                "brand_id",
                "image_id.store_id",
                "image_id.aisle_id",
                "image_id.shelf_id",
            ],
            [
                "brand_id",
                "image_id.store_id",
                "image_id.aisle_id",
                "image_id.shelf_id",
            ],
            lazy=False,
        )

        if not grouped:
            return

        totals = {}
        for group in grouped:
            store_id = group.get("image_id.store_id") and group["image_id.store_id"][0]
            aisle_id = group.get("image_id.aisle_id") and group["image_id.aisle_id"][0]
            shelf_id = group.get("image_id.shelf_id") and group["image_id.shelf_id"][0]
            key = (store_id or 0, aisle_id or 0, shelf_id or 0)
            totals[key] = totals.get(key, 0) + group.get("__count", 0)

        for group in grouped:
            brand_id = group.get("brand_id") and group["brand_id"][0]
            store_id = group.get("image_id.store_id") and group["image_id.store_id"][0]
            aisle_id = group.get("image_id.aisle_id") and group["image_id.aisle_id"][0]
            shelf_id = group.get("image_id.shelf_id") and group["image_id.shelf_id"][0]

            if not brand_id or not store_id:
                continue

            facings = group.get("__count", 0)
            key = (store_id or 0, aisle_id or 0, shelf_id or 0)
            total_facings = float(totals.get(key, 0)) or 0.0
            share = 0.0
            if total_facings:
                share = 100.0 * float(facings) / total_facings

            image_domain = [
                ("store_id", "=", store_id),
                ("captured_at", ">=", date_from),
                ("captured_at", "<=", date_to),
            ]
            if aisle_id:
                image_domain.append(("aisle_id", "=", aisle_id))
            else:
                image_domain.append(("aisle_id", "=", False))
            if shelf_id:
                image_domain.append(("shelf_id", "=", shelf_id))
            else:
                image_domain.append(("shelf_id", "=", False))

            last_image = brand_image_model.search(
                image_domain, order="captured_at desc, id desc", limit=1
            )

            metric = self.search(
                [
                    ("store_id", "=", store_id),
                    ("aisle_id", "=", aisle_id or False),
                    ("shelf_id", "=", shelf_id or False),
                    ("brand_id", "=", brand_id),
                    ("date", "=", target_date),
                ],
                limit=1,
            )

            values = {
                "store_id": store_id,
                "aisle_id": aisle_id or False,
                "shelf_id": shelf_id or False,
                "date": target_date,
                "brand_id": brand_id,
                "facings": facings,
                "share_of_shelf": share,
                "oos_flag": facings <= 0,
                "last_image_id": last_image.id if last_image else False,
            }

            if metric:
                metric.write(values)
            else:
                metric = self.create(values)

    def _generate_recommendations_for_metric(self):
        recommendation_model = self.env["ipai.ai.recommendation"]
        for metric in self:
            existing = recommendation_model.search(
                [
                    ("metric_id", "=", metric.id),
                    ("trigger_type", "in", ["oos", "low_share"]),
                ],
                limit=1,
            )
            if existing:
                continue

            vals = {
                "metric_id": metric.id,
                "target_type": "store",
                "reco_type": "operations",
                "store_partner_id": metric.store_id.id,
                "priority": "normal",
            }

            if metric.oos_flag:
                vals.update(
                    {
                        "name": f"OOS – {metric.brand_id.name} at {metric.store_id.display_name}",
                        "trigger_type": "oos",
                        "action_code": "restock",
                        "priority": "urgent",
                        "recommendation_text": (
                            "Brand %(brand)s has zero facings on %(date)s for store %(store)s."
                            " Dispatch restock or verify availability."
                        )
                        % {
                            "brand": metric.brand_id.name,
                            "date": metric.date,
                            "store": metric.store_id.display_name,
                        },
                    }
                )
            elif metric.share_of_shelf < metric.low_share_threshold:
                vals.update(
                    {
                        "name": f"Low share – {metric.brand_id.name} at {metric.store_id.display_name}",
                        "trigger_type": "low_share",
                        "action_code": "remerch",
                        "priority": "high",
                        "recommendation_text": (
                            "Share of shelf for %(brand)s is %(share).2f%% on %(date)s."
                            " Review planogram, increase facings, or add secondary display."
                        )
                        % {
                            "brand": metric.brand_id.name,
                            "share": metric.share_of_shelf,
                            "date": metric.date,
                        },
                    }
                )
            else:
                continue

            recommendation_model.create(vals)

    def _ensure_feedback_for_missing_brands(self):
        feedback_model = self.env["ipai.brand.feedback"]
        for metric in self:
            if metric.feedback_ids:
                continue
            if not metric.oos_flag and not metric.priority_brand:
                continue
            if not metric.last_image_id:
                continue
            feedback_model.create(
                {
                    "metric_id": metric.id,
                    "image_id": metric.last_image_id.id,
                    "expected_presence": True,
                    "expected_facings": metric.facings,
                    "state": "pending_reprocess",
                    "model_version": metric.last_image_id.model_version,
                    "notes": "Auto-created because brand is missing or priority with low share.",
                }
            )

    @api.model
    def cron_generate_brand_recommendations(self):
        target_date = fields.Date.context_today(self) - timedelta(days=1)
        metrics = self.search([("date", "=", target_date)])
        metrics._generate_recommendations_for_metric()
        metrics._ensure_feedback_for_missing_brands()
