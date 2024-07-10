from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from .models import Interest
from .serializers import InterestSerializer

User = get_user_model()


class UserRegistrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse("register")
        self.user_data = {
            "username": "testuser",
            "email": "testuser@example.com",
            "password": "StrongPassword123!",
        }

    def test_user_registration(self):
        response = self.client.post(self.register_url, self.user_data, format="json")
        print(response.data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().username, self.user_data["username"])
        self.assertEqual(User.objects.get().email, self.user_data["email"])
        self.assertTrue(User.objects.get().check_password(self.user_data["password"]))

    def test_user_registration_missing_fields(self):
        data = {"username": "testuser", "password": "StrongPassword123!"}

        response = self.client.post(self.register_url, data, format="json")
        print(response.data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_registration_duplicate_email(self):
        self.test_user_registration()

        data = {
            "username": "anotheruser",
            "email": "testuser@example.com",
            "password": "StrongPassword456!",
        }

        response = self.client.post(self.register_url, data, format="json")
        print(response.data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_registration_duplicate_username(self):
        self.test_user_registration()

        data = {
            "username": "testuser",
            "email": "anotheruser@example.com",
            "password": "StrongPassword456!",
        }

        response = self.client.post(self.register_url, data, format="json")
        print(response.data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LoginViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.login_url = reverse("login")
        self.user_data = {"username": "testuser", "password": "StrongPassword123!"}
        self.user = User.objects.create_user(**self.user_data)

    def test_login_success(self):
        response = self.client.post(self.login_url, self.user_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)
        self.assertEqual(response.data["message"], "Login successful")

    def test_login_missing_username(self):
        data = {"password": "StrongPassword123!"}
        response = self.client.post(self.login_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_missing_password(self):
        data = {
            "username": "testuser",
        }
        response = self.client.post(self.login_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_invalid_credentials(self):
        data = {"username": "testuser", "password": "IncorrectPassword123!"}
        response = self.client.post(self.login_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("detail", response.data)
        self.assertEqual(response.data["detail"], "Invalid credentials")

    def test_login_inactive_user(self):
        inactive_user = User.objects.create_user(
            username="inactiveuser",
            email="inactiveuser@example.com",
            password="StrongPassword123!",
            is_active=False,
        )
        data = {"username": "inactiveuser", "password": "StrongPassword123!"}
        response = self.client.post(self.login_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("detail", response.data)
        self.assertEqual(response.data["detail"], "Invalid credentials")


class UserListViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", email="testuser@example.com", password="password123"
        )
        self.client.force_authenticate(user=self.user)

    def test_user_list(self):
        url = reverse("users")

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_user_list_unauthenticated(self):
        self.client.logout()
        url = reverse("users")

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class InterestViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.sender_user = User.objects.create_user(
            username="senderuser",
            email="senderuser@example.com",
            password="StrongPassword123!",
        )
        self.receiver_user = User.objects.create_user(
            username="receiveruser",
            email="receiveruser@example.com",
            password="StrongPassword456!",
        )
        self.client.force_authenticate(user=self.sender_user)

    def test_send_interest_success(self):
        url = reverse("interest")
        data = {"receiver": self.receiver_user.id, "message": "Hello, let's connect!"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["message"], "Interest sent successfully")

    def test_send_interest_duplicate(self):
        url = reverse("interest")
        data = {"receiver": self.receiver_user.id, "message": "Duplicate interest"}
        self.client.post(url, data, format="json")

        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["message"], "You have already sent a request to this receiver"
        )

    def test_manage_interest_retrieve(self):
        url = reverse("interest-list")
        Interest.objects.create(
            sender=self.sender_user,
            receiver=self.receiver_user,
            message="Test interest",
        )

        self.client.force_authenticate(user=self.receiver_user)

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_manage_interest_accept_reject(self):
        interest = Interest.objects.create(
            sender=self.sender_user,
            receiver=self.receiver_user,
            message="Test interest",
        )

        url = reverse("interest-accept-reject", kwargs={"pk": interest.id})
        data = {"accepted": True}

        self.client.force_authenticate(user=self.receiver_user)

        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)
        self.assertEqual(response.data["message"], "Interest accepted")

    def test_manage_interest_accept_reject_not_receiver(self):
        other_user = User.objects.create_user(
            username="otheruser",
            email="otheruser@example.com",
            password="StrongPassword789!",
        )
        interest = Interest.objects.create(
            sender=self.sender_user, receiver=other_user, message="Test interest"
        )

        url = reverse("interest-accept-reject", kwargs={"pk": interest.id})
        data = {"accepted": True}

        self.client.force_authenticate(user=self.receiver_user)

        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("error", response.data)
        self.assertEqual(
            response.data["error"], "You are not the receiver of this interest"
        )
