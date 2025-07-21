from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import Transaction
from .utils import send_cancelled_notification

@shared_task
def auto_cancel_inactive_trades():
    cutoff = timezone.now() - timedelta(minutes=10)
    untouched_trades = Transaction.objects.filter(
        status="pending",
        transaction_hash__isnull=True,
        value_paid_in_naira__isnull=True,
        created_at__lt=cutoff
    )
    print("Untouched trades to cancel:", untouched_trades.count())
    for trade in untouched_trades:
        print(f"Cancelling trade {trade.id} created at {trade.created_at}")
        trade.status = "cancelled"
        trade.save(update_fields=['status'])
        send_cancelled_notification(trade, cancelled_by="system") 
        
    if untouched_trades.exists():
        print(f"Auto-cancelled {untouched_trades.count()} untouched trades.")
