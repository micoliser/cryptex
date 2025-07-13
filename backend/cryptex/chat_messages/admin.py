from django.contrib import admin
from .models import ChatMessage

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('transaction', 'sender', 'recipient', 'content', 'created_at')
    search_fields = ('sender__username', 'recipient__username', 'content')
    list_filter = ('created_at',)
