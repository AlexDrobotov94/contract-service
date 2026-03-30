---
name: chat-service transport scan
description: Transport profile of chat-service — NestJS with HTTP, WebSocket (Socket.IO), and RabbitMQ messaging via custom @kvint/core AMQP abstraction
type: project
---

chat-service (D:/kvint-for-contracts/chat-service/apps/chat-service) was scanned on 2026-03-29 from TypeScript source files.

Transports detected:
- openapi: ChatsController (@Controller('chats'), lines 33-119) + HealthController (@Controller('health'), lines 9-25)
- websocket: ChatsGateway (@WebSocketGateway({ namespace: '/chat' }), Socket.IO via custom SocketIoAdapter, lines 38-170)
  - Inbound events: chat:join, chat:leave, message:send, processing:catchup
  - Outbound events (server push via SocketIoRealtimePublisher): chat:updated, timeline:new, timeline:catchup, processing:updated, preview:new
- asyncapi: RabbitBotQueue + BotRepliesConsumer — RabbitMQ via custom @kvint/core AMQP helpers (getAmqpDefaultChannel, initAmqpConsumer, publishAmqpMessage), NOT via @golevelup/nestjs-rabbitmq or @nestjs/microservices

Queue names observed:
- kv.chat-service.dev.replies (inbound replies consumer)
- kv.dialer.rabbitmq (outbound dialing tasks publisher)
- Dynamic instance queues (outbound handle_message / close_session)

**Why:** Custom AMQP abstraction via @kvint/core means skill RabbitMQ patterns (amqplib direct, @golevelup decorators) don't match exactly — classified as asyncapi based on confirmed queue subscribe/publish behavior.

**How to apply:** When scanning other kvint services, check for @kvint/core imports (getAmqpDefaultChannel, initAmqpConsumer) as an additional RabbitMQ transport signal beyond what the skill lists.
