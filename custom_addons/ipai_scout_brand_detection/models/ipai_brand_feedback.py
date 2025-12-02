from odoo import api, fields, models


class IpaiBrandFeedback(models.Model):
    _name = "ipai.brand.feedback"
    _description = "Brand Detection Feedback"
    _order = "create_date desc"

    metric_id = fields.Many2one(
        "ipai.shelf.brand.metric",
        string="Shelf Metric",
        required=True,
        ondelete="cascade",
    )
    image_id = fields.Many2one(
        "ipai.brand.image",
        string="Reference Image",
        required=True,
    )
    store_id = fields.Many2one(
        related="metric_id.store_id",
        store=True,
        readonly=True,
    )
    brand_id = fields.Many2one(
        related="metric_id.brand_id",
        store=True,
        readonly=True,
    )
    expected_presence = fields.Boolean(
        string="Expected Present",
        help="Based on planogram or previous visits, the brand should be present.",
        default=True,
    )
    expected_facings = fields.Integer(
        string="Expected Facings",
        help="Planogram or last-known facings for the brand on this shelf.",
    )
    verified_presence = fields.Boolean(
        string="Verified Present",
        help="Human ground truth: was the brand present?",
    )
    verified_facings = fields.Integer(
        string="Verified Facings",
        help="Human ground truth facings for the brand.",
    )
    state = fields.Selection(
        [
            ("pending_reprocess", "Pending Reprocess"),
            ("reprocessed", "Reprocessed"),
            ("needs_annotation", "Needs Annotation"),
            ("annotated", "Annotated"),
            ("sent_to_training", "Sent to Training"),
            ("closed", "Closed"),
        ],
        default="pending_reprocess",
        index=True,
    )
    verification_source = fields.Selection(
        [
            ("field_rep", "Field Rep"),
            ("supervisor", "Supervisor"),
            ("backoffice", "Backoffice QA"),
        ],
        string="Verification Source",
    )
    annotation_payload = fields.Text(
        help="JSON payload with ground-truth boxes for retraining.",
    )
    notes = fields.Text()
    model_version = fields.Char(
        string="Model Version",
        help="Detector version that originally missed the brand.",
    )
    reprocess_model_version = fields.Char(
        string="Reprocess Model Version",
        help="Detector version used during reprocessing.",
    )
    reward = fields.Float(
        help="Reward signal for bandit/RL tracking; positive if the reprocess fixed the miss.",
    )

    def action_mark_annotated(self):
        for record in self:
            record.state = "annotated"

    def action_mark_sent_to_training(self):
        for record in self:
            record.state = "sent_to_training"
