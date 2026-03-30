---
name: Kvint RabbitMQ Envelope Schema Pattern
description: Reusable envelope schema structure seen in chat-service — pattern discriminator + data + correlationId + replyTo
type: project
---

All RabbitMQ messages in Kvint services use an **envelope wrapper** with a consistent shape:

```
{
  pattern: string (enum, e.g. "dialing_task" | "handle_message" | "close_session")
  data: <domain-specific payload object>
  correlationId: string
  replyTo?: string  (present on request envelopes, absent on reply envelopes)
}
```

The `pattern` field acts as a discriminator — a single queue can carry multiple message types (e.g. `kv.chat-service.dev.replies` handles both `create_session` and `handle_message` replies).

**Why:** NestJS microservices use this envelope format natively for message routing via `@MessagePattern`.
**How to apply:** Always model the `pattern` field as a `string` with an `enum` constraint when generating schemas. Split multi-pattern queues into separate AsyncAPI messages under the same channel.
