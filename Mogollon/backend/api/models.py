from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Product(models.Model):
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, unique=True)
    default_uom = models.CharField(max_length=50)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.sku})"

class Warehouse(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Inventory(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='inventory_records'
    )
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name='inventory_records'
    )
    quantity_on_hand = models.PositiveIntegerField(default=0)
    reorder_point = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('product', 'warehouse')

    def __str__(self):
        return f"{self.product} @ {self.warehouse}"

TRANSACTION_TYPES = [
    ('intake', 'Intake'),
    ('depletion', 'Depletion'),
    ('adjustment', 'Adjustment'),
]

class Transaction(models.Model):
    inventory = models.ForeignKey(
        Inventory,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    quantity = models.IntegerField()
    uom = models.CharField(max_length=50)
    type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    source = models.CharField(max_length=100, blank=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_type_display()} {self.quantity} {self.uom} for {self.inventory}"
