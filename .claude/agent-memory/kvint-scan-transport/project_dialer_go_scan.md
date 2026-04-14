---
name: kvint-dialer-go transport scan
description: Go service (not NestJS), uses github.com/wagslane/go-rabbitmq + gorilla/websocket; transports: asyncapi (RabbitMQ consumers) + websocket (inbound audio streaming for Twilio/WebDirect telephony)
type: project
---

kvint-dialer-go is a pure Go service with no web framework. Scanned 2026-04-14.

Transports confirmed active:
- **asyncapi (RabbitMQ)**: 5 consumers registered in bootstrap — MainConsumer (tasks queue), GetTasksByServerConsumer (per-server tasks queue), BotAnswersConsumer (bot replies queue), ConsumeRequests (API control queue kv.container.{ServerName}.api), ListenRmqQueue (direct bot API queue {MainQueue}.direct_bot_api)
- **websocket**: gorilla/websocket server on port cfg.App.WebAudioPort (default 50002), route /{callId} — inbound audio stream from Twilio and web-audio telephony clients. Events: start/audio/mark/clear/log/call_stopped (WebDirect) and connected/start/media/mark/stop/clear (Twilio).

Not active:
- HTTP REST (no http.ListenAndServe for API; pprof server is commented out)
- gRPC (no grpc imports)
- GraphQL (no graphql imports)

gobwas/ws is used as an outbound WebSocket CLIENT to VAD/EM upstream services — not an inbound entry point.

**Why:** The skill only covers NestJS/Express. For Go, transport detection relied on manual pattern matching of rabbitmq.NewConsumer() calls and gorilla/websocket upgrader.Upgrade() calls.
**How to apply:** When scanning other Go services in kvint, look for rabbitmq.NewConsumer calls and websocket.Upgrader usage directly. The pkg/rabbitmq/rabbitmq.go wrapper pattern (GetConsumer, GetTasksConsumer, etc.) is common in kvint Go services.
