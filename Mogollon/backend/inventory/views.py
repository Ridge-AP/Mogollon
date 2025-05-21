from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Product, Warehouse, InventoryRecord, InventoryTransaction
from .serializers import (
    ProductSerializer,
    WarehouseSerializer,
    InventoryRecordSerializer,
    InventoryTransactionSerializer,
)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class InventoryRecordViewSet(viewsets.ModelViewSet):
    queryset = InventoryRecord.objects.select_related("product", "warehouse")
    serializer_class = InventoryRecordSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    # Global transactions endpoint: create intake or depletion, auto-creating records
    @action(detail=False, methods=["post"], url_path="transactions")
    def transactions(self, request):
        product_id = request.data.get("product_id")
        warehouse_id = request.data.get("warehouse_id")

        if not product_id or not warehouse_id:
            return Response(
                {"error": "product_id and warehouse_id are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Fetch the product so we know its default UOM
        product = get_object_or_404(Product, pk=product_id)

        # Auto-create (or get) the InventoryRecord, supplying the product's default UOM
        record, created = InventoryRecord.objects.get_or_create(
            product_id=product_id,
            warehouse_id=warehouse_id,
               defaults={
           "quantity_on_hand": 0,
           "reorder_point": 0,
       },
    )

        payload = request.data.copy()
        payload["record_id"] = record.id
        serializer = InventoryTransactionSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        transaction = serializer.save(created_by=request.user)

        if transaction.transaction_type == "intake":
            record.quantity_on_hand += transaction.quantity
        else:
            if record.quantity_on_hand < transaction.quantity:
                transaction.delete()
                return Response(
                    {"error": "Insufficient stock for depletion."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            record.quantity_on_hand -= transaction.quantity
        record.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # Record-level transactions: only GET history
    @action(detail=True, methods=["get"], url_path="transactions")
    def list_transactions(self, request, pk=None):
        record = get_object_or_404(InventoryRecord, pk=pk)
        qs = record.transactions.all()
        page = self.paginate_queryset(qs)
        if page is not None:
            ser = InventoryTransactionSerializer(page, many=True)
            return self.get_paginated_response(ser.data)
        ser = InventoryTransactionSerializer(qs, many=True)
        return Response(ser.data)
