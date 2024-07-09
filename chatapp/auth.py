from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async

User = get_user_model()


class WebSocketBasicAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        if scope["type"] == "websocket":
            query_params = parse_qs(scope["query_string"].decode())
            if "username" in query_params and "password" in query_params:
                username = query_params["username"][0]
                password = query_params["password"][0]

                user = await self.authenticate_user(username, password)
                if user is None:
                    await send(
                        {
                            "type": "websocket.close",
                            "code": 4001,
                        }
                    )
                    return

                scope["user"] = user

        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def authenticate_user(self, username, password):
        try:
            user = User.objects.get(username=username)
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            pass
        return None
