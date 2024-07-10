from django.contrib.auth import get_user_model, login
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Interest
from .serializers import InterestSerializer, LoginSerializer, UserSerializer
from rest_framework import status
from rest_framework.views import APIView

User = get_user_model()


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        login(request, user)
        return Response({"message": "Login successful"}, status=status.HTTP_200_OK)


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.exclude(id=self.request.user.id)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        login(request, user)
        return Response({"message": "Login successful"}, status=status.HTTP_200_OK)


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
            return Response(
                {"message": "Interest sent successfully"},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
