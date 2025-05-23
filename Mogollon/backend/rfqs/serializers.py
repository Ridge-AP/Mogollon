# rfqs/serializers.py
from rest_framework import serializers
from .models import RFQ

class RFQSerializer(serializers.ModelSerializer):
    class Meta:
        model = RFQ
        fields = [
            "id",
            "email",
            "customer",
            "product",
            "description",
            "product_type",
            "other_desc",
            "other_qty",
            "other_target",
            "rep_email",
            "urgency",
            "due_date",
            "needed_by",
            "internal_notes",
            "created_at",
            "status",
        ]
        read_only_fields = ["id", "created_at", "status"]
