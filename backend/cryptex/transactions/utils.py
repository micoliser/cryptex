from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
        

def send_cancelled_notification(transaction, cancelled_by="system"):
    """Send a notification when a transaction is cancelled."""
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"trade_{str(transaction.id)}",
        {
            "type": "transaction_cancelled",
            "trade_id": str(transaction.id),
            "message": f"Transaction {transaction.id} has been cancelled.",
            "cancelled_by": cancelled_by
        },
    )