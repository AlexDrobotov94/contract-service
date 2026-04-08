# Components Object, Operation Traits, Message Traits

## Components Object

Хранит переиспользуемые определения. Все объекты в `components` доступны через `$ref`.

| Поле                | Тип                                             | Описание                  |
| ------------------- | ----------------------------------------------- | ------------------------- |
| `schemas`           | Map[string → Schema Object \| $ref]             | Схемы данных              |
| `servers`           | Map[string → Server Object \| $ref]             | Серверы                   |
| `channels`          | Map[string → Channel Object \| $ref]            | Каналы                    |
| `operations`        | Map[string → Operation Object \| $ref]          | Операции                  |
| `messages`          | Map[string → Message Object \| $ref]            | Сообщения                 |
| `securitySchemes`   | Map[string → Security Scheme Object \| $ref]    | Схемы безопасности        |
| `parameters`        | Map[string → Parameter Object \| $ref]          | Параметры каналов         |
| `correlationIds`    | Map[string → CorrelationID Object \| $ref]      | Идентификаторы корреляции |
| `replies`           | Map[string → Operation Reply Object \| $ref]    | Объекты ответов           |
| `replyAddresses`    | Map[string → Operation Reply Address \| $ref]   | Адреса ответов            |
| `operationTraits`   | Map[string → Operation Trait Object \| $ref]    | Трейты операций           |
| `messageTraits`     | Map[string → Message Trait Object \| $ref]      | Трейты сообщений          |
| `serverBindings`    | Map[string → Server Bindings Object \| $ref]    | Биндинги серверов         |
| `channelBindings`   | Map[string → Channel Bindings Object \| $ref]   | Биндинги каналов          |
| `operationBindings` | Map[string → Operation Bindings Object \| $ref] | Биндинги операций         |
| `messageBindings`   | Map[string → Message Bindings Object \| $ref]   | Биндинги сообщений        |

> Ключи в `components` должны соответствовать паттерну: `^[a-zA-Z0-9\.\-_]+$`

### Соглашения по именованию ключей

- **Schemas**: PascalCase — `UserCreated`, `OrderPayload`
- **Messages**: PascalCase — `UserCreatedMessage`, `OrderPlacedEvent`
- **MessageTraits / OperationTraits**: camelCase — `commonHeaders`, `deadLetterPolicy`
- **Parameters / CorrelationIds**: camelCase — `userId`, `correlationId`
- **Bindings**: camelCase — `amqpExchange`, `socketioNamespace`

### Пример Components

```yaml
components:
  schemas:
    UserId:
      type: string
      format: uuid
      description: Unique user identifier

    Timestamp:
      type: string
      format: date-time
      description: ISO 8601 timestamp

    UserProfile:
      type: object
      required:
        - id
        - email
      properties:
        id:
          $ref: "#/components/schemas/UserId"
        email:
          type: string
          format: email
        createdAt:
          $ref: "#/components/schemas/Timestamp"

  messages:
    UserCreated:
      name: UserCreated
      contentType: application/json
      traits:
        - $ref: "#/components/messageTraits/commonHeaders"
      payload:
        $ref: "#/components/schemas/UserProfile"
      correlationId:
        $ref: "#/components/correlationIds/defaultCorrelationId"

  messageTraits:
    commonHeaders:
      headers:
        type: object
        properties:
          correlationId:
            type: string
            description: Request correlation ID
          x-source-service:
            type: string
            description: Name of the service that published the message
          x-timestamp:
            type: string
            format: date-time

  operationTraits:
    withAck:
      bindings:
        amqp:
          ack: true

  correlationIds:
    defaultCorrelationId:
      description: Default correlation ID from message header
      location: $message.header#/correlationId

  parameters:
    userId:
      description: User identifier
      location: $message.payload#/userId
```

---

## Operation Trait Object

Описывает переиспользуемые свойства операции. **Не может содержать** `action`, `channel`, `messages`, `traits`.

| Поле           | Тип                           | Описание                    |
| -------------- | ----------------------------- | --------------------------- |
| `title`        | string                        | Заголовок                   |
| `summary`      | string                        | Краткое описание            |
| `description`  | string                        | Полное описание             |
| `security`     | [Security Requirement Object] | Требования безопасности     |
| `tags`         | [Tag Object]                  | Теги                        |
| `externalDocs` | ExternalDocs Object           | Внешняя документация        |
| `bindings`     | Operation Bindings Object     | Protocol-specific настройки |

### Пример Operation Traits

```yaml
components:
  operationTraits:
    # Трейт для операций с подтверждением (ACK)
    withAcknowledgement:
      description: Operation requires explicit acknowledgement
      bindings:
        amqp:
          ack: true

    # Трейт для аудита
    auditable:
      tags:
        - name: audit
          description: This operation is tracked for compliance

    # Трейт для защищённых операций
    secured:
      security:
        - type: httpApiKey
          in: user
          name: Authorization

# Применение трейта к операции
operations:
  processOrder:
    action: receive
    channel:
      $ref: "#/channels/orders"
    traits:
      - $ref: "#/components/operationTraits/withAcknowledgement"
      - $ref: "#/components/operationTraits/auditable"
    # Собственные поля операции перекрывают трейты
    description: Process incoming order
```

---

## Message Trait Object

Описывает переиспользуемые свойства сообщения. **Не может содержать** `payload` и `traits`.

| Поле            | Тип                                                | Описание                    |
| --------------- | -------------------------------------------------- | --------------------------- |
| `headers`       | Schema Object \| MultiFormat Schema Object \| $ref | Схема заголовков            |
| `correlationId` | CorrelationID Object \| $ref                       | Идентификатор корреляции    |
| `contentType`   | string                                             | MIME-тип                    |
| `name`          | string                                             | Имя сообщения               |
| `title`         | string                                             | Заголовок                   |
| `summary`       | string                                             | Краткое описание            |
| `description`   | string                                             | Полное описание             |
| `tags`          | [Tag Object]                                       | Теги                        |
| `externalDocs`  | ExternalDocs Object                                | Внешняя документация        |
| `bindings`      | Message Bindings Object                            | Protocol-specific настройки |
| `examples`      | [Message Example Object]                           | Примеры                     |

### Пример Message Traits

```yaml
components:
  messageTraits:
    # Общие заголовки для всех сообщений сервиса
    commonHeaders:
      headers:
        type: object
        required:
          - correlationId
        properties:
          correlationId:
            type: string
            description: Unique ID for request tracing
          x-source-service:
            type: string
            description: Source service name
          x-schema-version:
            type: string
            description: Schema version (e.g. "1.0.0")
      correlationId:
        location: $message.header#/correlationId

    # Трейт для событий (events)
    eventMetadata:
      contentType: application/json
      tags:
        - name: event
      bindings:
        amqp:
          contentEncoding: UTF-8
          messageType: event

# Применение трейта к сообщению
components:
  messages:
    OrderCreated:
      name: OrderCreated
      traits:
        - $ref: '#/components/messageTraits/commonHeaders'
        - $ref: '#/components/messageTraits/eventMetadata'
      payload:
        type: object
        properties:
          orderId:
            type: string
```

---

## Механизм мержа трейтов

Трейты применяются в порядке из массива. Правила мержа:

1. Поля трейта применяются **только если они не определены в основном объекте**.
2. Если несколько трейтов содержат одно и то же поле — побеждает **последний** трейт в массиве.
3. Основной объект (Message/Operation) всегда имеет **наивысший приоритет**.

```
Итоговый объект = merge(trait[0], trait[1], ..., trait[N], mainObject)
                         ↑ наименьший             ↑ наибольший приоритет
```

### Пример мержа

```yaml
# Трейт
messageTraits:
  base:
    contentType: application/json
    headers:
      type: object
      properties:
        correlationId:
          type: string

# Сообщение
messages:
  MyMessage:
    traits:
      - $ref: "#/components/messageTraits/base"
    contentType: text/plain # перекрывает трейт → итог: text/plain
    payload:
      type: string

# Итоговое сообщение после мержа:
# contentType: text/plain      ← из сообщения (выше приоритет)
# headers: { correlationId }   ← из трейта (сообщение не переопределяло)
# payload: { type: string }    ← только в сообщении
```
