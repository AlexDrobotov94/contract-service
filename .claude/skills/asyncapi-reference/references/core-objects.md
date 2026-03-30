# Core Objects: AsyncAPI, Info, Server, Channel, Operation

## AsyncAPI Object (корневой)

| Поле                 | Тип                                    | Обязательно | Описание                                                     |
| -------------------- | -------------------------------------- | ----------- | ------------------------------------------------------------ |
| `asyncapi`           | string                                 | **YES**     | Версия спецификации. Должна быть `3.1.0`                     |
| `id`                 | string (URI)                           | no          | Уникальный идентификатор приложения                          |
| `info`               | Info Object                            | **YES**     | Метаданные API                                               |
| `defaultContentType` | string                                 | no          | MIME-тип по умолчанию для сообщений без явного `contentType` |
| `servers`            | Map[string → Server Object \| $ref]    | no          | Серверы/брокеры                                              |
| `channels`           | Map[string → Channel Object \| $ref]   | no          | Каналы                                                       |
| `operations`         | Map[string → Operation Object \| $ref] | no          | Операции                                                     |
| `components`         | Components Object                      | no          | Переиспользуемые определения                                 |

---

## Info Object

| Поле             | Тип                 | Обязательно | Описание                                    |
| ---------------- | ------------------- | ----------- | ------------------------------------------- |
| `title`          | string              | **YES**     | Название API                                |
| `version`        | string              | **YES**     | Версия API (например `1.0.0`)               |
| `description`    | string              | no          | Описание (поддерживает CommonMark markdown) |
| `termsOfService` | string (URL)        | no          | Ссылка на условия использования             |
| `contact`        | Contact Object      | no          | Контактная информация                       |
| `license`        | License Object      | no          | Лицензия                                    |
| `tags`           | [Tag Object]        | no          | Теги для документации                       |
| `externalDocs`   | ExternalDocs Object | no          | Внешняя документация                        |

### Contact Object

| Поле    | Тип          | Описание     |
| ------- | ------------ | ------------ |
| `name`  | string       | Имя контакта |
| `url`   | string (URL) | URL контакта |
| `email` | string       | Email        |

### License Object

| Поле   | Тип          | Обязательно | Описание          |
| ------ | ------------ | ----------- | ----------------- |
| `name` | string       | **YES**     | Название лицензии |
| `url`  | string (URL) | no          | URL лицензии      |

### Пример Info Object

```yaml
info:
  title: User Events API
  version: 2.1.0
  description: API для событий пользователей
  contact:
    name: Platform Team
    email: platform@company.com
  license:
    name: Apache 2.0
    url: https://www.apache.org/licenses/LICENSE-2.0.html
  tags:
    - name: users
      description: User-related events
```

---

## Server Object

Описывает брокер сообщений или сервер.

| Поле              | Тип                                 | Обязательно | Описание                                                                        |
| ----------------- | ----------------------------------- | ----------- | ------------------------------------------------------------------------------- |
| `host`            | string                              | **YES**     | Хост с опциональным портом (например `localhost:5672`)                          |
| `protocol`        | string                              | **YES**     | Протокол (`amqp`, `amqps`, `mqtt`, `ws`, `wss`, `kafka`, `http`, `https`, etc.) |
| `protocolVersion` | string                              | no          | Версия протокола (например `0-9-1` для AMQP)                                    |
| `pathname`        | string                              | no          | Путь для подключения (например `/{env}`)                                        |
| `description`     | string                              | no          | Описание сервера                                                                |
| `title`           | string                              | no          | Заголовок                                                                       |
| `summary`         | string                              | no          | Краткое описание                                                                |
| `variables`       | Map[string → ServerVariable Object] | no          | Переменные шаблона URL                                                          |
| `security`        | [Security Requirement Object]       | no          | Требования безопасности                                                         |
| `tags`            | [Tag Object]                        | no          | Теги                                                                            |
| `externalDocs`    | ExternalDocs Object                 | no          | Внешняя документация                                                            |
| `bindings`        | Server Bindings Object              | no          | Protocol-specific настройки                                                     |

### ServerVariable Object

| Поле          | Тип      | Обязательно | Описание              |
| ------------- | -------- | ----------- | --------------------- |
| `default`     | string   | **YES**     | Значение по умолчанию |
| `enum`        | [string] | no          | Допустимые значения   |
| `description` | string   | no          | Описание              |
| `examples`    | [string] | no          | Примеры значений      |

### Пример Server Object

```yaml
servers:
  production:
    host: "rabbitmq.company.com:5672"
    protocol: amqp
    protocolVersion: "0-9-1"
    description: Production RabbitMQ broker
  staging:
    host: "rabbitmq.staging.company.com:5672"
    protocol: amqp
    variables:
      env:
        default: staging
        enum:
          - production
          - staging
        description: Deployment environment
```

---

## Channel Object

Описывает канал обмена сообщениями (очередь, топик, routing key, namespace Socket.IO и т.д.).

| Поле           | Тип                                    | Обязательно | Описание                                                        |
| -------------- | -------------------------------------- | ----------- | --------------------------------------------------------------- |
| `address`      | string \| null                         | no          | Адрес канала (топик, очередь, routing key). `null` = неизвестен |
| `messages`     | Map[string → Message Object \| $ref]   | no          | Сообщения, передаваемые по каналу                               |
| `title`        | string                                 | no          | Заголовок                                                       |
| `summary`      | string                                 | no          | Краткое описание                                                |
| `description`  | string                                 | no          | Описание                                                        |
| `servers`      | [$ref на Server]                       | no          | Серверы, доступные для канала. Если не указано — все серверы    |
| `parameters`   | Map[string → Parameter Object \| $ref] | no          | Параметры шаблона адреса                                        |
| `tags`         | [Tag Object]                           | no          | Теги                                                            |
| `externalDocs` | ExternalDocs Object                    | no          | Внешняя документация                                            |
| `bindings`     | Channel Bindings Object                | no          | Protocol-specific настройки                                     |

### Пример Channel Object

```yaml
channels:
  userSignedUp:
    address: "user.{env}.signed-up"
    title: User Signed Up
    description: Channel for user registration events
    messages:
      userSignedUp:
        $ref: "#/components/messages/UserSignedUp"
    parameters:
      env:
        $ref: "#/components/parameters/env"
    servers:
      - $ref: "#/servers/production"
    bindings:
      amqp:
        is: routingKey
        exchange:
          name: user-events
          type: topic
          durable: true
```

---

## Operation Object

Описывает операцию, которую **приложение** выполняет (send/receive). Это точка зрения приложения, а не брокера.

| Поле           | Тип                              | Обязательно | Описание                                           |
| -------------- | -------------------------------- | ----------- | -------------------------------------------------- |
| `action`       | `"send"` \| `"receive"`          | **YES**     | Тип действия                                       |
| `channel`      | $ref на Channel                  | **YES**     | Канал операции                                     |
| `title`        | string                           | no          | Заголовок                                          |
| `summary`      | string                           | no          | Краткое описание                                   |
| `description`  | string                           | no          | Описание                                           |
| `security`     | [Security Requirement Object]    | no          | Требования безопасности                            |
| `tags`         | [Tag Object]                     | no          | Теги                                               |
| `externalDocs` | ExternalDocs Object              | no          | Внешняя документация                               |
| `bindings`     | Operation Bindings Object        | no          | Protocol-specific настройки                        |
| `traits`       | [Operation Trait Object \| $ref] | no          | Переиспользуемые трейты                            |
| `messages`     | [$ref на Message]                | no          | Сообщения операции (подмножество сообщений канала) |
| `reply`        | Operation Reply Object           | no          | Определение ответа (request-reply паттерн)         |

> **`action: "send"`** — приложение **отправляет** сообщение в канал (producer).
> **`action: "receive"`** — приложение **получает** сообщение из канала (consumer).

### Operation Reply Object

| Поле       | Тип                            | Описание         |
| ---------- | ------------------------------ | ---------------- |
| `address`  | Operation Reply Address Object | Адрес для ответа |
| `channel`  | $ref на Channel                | Канал для ответа |
| `messages` | [$ref на Message]              | Сообщения ответа |

### Operation Reply Address Object

| Поле          | Тип                   | Обязательно | Описание                                |
| ------------- | --------------------- | ----------- | --------------------------------------- |
| `location`    | string (runtime expr) | **YES**     | Выражение для определения адреса ответа |
| `description` | string                | no          | Описание                                |

### Примеры операций

```yaml
operations:
  # Producer: сервис отправляет событие
  publishUserCreated:
    action: send
    channel:
      $ref: "#/channels/userCreated"
    summary: Publish user created event
    messages:
      - $ref: "#/channels/userCreated/messages/userCreated"
    tags:
      - name: users

  # Consumer: сервис получает команду
  onOrderPlaced:
    action: receive
    channel:
      $ref: "#/channels/orderPlaced"
    summary: Consume order placed command
    bindings:
      amqp:
        ack: true

  # Request-Reply
  requestUserInfo:
    action: send
    channel:
      $ref: "#/channels/userInfoRequest"
    reply:
      address:
        location: "$message.header#/replyTo"
      channel:
        $ref: "#/channels/userInfoReply"
```

---

## Полный пример документа (RabbitMQ)

```yaml
asyncapi: 3.1.0
info:
  title: User Service Events
  version: 1.0.0
  description: Events published and consumed by User Service

defaultContentType: application/json

servers:
  rabbitmq:
    host: "localhost:5672"
    protocol: amqp
    protocolVersion: "0-9-1"

channels:
  userCreated:
    address: user.created
    messages:
      userCreated:
        $ref: "#/components/messages/UserCreated"
    bindings:
      amqp:
        is: routingKey
        exchange:
          name: user-events
          type: topic
          durable: true
          autoDelete: false

operations:
  publishUserCreated:
    action: send
    channel:
      $ref: "#/channels/userCreated"
    messages:
      - $ref: "#/channels/userCreated/messages/userCreated"

components:
  messages:
    UserCreated:
      name: UserCreated
      contentType: application/json
      payload:
        type: object
        required: [userId, email]
        properties:
          userId:
            type: string
            format: uuid
          email:
            type: string
            format: email
          createdAt:
            type: string
            format: date-time
```
