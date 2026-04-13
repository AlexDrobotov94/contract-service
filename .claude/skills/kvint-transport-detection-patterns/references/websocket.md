# WebSocket Transport Detection Patterns

Patterns for detecting WebSocket / real-time transports in NestJS and Express services.

---

## Detection Signals

WebSocket transport is present when you find any of:
- `@nestjs/websockets` in dependencies
- `socket.io` in dependencies (most common)
- `ws` in dependencies (native WebSocket)
- `@WebSocketGateway` decorator in source files
- `new Server()` from `socket.io` or `ws` in bootstrap code
- GraphQL subscriptions enabled (implicitly adds WebSocket — see graphql.md)

---

## NestJS WebSocket Gateways

### Gateway definition

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3001, {                  // optional separate port
  namespace: '/orders',                    // namespace (acts like a path prefix)
  cors: { origin: '*' },
  transports: ['websocket'],
})
@WebSocketGateway()                        // default: port from main app, namespace '/'
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {}
  handleDisconnect(client: Socket) {}

  @SubscribeMessage('createOrder')
  async handleCreateOrder(
    @MessageBody() dto: CreateOrderDto,
    @ConnectedSocket() client: Socket,
  ): Promise<OrderDto> {}

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.room);
  }
}
```

**What to extract:**
- `@WebSocketGateway(port?, options?)` → port, namespace (path), CORS config
- `@SubscribeMessage('eventName')` → event name (inbound message from client)
- `@MessageBody()` type → message payload schema
- Return type → acknowledgement / response schema (if the handler returns a value)
- `@WebSocketServer() server: Server` → confirms server-side gateway (not just client)
- Lifecycle hooks: `OnGatewayConnection`, `OnGatewayDisconnect` → connection events

### Server-push events (outbound)

NestJS gateways also emit events to clients. Search for `this.server.emit()` calls:

```typescript
// Broadcast to all connected clients
this.server.emit('orderUpdated', { orderId, status });

// Emit to a specific room
this.server.to('room-123').emit('orderUpdated', payload);
this.server.in('admin').emit('alert', { message });

// Emit to specific socket
client.emit('orderConfirmed', orderDto);
```

**What to extract:** event name (first argument), payload type (second argument).

### Adapter detection

NestJS defaults to socket.io. If `ws` adapter is used:

```typescript
// main.ts
import { WsAdapter } from '@nestjs/platform-ws';
app.useWebSocketAdapter(new WsAdapter(app));
```

This means native WebSocket protocol is used, not socket.io's custom protocol.

---

## Socket.io with Express

### Setup

```typescript
import { Server } from 'socket.io';
import { createServer } from 'http';

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
  transports: ['websocket', 'polling'],
});

// Namespace
const ordersNs = io.of('/orders');
```

### Event handlers

```typescript
io.on('connection', (socket: Socket) => {

  // Inbound events
  socket.on('createOrder', async (data: CreateOrderDto, callback) => {
    const order = await createOrder(data);
    callback(order);                  // acknowledgement
  });

  socket.on('joinRoom', (roomId: string) => {
    socket.join(roomId);
  });

  // Outbound (server-push)
  socket.emit('welcome', { message: 'Connected' });
  io.to(roomId).emit('orderUpdated', orderDto);
});
```

**What to extract:**
- `socket.on('eventName', handler)` → inbound event, payload type (handler first param)
- `callback` argument in handler → acknowledgement response schema
- `io.emit()` / `socket.emit()` / `io.to().emit()` → outbound event name, payload shape

---

## Native `ws` Library (Express or standalone)

```typescript
import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080, path: '/ws' });

wss.on('connection', (ws: WebSocket, request) => {
  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    // message.type → event type pattern
    ws.send(JSON.stringify({ type: 'ack', payload: {} }));
  });

  ws.send(JSON.stringify({ type: 'welcome', payload: { version: '1.0' } }));
});
```

With `ws`, there is usually a `type` field convention. Look for:
- `message.type` / `msg.event` / `msg.action` — the event discriminator field
- JSON.parse / JSON.stringify with typed interfaces → payload schema

---

## GraphQL Subscriptions (implicit WebSocket)

If GraphQL subscriptions are detected (see graphql.md), note that they run over WebSocket. The subscription channel does not need a separate contract entry, but the `service.yaml` should reflect it:

```yaml
# If the service has both GraphQL HTTP + subscriptions
contracts:
  - protocol: graphql
    path: graphql/schema.graphql   # covers both queries/mutations AND subscriptions
```

No separate `socket` entry is needed when WebSocket is solely used for GraphQL subscriptions.

---

## Определение библиотеки (`library`)

| Сигнал | library |
|--------|---------|
| `socket.io` в зависимостях или `new Server()` из `socket.io` | `"socket.io"` |
| `ws` в зависимостях и `new WebSocketServer()` из `ws` | `"ws"` |
| NestJS `@WebSocketGateway` без явного адаптера | `"socket.io"` (NestJS default) |
| NestJS `app.useWebSocketAdapter(new WsAdapter(app))` | `"ws"` |

---

## Output Format

```
WebSocket gateway: /orders  (socket.io, port 3001)
  Inbound events (client → server):
    createOrder    payload: CreateOrderDto → ack: OrderDto
    joinRoom       payload: { room: string }
    subscribeToUpdates  payload: { orderId: string }

  Outbound events (server → client):
    orderUpdated   payload: { orderId: string, status: OrderStatus }
    orderError     payload: { message: string, code: number }
    welcome        payload: { message: string }
```

Contract path convention for `metadata/service.yaml`:
```yaml
# Socket.IO (library: socket.io):
contracts:
  - protocol: socket
    path: asyncapi/socket.yaml

# Native WebSocket (library: ws):
contracts:
  - protocol: websocket
    path: asyncapi/websocket.yaml
```

---

## Output JSON shape (`endpoint` field)

Каждый `@SubscribeMessage` и каждый уникальный `server.emit()` / `client.emit()` в методе производят отдельный `TransportEntry` с `endpoint.kind = "websocket"`.

**Inbound (client → server):**
```json
{
  "contractType": "websocket",
  "file": "src/orders/orders.gateway.ts",
  "symbol": {
    "kind": "method",
    "name": "handleCreateOrder",
    "startLine": 22,
    "endLine": 28
  },
  "evidence": {
    "matchedPattern": "@SubscribeMessage('createOrder')",
    "snippet": "@SubscribeMessage('createOrder')\nasync handleCreateOrder(@MessageBody() dto: CreateOrderDto, @ConnectedSocket() client: Socket): Promise<OrderDto> {"
  },
  "endpoint": {
    "kind": "websocket",
    "library": "socket.io",
    "event": "createOrder",
    "direction": "inbound",
    "namespace": "/orders",
    "payloadType": "CreateOrderDto",
    "ackType": "OrderDto"
  }
}
```

**Outbound (server → client):**
```json
{
  "contractType": "websocket",
  "file": "src/orders/orders.gateway.ts",
  "symbol": {
    "kind": "method",
    "name": "notifyOrderUpdated",
    "startLine": 32,
    "endLine": 35
  },
  "evidence": {
    "matchedPattern": "this.server.emit('orderUpdated'",
    "snippet": "this.server.emit('orderUpdated', { orderId, status });"
  },
  "endpoint": {
    "kind": "websocket",
    "library": "socket.io",
    "event": "orderUpdated",
    "direction": "outbound",
    "namespace": "/orders",
    "payloadType": "{ orderId: string, status: OrderStatus }"
  }
}
```

**Правила заполнения `endpoint`:**
- `library` — см. таблицу «Определение библиотеки» выше
- `direction`:
  - `@SubscribeMessage` / `socket.on` → `"inbound"`
  - `server.emit()` / `io.emit()` / `client.emit()` / `socket.emit()` → `"outbound"`
- `namespace` — из `@WebSocketGateway({ namespace: '/orders' })` или `io.of('/orders')`
- `ackType` — тип возврата метода (для inbound с acknowledgement); у socket.io это `callback` в `socket.on`
- Если `server.emit()` вызывается из нескольких методов с одинаковым именем события — создавай одну запись (по первому найденному)
