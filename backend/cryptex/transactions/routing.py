from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/trade/(?P<trade_id>[\w\-]+)/$", consumers.TradeConsumer.as_asgi()),
    re_path(r"ws/vendor/(?P<vendor_id>[\w\-]+)/$", consumers.TradeConsumer.as_asgi()),
]