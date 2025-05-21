from rest_framework import serializers
from .models import Product, Warehouse, InventoryRecord, InventoryTransaction

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Product
        fields = ["id", "name", "sku", "default_uom"]

class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Warehouse
        fields = ["id", "name", "location"]

class InventoryRecordSerializer(serializers.ModelSerializer):
    # write‐only PKs
    product_id   = serializers.PrimaryKeyRelatedField(source="product",   queryset=Product.objects.all(),   write_only=True)
    warehouse_id = serializers.PrimaryKeyRelatedField(source="warehouse", queryset=Warehouse.objects.all(), write_only=True)
    # read‐only nested
    product      = ProductSerializer(read_only=True)
    warehouse    = WarehouseSerializer(read_only=True)

    class Meta:
        model  = InventoryRecord
        fields = [
            "id",
            "product", "warehouse",
            "product_id", "warehouse_id",
            "quantity_on_hand", "reorder_point",
        ]

class InventoryTransactionSerializer(serializers.ModelSerializer):
    record_id  = serializers.PrimaryKeyRelatedField(source="record", queryset=InventoryRecord.objects.all(), write_only=True)
    created_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model  = InventoryTransaction
        fields = [
            "id", "record_id",
            "transaction_type", "quantity", "uom",
            "reason", "reference", "notes",
            "created_by", "created_at",
        ]
        read_only_fields = ["created_by", "created_at"]
