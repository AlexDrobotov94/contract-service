export type ContractType =
  | "openapi"
  | "asyncapi"
  | "grpc"
  | "graphql"
  | "websocket"
  | "unknown";

// --- Endpoint metadata (one per operation) ---

export interface HttpEndpointMeta {
  kind: "http";
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD" | "ALL";
  path: string; // полный путь: globalPrefix + controllerPrefix + methodPath
  pathParams: string[]; // ["id", "orderId"]
  queryParams: string[]; // ["page", "limit"]
  hasBody: boolean;
  bodyType?: string; // "CreateUserDto"
  responseType?: string; // "UserDto" | "Promise<UserDto[]>"
  auth?: string; // "JwtAuthGuard" | "public" | undefined (unknown)
}

export interface MessagingChannelMeta {
  kind: "messaging";
  technology: "rabbitmq" | "kafka" | "redis" | "nats" | "bull" | "unknown";
  interaction: "request-reply" | "event" | "job";
  pattern: string; // routing key, topic, queue name, или job name
  exchange?: string; // для RabbitMQ
  queue?: string; // имя очереди
  payloadType?: string; // "OrderCreatedEvent"
  replyType?: string; // для request-reply
}

export interface GrpcMethodMeta {
  kind: "grpc";
  serviceName: string; // "OrdersService"
  methodName: string; // "GetOrder"
  streaming: "unary" | "server-streaming" | "client-streaming" | "bidirectional";
  requestType: string; // "GetOrderRequest"
  responseType: string; // "OrderResponse"
  protoFile: string; // путь к .proto файлу, относительно scannedDir
}

export interface GraphQLOperationMeta {
  kind: "graphql";
  operation: "query" | "mutation" | "subscription";
  name: string; // "getOrder"
  args: Array<{ name: string; type: string; nullable: boolean }>;
  returnType: string; // "Order" | "[Order!]!"
}

export interface WebSocketEventMeta {
  kind: "websocket";
  library: "socket.io" | "ws" | "unknown"; // важно для AsyncAPI binding
  event: string; // "createOrder", "orderUpdated"
  direction: "inbound" | "outbound";
  namespace?: string; // socket.io namespaces ("/orders")
  payloadType?: string; // "CreateOrderDto"
  ackType?: string; // socket.io acknowledgement (только для inbound)
}

export type EndpointMeta =
  | HttpEndpointMeta
  | MessagingChannelMeta
  | GrpcMethodMeta
  | GraphQLOperationMeta
  | WebSocketEventMeta;

// --- Core scan types ---

export interface TransportEntry {
  contractType: ContractType;
  file: string; // относительно scannedDir
  symbol: {
    kind: "class" | "function" | "method";
    name: string;
    startLine: number;
    endLine: number;
  };
  evidence: {
    matchedPattern: string; // точная строка из скилла, по которой сработал матч
    snippet: string; // 1–3 строки исходного кода
  };
  endpoint: EndpointMeta; // детали конкретной операции
}

export interface TransportScanResult {
  createdAt: string; // ISO 8601, например "2026-03-27T14-32-05Z"
  scannedDir: string; // абсолютный путь
  framework: string;

  /** Для параллельного запуска субагентов — только непустые ключи */
  byContractType: Partial<Record<ContractType, TransportEntry[]>>;

  /** Для логов и отладки */
  all: TransportEntry[];

  /** Оркестратор логирует и не запускает субагентов для этих записей */
  warnings: Array<{
    message: string; // что найдено и почему не классифицировано
    file: string;
    snippet: string;
  }>;
}
