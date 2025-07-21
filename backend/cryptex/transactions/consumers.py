from channels.generic.websocket import AsyncWebsocketConsumer
import json

class TradeConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        route_kwargs = self.scope["url_route"]["kwargs"]
        if "trade_id" in route_kwargs:
            self.trade_id = route_kwargs["trade_id"]
            self.room_group_name = f"trade_{self.trade_id}"
        elif "vendor_id" in route_kwargs:
            self.vendor_id = route_kwargs["vendor_id"]
            self.room_group_name = f"vendor_{self.vendor_id}"
        else:
            await self.close()
            return
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except Exception:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "trade_message",
                    "message": text_data,
                }
            )
            return

        if data.get("type") == "chat_message":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": data,
                }
            )
        else:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "trade_message",
                    "message": json.dumps(data),
                }
            )
            
    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event["message"]))

    async def trade_message(self, event):
        await self.send(text_data=event["message"])
        
    async def transaction_cancelled(self, event):
        await self.send(
            text_data=json.dumps({
                "type": "transaction_cancelled",
                "cancelled_by": event.get("cancelled_by", "system"),
                "trade_id": event["trade_id"],
                "message": event["message"],
            })
        )

    async def trade_created(self, event):
        await self.send(
            text_data=json.dumps({
                "type": "trade_started",
                "trade": event["trade"],
            })
        )