from django.contrib import admin
from .models import Vendor

@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('user', 'display_name', 'rating', 'is_online')
    search_fields = ('user__username', 'display_name')
    list_filter = ('is_online',)
