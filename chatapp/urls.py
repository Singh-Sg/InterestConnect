from django.contrib.auth import views as auth_views
from django.urls import path

from .views import (
    LoginView,
    ManageInterestView,
    SendInterestView,
    UserListView,
    UserRegistrationView,
)

urlpatterns = [
    path("register/", UserRegistrationView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", auth_views.LogoutView.as_view(), name="logout"),
    path("users/", UserListView.as_view(), name="users"),
    path("interest/", SendInterestView.as_view(), name="interest"),
    path("manage-interest/", ManageInterestView.as_view(), name="interest-list"),
    path(
        "manage-interest/<int:pk>/",
        ManageInterestView.as_view(),
        name="interest-accept-reject",
    ),
]
