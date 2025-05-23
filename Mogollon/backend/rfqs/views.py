from rest_framework import viewsets, permissions
from .models import RFQ
from .serializers import RFQSerializer

class RFQViewSet(viewsets.ModelViewSet):
    queryset = RFQ.objects.all()
    serializer_class = RFQSerializer
    permission_classes = [permissions.IsAuthenticated]
