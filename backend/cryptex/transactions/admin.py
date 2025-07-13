from django.contrib import admin
from .models import Transaction

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('buyer', 'vendor', 'asset', 'amount', 'status')
    list_filter = ('status',)
    search_fields = ('buyer__username', 'vendor__user__username', 'asset__symbol')
