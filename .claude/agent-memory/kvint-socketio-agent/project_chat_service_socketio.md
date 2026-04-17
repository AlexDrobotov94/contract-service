---
name: Chat Service Socket.IO patterns
description: Socket.IO event structure, namespaces, type sources, and channel ID conventions for the chat-service codebase
type: project
---

Chat-service uses a single Socket.IO namespace `/chat` for all real-time events. Types are defined in the shared `@kvint/chat-kit` package (monorepo: `packages/chat-kit/src/`).

Key source files:
- `packages/chat-kit/src/ws/requests.ts` — inbound payloads and ack types (ChatJoinPayload, MessageSendPayload, etc.) and `ChatClientToServerEvents` interface
- `packages/chat-kit/src/ws/events.ts` — outbound event types (ChatUpdatedEvent, TimelineCatchupEvent, etc.) and `ChatServerToClientEvents` interface
- `packages/chat-kit/src/ws/contract.ts` — generic `Ack<T>` wrapper
- `packages/chat-kit/src/model/timeline.ts` — TimelineItem (union of TimelineEventItem | TimelineMessageItem), uses Zod schemas
- `packages/chat-kit/src/model/message-processing.ts` — MessageProcessing with status enum (queued/completed/failed)
- `packages/chat-kit/src/errors/codes.ts` — ApiError and ErrorCode enum

**Pattern: Ack<T>** — all inbound events with acknowledgement use `Ack<T> = { ok: true; data: T } | { ok: false; error: ApiError }`. Render as `oneOf` with two branches in JSON Schema.

**Pattern: typed event maps** — the service uses `ChatClientToServerEvents` and `ChatServerToClientEvents` interfaces from `@kvint/chat-kit` for type safety. These are authoritative for the full event contract.

**Namespace**: all events belong to namespace `/chat`. Channel IDs in socket.yaml use `_` instead of `:` (e.g., `chat_join` for event `chat:join`). Channel `address` uses the original colon notation (`"chat:join"`).

**Events inventory (scan 2026-04-13 — confirmed current):**

Inbound (client → server):
- `chat:join` — payload: ChatJoinPayload `{chatId: string, since?: any|null}`, ack: ChatJoinAck = Ack<{}>
- `chat:leave` — payload: ChatLeavePayload `{chatId: string}`, no ack
- `message:send` — payload: MessageSendPayload `{chatId, clientMessageId, text}`, ack: MessageSendAck = Ack<MessageSendOk>
- `processing:catchup` — payload: ProcessingCatchupRequest `{chatId}`, ack: ProcessingCatchupAck = Ack<ProcessingCatchupOk>

Outbound (server → client):
- `timeline:catchup` — payload: TimelineCatchupEvent `{chatId, stateVersion, items: TimelineItem[]}` (emitted inside onJoin handler)
- `chat:updated` — payload: ChatUpdatedEvent `{chatId, stateVersion}`
- `timeline:new` — payload: TimelineItem (oneOf: TimelineEventItem | TimelineMessageItem)
- `processing:updated` — payload: MessageProcessing (full object with id, status enum, timestamps)
- `preview:new` — payload: PreviewNewEvent `{chatId, sessionId, text}`

**Note on `processing:catchup`**: this event appears in `ChatServerToClientEvents` as an outbound event too, but the 2026-04-13 scan only detected the inbound gateway handler — no outbound emit was found. The outbound variant is NOT in socket.yaml.

**socket.yaml location**: `packages/chat-service-module/asyncapi/socket.yaml`

**Why:** The Ack<T> pattern and typed event maps are the authoritative source — always check chat-kit ws/ files before assuming payload shapes from scan snippets alone.

**How to apply:** When regenerating socket.yaml for chat-service, read `packages/chat-kit/src/ws/` first rather than relying solely on scan snippets. The `processing:catchup` event in `ChatServerToClientEvents` (outbound) is a different event from the inbound `processing:catchup` — check the scan carefully; in this version only the inbound one appeared in the scan.
