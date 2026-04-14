# Memory Index

- [Chat Service RabbitMQ Topology](project_chat_service_rabbitmq.md) — request-reply pattern, direct queues, dynamic bot instance queues, kv.chat-service.dev.replies
- [Kvint Queue Naming Convention](project_kvint_queue_naming.md) — kv.<service>.<env>.<purpose> pattern observed in chat-service
- [Kvint RabbitMQ Envelope Schema Pattern](project_envelope_schema_pattern.md) — pattern+data+correlationId+replyTo envelope shape, NestJS @MessagePattern origin
- [Dialer Service RabbitMQ Topology](project_dialer_service_rabbitmq.md) — 5 consume queues, 2 send queues, gzip+RmqCeleryPacket envelope, Go go-rabbitmq library
