---
name: Kvint Queue Naming Convention
description: Queue name pattern observed across chat-service — kv.<service>.<env>.<purpose>
type: project
---

Queue names follow the pattern: `kv.<service-name>.<environment>.<purpose>`

Examples observed in chat-service:
- `kv.chat-service.dev.replies` — chat-service replies queue (dev env)
- `kv.dialer.rabbitmq` — dialer service queue (older style, no env segment)

**Why:** The `kv.` prefix is the Kvint namespace marker. The env segment (`dev`) allows multi-environment deployments to share the same broker without queue collisions.
**How to apply:** When generating queue names for new services, default to `kv.<service>.<env>.<purpose>`. If the env segment is absent in scan data, use the pattern as-is and note the discrepancy.
