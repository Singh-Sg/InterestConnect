import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from chatapp.models import ChatMessage

User = get_user_model()

logger = logging.getLogger(__name__)


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        logger.debug("Attempting to connect WebSocket")
        self.user = self.scope["user"]

        if not self.user.is_authenticated:
            logger.debug("User not authenticated, closing WebSocket")
            await self.close()
            return

        self.other_user_id = self.scope["url_route"]["kwargs"]["user_id"]
        self.other_user = await self.get_user(self.other_user_id)

        if not self.other_user:
            logger.debug("Other user not found, closing WebSocket")
            await self.close()
            return

        self.room_group_name = f"chat_{min(self.user.id, self.other_user.id)}_{max(self.user.id, self.other_user.id)}"
        logger.debug(f"User {self.user.id} connected to room {self.room_group_name}")

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()
        logger.debug("WebSocket connection accepted")

    async def disconnect(self, close_code):
        logger.debug(f"WebSocket disconnected with code {close_code}")
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        logger.debug(f"Message received: {text_data}")
        if not text_data:
            logger.debug("No data received, closing WebSocket")
            await self.close()
            return

        try:
            text_data_json = json.loads(text_data)
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
            await self.close()
            return

        message = text_data_json.get("message")
        if not message:
            logger.debug("No message found in JSON, closing WebSocket")
            await self.close()
            return

        await self.save_message(message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "chat_message", "message": message, "sender": self.user.username},
        )

    async def chat_message(self, event):
        message = event["message"]
        sender = event["sender"]
        logger.debug(f"Sending message: {message} from {sender}")

        await self.send(text_data=json.dumps({"message": message, "sender": sender}))

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            logger.error(f"User with ID {user_id} does not exist")
            return None

    @database_sync_to_async
    def save_message(self, message):
        ChatMessage.objects.create(
            sender=self.user, receiver=self.other_user, message=message
        )
