from django.contrib import admin

from .models import Interest, User

# Register your models here.

admin.site.register(User)


@admin.register(Interest)
class InterestAdminClass(admin.ModelAdmin):
    list_display = ["sender", "receiver", "message", "accepted"]
