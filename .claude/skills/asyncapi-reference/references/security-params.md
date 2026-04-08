# Security, Parameters, Runtime Expressions, Tags

## Security Scheme Object

Определяет механизм авторизации. Задаётся в `components/securitySchemes`, применяется к серверам и операциям.

### Типы схем безопасности

| Тип (`type`)           | Описание                                 |
| ---------------------- | ---------------------------------------- |
| `userPassword`         | Логин + пароль                           |
| `apiKey`               | API ключ                                 |
| `X509`                 | X.509 сертификат                         |
| `symmetricEncryption`  | Симметричное шифрование                  |
| `asymmetricEncryption` | Асимметричное шифрование                 |
| `httpApiKey`           | API ключ в HTTP заголовке или query      |
| `http`                 | HTTP авторизация (Basic, Bearer, Digest) |
| `oauth2`               | OAuth 2.0                                |
| `openIdConnect`        | OpenID Connect                           |
| `plain`                | SASL PLAIN                               |
| `scramSha256`          | SASL SCRAM SHA-256                       |
| `scramSha512`          | SASL SCRAM SHA-512                       |
| `gssapi`               | SASL GSSAPI                              |

### Поля Security Scheme Object

| Поле               | Тип                | Обязательно                   | Применимо к            | Описание                                                      |
| ------------------ | ------------------ | ----------------------------- | ---------------------- | ------------------------------------------------------------- |
| `type`             | string             | **YES**                       | все                    | Тип схемы из таблицы выше                                     |
| `description`      | string             | no                            | все                    | Описание                                                      |
| `name`             | string             | для `apiKey`, `httpApiKey`    |                        | Имя заголовка или query-параметра                             |
| `in`               | string             | для `apiKey`, `httpApiKey`    |                        | Расположение: `user`, `password`, `query`, `header`, `cookie` |
| `scheme`           | string             | для `http`                    |                        | HTTP схема авторизации: `basic`, `bearer`, `digest`           |
| `bearerFormat`     | string             | для `http` + bearer           |                        | Формат Bearer токена (например `JWT`)                         |
| `flows`            | OAuth Flows Object | для `oauth2`                  |                        | OAuth 2.0 потоки                                              |
| `openIdConnectUrl` | string (URL)       | для `openIdConnect`           |                        | URL OpenID Connect discovery                                  |
| `scopes`           | [string]           | для `oauth2`, `openIdConnect` | в Security Requirement | Запрашиваемые скоупы                                          |

### OAuth Flows Object

| Поле                | Тип               | Описание                |
| ------------------- | ----------------- | ----------------------- |
| `implicit`          | OAuth Flow Object | Implicit Flow           |
| `password`          | OAuth Flow Object | Password Flow           |
| `clientCredentials` | OAuth Flow Object | Client Credentials Flow |
| `authorizationCode` | OAuth Flow Object | Authorization Code Flow |

### OAuth Flow Object

| Поле               | Тип                  | Обязательно                        | Описание                       |
| ------------------ | -------------------- | ---------------------------------- | ------------------------------ |
| `authorizationUrl` | string (URL)         | для implicit, authCode             | URL авторизации                |
| `tokenUrl`         | string (URL)         | для password, clientCred, authCode | URL получения токена           |
| `refreshUrl`       | string (URL)         | no                                 | URL обновления токена          |
| `availableScopes`  | Map[string → string] | **YES**                            | Доступные скоупы и их описания |

### Security Requirement Object

Используется в `servers[].security` и `operations[].security`. Это массив объектов, где каждый объект — одна схема с требуемыми скоупами:

```yaml
security:
  - type: oauth2
    scopes:
      - read:messages
      - write:messages
  - type: apiKey # OR (только одна схема должна выполняться)
```

> **Только одна** из перечисленных схем безопасности должна быть выполнена.

### Примеры Security Scheme

```yaml
components:
  securitySchemes:
    # Bearer JWT
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT access token

    # API Key в заголовке
    apiKeyHeader:
      type: httpApiKey
      in: header
      name: X-API-Key

    # OAuth2 Client Credentials
    oauth2:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: "https://auth.company.com/oauth/token"
          availableScopes:
            "messages:read": Read messages
            "messages:write": Write messages

    # SASL для Kafka/RabbitMQ
    saslScram:
      type: scramSha256
      description: SASL SCRAM-SHA-256 authentication

# Применение к серверу
servers:
  production:
    host: "rabbitmq.company.com:5671"
    protocol: amqps
    security:
      - type: scramSha256

# Применение к операции
operations:
  publishEvent:
    action: send
    channel:
      $ref: "#/channels/events"
    security:
      - type: oauth2
        scopes:
          - "messages:write"
```

---

## Parameter Object

Описывает параметр в шаблоне адреса канала (например `{userId}` в `user.{userId}.events`).

| Поле          | Тип                   | Описание                                  |
| ------------- | --------------------- | ----------------------------------------- |
| `description` | string                | Описание параметра                        |
| `enum`        | [string]              | Допустимые значения                       |
| `default`     | string                | Значение по умолчанию                     |
| `examples`    | [string]              | Примеры значений                          |
| `location`    | string (runtime expr) | Откуда взять значение параметра в runtime |

> **Важно**: Parameter Object намеренно упрощён — только строки (нет `type`, `format`). Это отличие от OpenAPI.

### Пример Parameters

```yaml
channels:
  userEvents:
    address: "user.{userId}.{eventType}"
    parameters:
      userId:
        description: Unique user identifier
        location: $message.payload#/userId
      eventType:
        description: Type of user event
        enum:
          - created
          - updated
          - deleted
        default: created

# В components
components:
  parameters:
    userId:
      description: User identifier
      location: $message.payload#/userId

    environment:
      description: Deployment environment
      enum:
        - production
        - staging
        - development
      default: production
```

---

## Runtime Expressions

Используются в полях `location` (Parameter, CorrelationID, Operation Reply Address).

### Синтаксис

```
$message.header#/<json-pointer>
$message.payload#/<json-pointer>
```

Где `<json-pointer>` — путь по [RFC 6901](https://datatracker.ietf.org/doc/html/rfc6901): `/field/subfield`.

### Примеры

| Выражение                            | Описание                                    |
| ------------------------------------ | ------------------------------------------- |
| `$message.header#/correlationId`     | Поле `correlationId` в заголовках сообщения |
| `$message.header#/replyTo`           | Поле `replyTo` в заголовках                 |
| `$message.payload#/userId`           | Поле `userId` в теле сообщения              |
| `$message.payload#/metadata/traceId` | Вложенное поле `traceId` внутри `metadata`  |

### Применение

```yaml
# В CorrelationID
correlationId:
  location: $message.header#/correlationId

# В Parameter
parameters:
  userId:
    location: $message.payload#/user/id

# В Operation Reply Address (request-reply pattern)
operations:
  requestData:
    action: send
    channel:
      $ref: "#/channels/dataRequest"
    reply:
      address:
        location: "$message.header#/replyTo"
        description: Reply address taken from message header
      channel:
        $ref: "#/channels/dataReply"
```

---

## Tag Object

| Поле           | Тип                 | Обязательно | Описание             |
| -------------- | ------------------- | ----------- | -------------------- |
| `name`         | string              | **YES**     | Имя тега             |
| `description`  | string              | no          | Описание             |
| `externalDocs` | ExternalDocs Object | no          | Внешняя документация |

```yaml
tags:
  - name: users
    description: User management operations
  - name: orders
    description: Order processing operations
    externalDocs:
      url: https://docs.company.com/orders
      description: Order processing documentation
```

Теги используются в `info`, `servers`, `channels`, `operations`, `messages` для группировки в документации.

---

## External Documentation Object

| Поле          | Тип          | Обязательно | Описание                              |
| ------------- | ------------ | ----------- | ------------------------------------- |
| `url`         | string (URL) | **YES**     | URL внешней документации (абсолютный) |
| `description` | string       | no          | Описание                              |

```yaml
externalDocs:
  url: https://docs.company.com/api/events
  description: Full event catalog documentation
```

---

## Reference Object ($ref)

Позволяет ссылаться на определения в том же или внешнем файле.

| Форма                | Пример                                             | Описание                         |
| -------------------- | -------------------------------------------------- | -------------------------------- |
| Внутренняя           | `$ref: '#/components/messages/UserCreated'`        | Ссылка внутри документа          |
| Внешняя (файл)       | `$ref: './messages/user.yaml'`                     | Другой файл                      |
| Внешняя с фрагментом | `$ref: './common.yaml#/components/schemas/UserId'` | Конкретный объект в другом файле |

> **Ограничение**: `$ref` нельзя использовать вместе с другими полями в одном объекте — `$ref` заменяет весь объект. Если нужно добавить поля — используй трейты.
