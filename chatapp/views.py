from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Interest
from .serializers import InterestSerializer, UserSerializer

User = get_user_model()


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class SendInterestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        receiver = request.data.get("receiver")

        existing_interest = Interest.objects.filter(
            sender=request.user, receiver=receiver
        ).first()
        if existing_interest:
            return Response(
                {"message": "You have already sent a request to this receiver"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = InterestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(sender=request.user)
            return Response({"message": "Interest sent successfully"})
        return Response(serializer.errors, status=400)


class ManageInterestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        interests = Interest.objects.filter(receiver=request.user)
        serializer = InterestSerializer(interests, many=True)
        return Response(serializer.data)

    def put(self, request, pk):

        try:
            interest = Interest.objects.get(pk=pk)
        except Interest.DoesNotExist:
            return Response(
                {"error": "Interest not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if interest.receiver == request.user:
            accepted = request.data.get("accepted", False)
            if accepted:
                interest.accepted = True
            else:
                interest.accepted = False
            interest.save()
            return Response(
                {"message": f"Interest {'accepted' if accepted else 'rejected'}"}
            )
        return Response(
            {"error": "You are not the receiver of this interest"},
            status=status.HTTP_403_FORBIDDEN,
        )
