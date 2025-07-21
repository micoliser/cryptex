from django.contrib import admin
from .models import Transaction

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('seller', 'vendor', 'asset', 'amount', 'status', 'transaction_hash')
    list_filter = ('status',)
    search_fields = ('seller__username', 'vendor__user__username', 'asset__symbol', 'transaction_hash')
