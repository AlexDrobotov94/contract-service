# gRPC Transport Detection Patterns

Patterns for detecting gRPC services in NestJS and Express/Node services.

---

## Detection Signals

gRPC presence is confirmed when **all three** of the following are true:
1. `@grpc/grpc-js` (or the older `grpc` package) is in `dependencies`
2. `.proto` files exist in the repository
3. The service is actually wired to serve or call gRPC (not just a client)

A service that only has `@grpc/proto-loader` + `@grpc/grpc-js` as dependencies might be just a **gRPC client** (consuming another service), not a server. Confirm by reading bootstrap code.

---

## NestJS gRPC Server

### Bootstrap detection

```typescript
import { Transport } from '@nestjs/microservices';

// Standalone gRPC microservice
NestFactory.createMicroservice(AppModule, {
  transport: Transport.GRPC,
  options: {
    package: 'orders',                   // proto package name
    protoPath: join(__dirname, 'orders.proto'),
    url: '0.0.0.0:5000',
  },
});

// Hybrid: HTTP + gRPC
app.connectMicroservice({
  transport: Transport.GRPC,
  options: {
    package: 'hero',
    protoPath: join(__dirname, '../hero/hero.proto'),
  },
});
```

### Service implementation

```typescript
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';

@Controller()
export class OrdersController {

  @GrpcMethod('OrdersService', 'GetOrder')
  getOrder(data: GetOrderRequest): OrderResponse {}

  @GrpcMethod('OrdersService')   // method name inferred from function name
  createOrder(data: CreateOrderRequest): OrderResponse {}

  @GrpcStreamMethod('OrdersService', 'StreamOrders')
  streamOrders(messages: Observable<GetOrderRequest>): Observable<OrderResponse> {}
}
```

**What to extract:**
- `@GrpcMethod(serviceName, methodName?)` → the RPC method being implemented
- `@GrpcStreamMethod` → streaming RPC
- Parameter type → request message schema
- Return type → response message schema

---

## Proto Files — Primary Source of Truth

When `.proto` files are found, they are the authoritative contract. Always read them in full.

### Locating proto files

Search for `*.proto` across the entire repository:
- `src/**/*.proto`
- `proto/**/*.proto`
- Root directory `*.proto`

Also check `NestFactory.createMicroservice` options for the `protoPath` value — it may be a runtime path, but look for the corresponding source file.

### Extracting the gRPC contract

```protobuf
syntax = "proto3";
package orders;

// Service definition — these are the RPC endpoints
service OrdersService {
  rpc GetOrder (GetOrderRequest) returns (OrderResponse);
  rpc CreateOrder (CreateOrderRequest) returns (OrderResponse);
  rpc StreamOrders (GetOrderRequest) returns (stream OrderResponse);
  rpc BulkCreate (stream CreateOrderRequest) returns (OrderResponse);
}

// Message definitions — these are the schemas
message GetOrderRequest {
  string order_id = 1;
}

message CreateOrderRequest {
  string customer_id = 1;
  repeated OrderItem items = 2;
  double total = 3;
}

message OrderItem {
  string product_id = 1;
  int32 quantity = 2;
}

message OrderResponse {
  string id = 1;
  OrderStatus status = 2;
  string created_at = 3;
}

enum OrderStatus {
  PENDING = 0;
  CONFIRMED = 1;
  SHIPPED = 2;
}
```

**Streaming patterns:**
- `rpc Method(Req) returns (Resp)` → unary (standard)
- `rpc Method(Req) returns (stream Resp)` → server streaming
- `rpc Method(stream Req) returns (Resp)` → client streaming
- `rpc Method(stream Req) returns (stream Resp)` → bidirectional streaming

### Proto → Kvint type mappings

| Proto type     | JSON Schema / OpenAPI type                   |
|----------------|----------------------------------------------|
| `string`       | `{ type: string }`                           |
| `int32/int64`  | `{ type: integer }`                          |
| `float/double` | `{ type: number }`                           |
| `bool`         | `{ type: boolean }`                          |
| `bytes`        | `{ type: string, format: byte }`             |
| `repeated T`   | `{ type: array, items: <T> }`                |
| `map<K, V>`    | `{ type: object, additionalProperties: <V> }` |
| `enum`         | `{ type: integer, enum: [0, 1, 2] }`         |
| `message`      | nested object (recurse)                      |
| `optional`     | field is not in `required[]`                 |
| `oneof`        | `oneOf` / discriminated union                |

---

## Standalone Node.js gRPC (Express or custom)

When gRPC is used without NestJS microservices (raw `@grpc/grpc-js`):

```typescript
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const packageDefinition = protoLoader.loadSync('orders.proto');
const proto = grpc.loadPackageDefinition(packageDefinition) as any;

// Server
const server = new grpc.Server();
server.addService(proto.orders.OrdersService.service, {
  GetOrder: (call, callback) => { /* handler */ },
  CreateOrder: (call, callback) => { /* handler */ },
});
server.bindAsync('0.0.0.0:5000', grpc.ServerCredentials.createInsecure(), () => {
  server.start();
});
```

**What to extract:**
- `server.addService(ServiceDefinition, implementation)` → which service is being served
- Handler function names → RPC method names (check they match proto definitions)
- Always cross-reference with the `.proto` file

---

## Output Format

```
gRPC service: OrdersService  (proto: src/proto/orders.proto)
  Unary RPCs:
    GetOrder(GetOrderRequest) → OrderResponse
    CreateOrder(CreateOrderRequest) → OrderResponse
  Server streaming:
    StreamOrders(GetOrderRequest) → stream OrderResponse

Messages:
  GetOrderRequest: { order_id: string }
  CreateOrderRequest: { customer_id: string, items: OrderItem[], total: number }
  OrderItem: { product_id: string, quantity: integer }
  OrderResponse: { id: string, status: OrderStatus, created_at: string }
  OrderStatus: enum [PENDING=0, CONFIRMED=1, SHIPPED=2]
```

Contract path convention for `metadata/service.yaml`:
```yaml
contracts:
  - protocol: grpc
    path: grpc/orders.proto
```

---

## Output JSON shape (`endpoint` field)

Each RPC method in the `.proto` file produces one `TransportEntry` with `endpoint.kind = "grpc"`. Источник истины — `.proto` файл, а не TypeScript-реализация.

```json
{
  "contractType": "grpc",
  "file": "src/proto/orders.proto",
  "symbol": {
    "kind": "method",
    "name": "GetOrder",
    "startLine": 6,
    "endLine": 6
  },
  "evidence": {
    "matchedPattern": "rpc GetOrder",
    "snippet": "rpc GetOrder (GetOrderRequest) returns (OrderResponse);"
  },
  "endpoint": {
    "kind": "grpc",
    "serviceName": "OrdersService",
    "methodName": "GetOrder",
    "streaming": "unary",
    "requestType": "GetOrderRequest",
    "responseType": "OrderResponse",
    "protoFile": "src/proto/orders.proto"
  }
}
```

**Правила заполнения `endpoint`:**
- `streaming` — определяй по сигнатуре в `.proto`:
  - `rpc M(Req) returns (Resp)` → `"unary"`
  - `rpc M(Req) returns (stream Resp)` → `"server-streaming"`
  - `rpc M(stream Req) returns (Resp)` → `"client-streaming"`
  - `rpc M(stream Req) returns (stream Resp)` → `"bidirectional"`
- `protoFile` — путь относительно `scannedDir`
- `symbol.file` = путь к `.proto` файлу (не к TypeScript-реализации)
