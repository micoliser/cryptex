from django.contrib import admin
from .models import Asset


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ('name', 'symbol', 'description')
    search_fields = ('name', 'symbol')

