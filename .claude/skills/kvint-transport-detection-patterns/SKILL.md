---
name: kvint-transport-detection-patterns
description: >
  Reference patterns for statically detecting transport protocols in microservice source code (NestJS, Express).
  Use this skill whenever you need to analyze a service codebase to determine which transports it exposes:
  HTTP REST, Messaging (RabbitMQ, Kafka, Redis), gRPC, GraphQL, or WebSocket.
  Trigger this skill when building agents that scan services, generate contracts, populate metadata/service.yaml
  contracts sections, or audit what protocols a service exposes. Also use when the user asks "what transports
  does this service use?", "does this service have a queue?", "what protocols does it expose?",
  or when generating AsyncAPI/OpenAPI specs from source code.
---

# Transport Detection Patterns

This skill provides a static-analysis playbook for detecting which transport protocols a microservice exposes.
It is a reference for agents that scan code — not an interactive workflow.

Supported frameworks: **NestJS**, **Express** (pattern stubs for Fastify/Hono included where applicable).

---

## Step 1: Framework Detection

Read `package.json` and extract `dependencies` + `devDependencies`:

| Package key               | Framework    |
|---------------------------|--------------|
| `@nestjs/core`            | NestJS       |
| `express`                 | Express      |
| `fastify`                 | Fastify      |
| `hono`                    | Hono         |
| `koa`                     | Koa          |

Also note microservice / transport adapters (they tell you which transports are likely active):

| Package key                        | Likely transport        |
|------------------------------------|-------------------------|
| `@nestjs/microservices`            | Messaging or gRPC       |
| `@golevelup/nestjs-rabbitmq`       | RabbitMQ (messaging)    |
| `amqplib`                          | RabbitMQ (messaging)    |
| `kafkajs`                          | Kafka (messaging)       |
| `ioredis` / `redis`                | Redis pub/sub           |
| `bull` / `bullmq`                  | Queue (Bull)            |
| `@grpc/grpc-js` / `@grpc/proto-loader` | gRPC              |
| `@nestjs/graphql` / `apollo-server-express` | GraphQL       |
| `graphql-yoga`                     | GraphQL                 |
| `socket.io`                        | WebSocket (Socket.io)   |
| `ws`                               | WebSocket (ws)          |
| `@nestjs/websockets`               | WebSocket (NestJS)      |

---

## Step 2: Locate Entry Point and Bootstrap

Read in this priority: `main.ts` → `index.ts` → `app.ts` → `server.ts`.

**NestJS bootstrap signals:**
```typescript
// HTTP server (default)
const app = await NestFactory.create(AppModule);

// Microservice transport
const app = await NestFactory.createMicroservice(AppModule, { transport: Transport.RMQ });

// Hybrid (HTTP + microservice)
const app = await NestFactory.create(AppModule);
app.connectMicroservice({ transport: Transport.KAFKA });
await app.startAllMicroservices();
```

**Express bootstrap signals:**
```typescript
const app = express();
app.listen(port);
```

---

## Step 3: Scan for Transports

Based on what you found in Steps 1–2, load only the relevant reference files below. If multiple transports are detected, load all applicable references.

| Transport   | Reference file                              | When to load                                             |
|-------------|---------------------------------------------|----------------------------------------------------------|
| HTTP REST   | `references/http.md`                        | Always — most services expose HTTP                       |
| Messaging   | `references/messaging.md`                   | `@nestjs/microservices`, `amqplib`, `kafkajs`, `bull*`   |
| gRPC        | `references/grpc.md`                        | `@grpc/grpc-js`, `@nestjs/microservices` + proto files  |
| GraphQL     | `references/graphql.md`                     | `@nestjs/graphql`, `apollo-server*`, `graphql-yoga`      |
| WebSocket   | `references/websocket.md`                   | `socket.io`, `ws`, `@nestjs/websockets`                  |

---

## Step 4: Build the Transports Inventory

After scanning, produce a structured list:

```
Detected transports:
  ✅ http      → src/controllers/, src/app.module.ts
  ✅ queue     → src/consumers/order.consumer.ts (RabbitMQ exchange: orders)
  ❌ grpc      → not detected
  ❌ graphql   → not detected
  ❌ socket    → not detected
```

Map each detected transport to its Kvint v1 `metadata/service.yaml` contract entry:

| Transport | protocol value | path convention                    |
|-----------|----------------|------------------------------------|
| HTTP REST | `http`         | `openapi/openapi.yaml`             |
| Messaging | `queue`        | `asyncapi/rabbitmq.yaml` or `asyncapi/kafka.yaml` |
| gRPC      | `grpc`         | `grpc/<service>.proto`             |
| GraphQL   | `graphql`      | `graphql/schema.graphql`           |
| WebSocket | `socket`       | `asyncapi/socket.yaml`             |

---

## Quality Rules

- Never assume a transport is present from a package alone — verify it is actually used (decorators, middleware registration, bootstrap code).
- If a package is in `devDependencies` only, it is not a runtime transport.
- If `@nestjs/microservices` is present but no `Transport.*` is configured in bootstrap, there is no microservice transport active.
- Read proto files to understand gRPC service contracts — don't summarize without reading.
- **Skip generated/dependency directories**: never scan `dist/`, `.next/`, or `node_modules/` — they contain compiled output and third-party code, not the service's own source.
