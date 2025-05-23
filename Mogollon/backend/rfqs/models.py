# rfqs/models.py

from django.db import models
from datetime import date

class RFQ(models.Model):
    # Status choices
    DRAFT     = "draft"
    SENT      = "sent"
    COMPLETED = "completed"
    STATUS_CHOICES = [
        (DRAFT,     "Draft"),
        (SENT,      "Sent"),
        (COMPLETED, "Completed"),
    ]

    # Step 1: Contact
    email    = models.EmailField()
    customer = models.CharField(max_length=200)

    # Step 2: Item Description
    product     = models.CharField(max_length=200)
    description = models.TextField()

    # Step 3: Product Type
    product_type = models.CharField(
        max_length=50,
        default="",    # backfills existing rows
        blank=True,
    )
    other_desc   = models.CharField(max_length=200, blank=True, null=True)
    other_qty    = models.PositiveIntegerField(blank=True, null=True)
    other_target = models.CharField(max_length=100, blank=True, null=True)

    # Step 4: Rep & Urgency
    rep_email = models.EmailField(
        default="",    # backfills existing rows
        blank=True,
    )
    urgency   = models.PositiveSmallIntegerField(default=3)

    # Step 5: Dates
    due_date  = models.DateField(default=date.today)
    needed_by = models.DateField(
        default=date.today,
        blank=True,
    )

    # Step 6: Internal Notes
    internal_notes = models.TextField(blank=True, default='')

    # Workflow status
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default=DRAFT,
    )

    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer} @ {self.created_at.date()}"
