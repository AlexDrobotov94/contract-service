---
name: Chat Service RabbitMQ Topology
description: RabbitMQ messaging pattern used by chat-service — request-reply via direct queues, no exchanges, dynamic bot instance queues
type: project
---

Chat-service uses a **request-reply pattern with direct queues** (no named exchanges — publishToQueue goes straight to queue names).

**Queues:**
- `kv.chat-service.dev.replies` — inbound replies queue owned by chat-service
- `kv.dialer.rabbitmq` — outbound queue for dialing tasks (to dialer service)
- `{instanceQueue}` — dynamic per-bot-instance queue (resolved at runtime)

**Published messages (send):**
- `DialingTaskEnvelope` → `kv.dialer.rabbitmq`, pattern: `dialing_task`, correlationId = sessionId
- `HandleMessageRequestEnvelope` → `{instanceQueue}`, pattern: `handle_message`
- `CloseSessionRequestEnvelope` → `{instanceQueue}`, pattern: `close_session`
All outbound messages carry `replyTo: kv.chat-service.dev.replies`.

**Consumed messages (receive):**
- `CreateSessionReplyEnvelope` ← `kv.chat-service.dev.replies`, pattern: `create_session`
- `HandleMessageReplyEnvelope` ← `kv.chat-service.dev.replies`, pattern: `handle_message`
- `CloseSessionReplyEnvelope` ← `kv.chat-service.dev.replies`, pattern: `close_session` (no-op in source — switch case exists with `// TODO` comment; NOT a scan entry but modeled in rabbitmq.yaml for completeness)

**Why:** Bot and dialer services are separate processes; the reply queue decouples them from direct HTTP calls.
**How to apply:** When updating this spec, expect all future bot task types to follow the same envelope pattern with `pattern` + `data` + `correlationId` + `replyTo` fields.
