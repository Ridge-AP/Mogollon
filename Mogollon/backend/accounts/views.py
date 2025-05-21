# backend/accounts/views.py
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import UserAvatarSerializer

class MyProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # return username & avatar URL
        serializer = UserAvatarSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        # accept multipart/form-data with an "avatar" file
        serializer = UserAvatarSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
