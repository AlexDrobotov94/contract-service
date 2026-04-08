---
name: @kvint/core AMQP pattern
description: Kvint-internal AMQP abstraction (@kvint/core) used instead of amqplib/golevelup — signals RabbitMQ transport and maps to asyncapi contract type
type: project
---

In kvint services, RabbitMQ may be implemented via @kvint/core helpers rather than the standard packages listed in the skill (amqplib, @golevelup/nestjs-rabbitmq).

Key functions from @kvint/core that confirm RabbitMQ transport:
- getAmqpDefaultChannel()
- initAmqpConsumer(channel, queueHandlerMap)
- publishAmqpMessage(correlationId, message, options)

When these appear in source/dist files, classify the transport as asyncapi (RabbitMQ messaging).

**Why:** The skill's package detection table doesn't include @kvint/core, but the usage pattern (subscribe + publish to named queues) confirms active RabbitMQ messaging.

**How to apply:** Add @kvint/core as an implicit signal for asyncapi/RabbitMQ when scanning kvint services. Look for initAmqpConsumer and publishAmqpMessage as the definitive confirmation of active queue transport.
