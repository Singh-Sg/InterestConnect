from django.contrib.auth import views as auth_views
from django.urls import path

from .views import UserListView, UserRegistrationView

urlpatterns = [
    path("register/", UserRegistrationView.as_view(), name="register"),
    path("login/", auth_views.LoginView.as_view(), name="login"),
    path("logout/", auth_views.LogoutView.as_view(), name="logout"),
    path("users/", UserListView.as_view(), name="users"),
]
