"""
ASGI config for Backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

from chatapp.auth import WebSocketBasicAuthMiddleware
from chatapp.routing import websocket_urlpatterns

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Backend.settings")

# application = get_asgi_application()

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": WebSocketBasicAuthMiddleware(
            ProtocolTypeRouter({"websocket": URLRouter(websocket_urlpatterns)})
        ),
    }
)

ASGI_APPLICATION = "Backend.asgi.application"
