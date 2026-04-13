# Protocol Bindings

Биндинги добавляют protocol-specific детали к объектам AsyncAPI. Используются в четырёх уровнях: `servers`, `channels`, `operations`, `messages`.

```yaml
bindings:
  <protocol-name>:
    # поля биндинга
    bindingVersion: "0.3.0" # опционально, по умолчанию "latest"
```

---

## AMQP 0-9-1 Bindings (RabbitMQ)

Версия биндинга: `0.3.0`

### Channel Binding Object (amqp)

| Поле                  | Тип                                                                 | Описание                                          |
| --------------------- | ------------------------------------------------------------------- | ------------------------------------------------- |
| `is`                  | `"routingKey"` \| `"queue"`                                         | Тип канала. Default: `"routingKey"`               |
| `exchange`            | Exchange Object                                                     | Настройки exchange (когда `is: routingKey`)       |
| `exchange.name`       | string                                                              | Имя exchange (max 255 символов)                   |
| `exchange.type`       | `"topic"` \| `"direct"` \| `"fanout"` \| `"default"` \| `"headers"` | Тип exchange                                      |
| `exchange.durable`    | boolean                                                             | Переживает перезапуск брокера                     |
| `exchange.autoDelete` | boolean                                                             | Удаляется когда отвязывается последняя очередь    |
| `exchange.vhost`      | string                                                              | Virtual host. Default: `/`                        |
| `queue`               | Queue Object                                                        | Настройки очереди (когда `is: queue`)             |
| `queue.name`          | string                                                              | Имя очереди (max 255 символов)                    |
| `queue.durable`       | boolean                                                             | Переживает перезапуск брокера                     |
| `queue.exclusive`     | boolean                                                             | Только одно соединение может использовать очередь |
| `queue.autoDelete`    | boolean                                                             | Удаляется при отключении последнего потребителя   |
| `queue.vhost`         | string                                                              | Virtual host. Default: `/`                        |
| `bindingVersion`      | string                                                              | Версия биндинга                                   |

```yaml
# Канал с routing key (exchange → routing key → queue)
channels:
  orderCreated:
    address: order.created
    bindings:
      amqp:
        is: routingKey
        exchange:
          name: orders-exchange
          type: topic
          durable: true
          autoDelete: false
          vhost: /

# Канал как очередь (прямое подключение)
channels:
  notificationsQueue:
    address: notifications
    bindings:
      amqp:
        is: queue
        queue:
          name: notifications-queue
          durable: true
          exclusive: false
          autoDelete: false
          vhost: /
```

### Operation Binding Object (amqp)

| Поле             | Тип          | Применимо     | Описание                                              |
| ---------------- | ------------ | ------------- | ----------------------------------------------------- |
| `expiration`     | integer (≥0) | send, receive | TTL сообщения в миллисекундах                         |
| `userId`         | string       | send, receive | Идентификатор отправителя                             |
| `cc`             | [string]     | send          | Routing keys для копий публикации                     |
| `priority`       | integer      | send, receive | Приоритет сообщения                                   |
| `deliveryMode`   | `1` \| `2`   | send, receive | `1` = transient (не персистируется), `2` = persistent |
| `mandatory`      | boolean      | receive       | Сообщение обязательно должно быть доставлено          |
| `bcc`            | [string]     | receive       | Скрытые routing keys (аналог cc)                      |
| `timestamp`      | boolean      | send, receive | Включить временную метку                              |
| `ack`            | boolean      | receive       | Требует явного подтверждения (ACK)                    |
| `bindingVersion` | string       |               | Версия биндинга                                       |

```yaml
operations:
  consumeOrder:
    action: receive
    channel:
      $ref: "#/channels/orderCreated"
    bindings:
      amqp:
        ack: true
        deliveryMode: 2
        priority: 5

  publishOrder:
    action: send
    channel:
      $ref: "#/channels/orderCreated"
    bindings:
      amqp:
        deliveryMode: 2
        timestamp: true
        cc: ["order.audit"]
```

### Message Binding Object (amqp)

| Поле              | Тип    | Описание                                          |
| ----------------- | ------ | ------------------------------------------------- |
| `contentEncoding` | string | MIME-кодировка payload (например `gzip`, `UTF-8`) |
| `messageType`     | string | Тип сообщения (например `order.created`)          |
| `bindingVersion`  | string | Версия биндинга                                   |

```yaml
messages:
  OrderCreated:
    bindings:
      amqp:
        contentEncoding: UTF-8
        messageType: order.created
        bindingVersion: "0.3.0"
```

---

## WebSocket Bindings

Версия биндинга: `0.1.0`

WebSocket — одно постоянное соединение, поэтому биндинги ограничены уровнем установления соединения (HTTP upgrade).

### Channel Binding Object (ws)

> Канал в WebSocket = само WebSocket-соединение.

| Поле             | Тип                   | Описание                                                   |
| ---------------- | --------------------- | ---------------------------------------------------------- |
| `method`         | `"GET"` \| `"POST"`   | HTTP-метод для upgrade-запроса                             |
| `query`          | Schema Object \| $ref | Схема query-параметров (type: object, properties required) |
| `headers`        | Schema Object \| $ref | Схема HTTP-заголовков при установлении соединения          |
| `bindingVersion` | string                | Версия биндинга                                            |

> **Server/Operation/Message bindings** для WebSocket зарезервированы, без полей — не используй.

```yaml
channels:
  rootNamespace:
    address: /
    bindings:
      ws:
        method: GET
        query:
          type: object
          properties:
            token:
              type: string
              description: JWT auth token
        headers:
          type: object
          properties:
            Authorization:
              type: string
        bindingVersion: "0.1.0"
```

### Socket.IO особенности

AsyncAPI не имеет официального Socket.IO биндинга — Socket.IO работает поверх WebSocket с собственным namespace/event протоколом. В проекте используется следующее соглашение:

```yaml
# Namespace Socket.IO → Server (один namespace = один сервер или описание в info)
# Event → Channel (address = имя события)
# Emit/On → Operation (action: send/receive)

asyncapi: 3.1.0
info:
  title: Chat Service Socket.IO Events
  version: 1.0.0

servers:
  socketio:
    host: "localhost:3000"
    protocol: ws
    pathname: /socket.io

channels:
  # Каждое событие = отдельный канал
  messageReceived:
    address: message:received
    description: Клиент получает новое сообщение
    messages:
      messageReceived:
        $ref: "#/components/messages/MessageReceived"

  messageCreate:
    address: message:create
    description: Клиент отправляет новое сообщение
    messages:
      messageCreate:
        $ref: "#/components/messages/MessageCreate"

operations:
  # Сервер отправляет клиенту
  sendMessageReceived:
    action: send
    channel:
      $ref: "#/channels/messageReceived"
    messages:
      - $ref: "#/channels/messageReceived/messages/messageReceived"

  # Сервер получает от клиента
  onMessageCreate:
    action: receive
    channel:
      $ref: "#/channels/messageCreate"
    messages:
      - $ref: "#/channels/messageCreate/messages/messageCreate"
```

---

### Native WebSocket (ws library) особенности

Нативный WebSocket использует **официальный AsyncAPI WebSocket binding** (`ws`). В отличие от Socket.IO, здесь нет неймспейсов и нативного ack-паттерна. Сообщения обычно содержат поле-дискриминатор `type` и поле `payload`.

```yaml
# Нативный WebSocket — паттерн с полем type

asyncapi: 3.1.0
info:
  title: Orders Service WebSocket API
  version: 1.0.0

servers:
  development:
    host: localhost:8080
    protocol: ws
    pathname: /ws
    description: Development server

channels:
  # Каждый тип сообщения = отдельный канал
  # Адрес = значение поля type в сообщении
  createOrder:
    address: createOrder
    description: Клиент создаёт новый заказ
    bindings:
      ws:
        bindingVersion: "0.1.0"
    messages:
      createOrder:
        $ref: "#/components/messages/CreateOrder"

  orderUpdated:
    address: orderUpdated
    description: Сервер уведомляет об обновлении заказа
    bindings:
      ws:
        bindingVersion: "0.1.0"
    messages:
      orderUpdated:
        $ref: "#/components/messages/OrderUpdated"

operations:
  onCreateOrder:
    action: receive
    channel:
      $ref: "#/channels/createOrder"
    messages:
      - $ref: "#/channels/createOrder/messages/createOrder"

  sendOrderUpdated:
    action: send
    channel:
      $ref: "#/channels/orderUpdated"
    messages:
      - $ref: "#/channels/orderUpdated/messages/orderUpdated"

components:
  messages:
    CreateOrder:
      name: CreateOrder
      title: Создать заказ
      summary: Клиент отправляет данные нового заказа
      payload:
        $ref: "#/components/schemas/CreateOrderPayload"

    OrderUpdated:
      name: OrderUpdated
      title: Заказ обновлён
      summary: Сервер уведомляет клиента об изменении статуса заказа
      payload:
        $ref: "#/components/schemas/OrderUpdatedPayload"

  schemas:
    CreateOrderPayload:
      type: object
      properties:
        type:
          type: string
          const: createOrder
        payload:
          type: object
          properties:
            items:
              type: array
              items:
                type: string
          required:
            - items
      required:
        - type
        - payload

    OrderUpdatedPayload:
      type: object
      properties:
        type:
          type: string
          const: orderUpdated
        payload:
          type: object
          properties:
            orderId:
              type: string
            status:
              type: string
          required:
            - orderId
            - status
      required:
        - type
        - payload
```

**Ключевые отличия от Socket.IO:**
- `protocol: ws` в servers (не `socketio`)
- Официальный `ws` binding на уровне channel — `bindings.ws.bindingVersion: "0.1.0"`
- Нет неймспейсов
- Нет ackType — acknowledgement моделируется как отдельный outbound-канал если нужен
- Адрес канала = значение поля `type` в JSON-сообщении (конвенция ws-сервисов в проекте)

---

## HTTP Bindings

Версия биндинга: `0.3.0`

Используется когда AsyncAPI описывает HTTP-взаимодействия (webhook, SSE, polling).

### Operation Binding Object (http)

| Поле             | Тип                   | Описание                                                                                   |
| ---------------- | --------------------- | ------------------------------------------------------------------------------------------ |
| `method`         | string                | HTTP-метод: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`, `CONNECT`, `TRACE` |
| `query`          | Schema Object \| $ref | Схема query-параметров (type: object с properties)                                         |
| `bindingVersion` | string                | Версия биндинга                                                                            |

### Message Binding Object (http)

| Поле             | Тип                   | Описание                                                  |
| ---------------- | --------------------- | --------------------------------------------------------- |
| `headers`        | Schema Object \| $ref | Схема HTTP-заголовков (type: object с properties)         |
| `statusCode`     | number                | HTTP статус ответа (RFC 9110). Только для Operation Reply |
| `bindingVersion` | string                | Версия биндинга                                           |

```yaml
operations:
  getUsers:
    action: send
    channel:
      $ref: "#/channels/users"
    bindings:
      http:
        method: GET
        query:
          type: object
          required:
            - page
          properties:
            page:
              type: integer
              minimum: 1
            limit:
              type: integer
              maximum: 100
        bindingVersion: "0.3.0"
```

---

## Поддерживаемые протоколы (полный список)

| Протокол              | Ключ в bindings |
| --------------------- | --------------- |
| AMQP 0-9-1 (RabbitMQ) | `amqp`          |
| AMQP 1.0              | `amqp1`         |
| HTTP                  | `http`          |
| WebSocket             | `ws`            |
| Kafka                 | `kafka`         |
| MQTT 3.x              | `mqtt`          |
| MQTT 5                | `mqtt5`         |
| NATS                  | `nats`          |
| JMS                   | `jms`           |
| SNS                   | `sns`           |
| SQS                   | `sqs`           |
| STOMP                 | `stomp`         |
| Redis                 | `redis`         |
| Google Cloud Pub/Sub  | `googlepubsub`  |
| IBM MQ                | `ibmmq`         |
| Solace                | `solace`        |
| Pulsar                | `pulsar`        |
