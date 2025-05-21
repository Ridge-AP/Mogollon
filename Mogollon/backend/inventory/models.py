from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Product(models.Model):
    name        = models.CharField(max_length=200)
    sku         = models.CharField(max_length=100, unique=True)
    default_uom = models.CharField("default UOM", max_length=50)

    def __str__(self):
        return f"{self.name} ({self.sku})"

class Warehouse(models.Model):
    name     = models.CharField(max_length=200)
    location = models.CharField(max_length=200)

    def __str__(self):
        return self.name

class InventoryRecord(models.Model):
    product          = models.ForeignKey(Product,   related_name="inventory_records", on_delete=models.CASCADE)
    warehouse        = models.ForeignKey(Warehouse, related_name="inventory_records", on_delete=models.CASCADE)
    quantity_on_hand = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    reorder_point    = models.DecimalField(max_digits=12, decimal_places=3, default=0)

    class Meta:
        unique_together = ("product", "warehouse")

class InventoryTransaction(models.Model):
    TRANSACTION_TYPES = [
        ("intake",    "Intake"),
        ("depletion", "Depletion"),
    ]
    REASONS = [
        ("client_order", "Client Order"),
        ("shrinkage",    "Shrinkage"),
        ("damage",       "Damage"),
        ("transfer",     "Transfer"),
        ("other",        "Other"),
    ]

    record           = models.ForeignKey(InventoryRecord, related_name="transactions", on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    quantity         = models.DecimalField(max_digits=12, decimal_places=3)
    uom              = models.CharField(max_length=50)
    reason           = models.CharField(max_length=20, choices=REASONS, blank=True, null=True)
    reference        = models.CharField(max_length=200, blank=True, null=True)
    notes            = models.TextField(blank=True, null=True)
    created_by       = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
