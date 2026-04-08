---
name: asyncapi-reference
description: >
  Reference documentation for the AsyncAPI 3.1.0 specification. Use this skill whenever you need
  to write, validate, review, or explain AsyncAPI documents — including when generating asyncapi.yaml,
  rabbitmq.yaml, socket.yaml, or any AsyncAPI-compliant contract file. Trigger when the user asks
  about AsyncAPI structure, fields, channels, operations, messages, bindings, schemas, or when an agent
  needs to produce a valid AsyncAPI 3.1.0 document. Also use when debugging AsyncAPI validation errors
  or deciding which fields are required vs optional.
---

# AsyncAPI 3.1.0 Reference

Справочник по спецификации AsyncAPI 3.1.0. Это **только справочный ресурс** — он не выполняет действий, а предоставляет актуальную информацию о структуре документа.

Официальная документация: https://www.asyncapi.com/docs/reference/specification/v3.1.0

---

## Структура документа AsyncAPI

```yaml
asyncapi: 3.1.0 # REQUIRED — версия спецификации
id: "urn:example:app" # optional — уникальный идентификатор приложения (URI)
info: ... # REQUIRED — метаданные API
defaultContentType: application/json # optional — тип контента по умолчанию
servers: ... # optional — брокеры/серверы сообщений
channels: ... # optional — каналы обмена сообщениями
operations: ... # optional — операции send/receive
components: ... # optional — переиспользуемые определения
```

> **Важно**: `asyncapi`, `info` — единственные обязательные поля на корневом уровне.

---

## Индекс справочных файлов

Читай нужный файл при работе с соответствующим разделом:

| Тема                                                | Файл                              | Когда читать                                               |
| --------------------------------------------------- | --------------------------------- | ---------------------------------------------------------- |
| AsyncAPI Object, Info, Server, Channel, Operation   | `references/core-objects.md`      | При составлении структуры документа, серверов, каналов     |
| Message Object, Schema, MultiFormat, CorrelationID  | `references/messages-schemas.md`  | При описании сообщений и их структур данных                |
| Components, OperationTrait, MessageTrait            | `references/components-traits.md` | При работе с переиспользуемыми определениями и трейтами    |
| Bindings (AMQP/RabbitMQ, WebSocket/Socket.IO, HTTP) | `references/bindings.md`          | При добавлении protocol-specific деталей                   |
| Security, Parameters, Runtime Expressions, Tags     | `references/security-params.md`   | При настройке безопасности, параметров адресов, корреляции |

---

## Быстрая шпаргалка: минимальный валидный документ

```yaml
asyncapi: 3.1.0
info:
  title: My Service
  version: 1.0.0
channels:
  userSignedUp:
    address: user.signed-up
    messages:
      userSignedUp:
        payload:
          type: object
          properties:
            userId:
              type: string
operations:
  onUserSignedUp:
    action: receive
    channel:
      $ref: "#/channels/userSignedUp"
    messages:
      - $ref: "#/channels/userSignedUp/messages/userSignedUp"
```

---

## Ключевые правила спецификации

1. **Имена полей** — регистрозависимы (case-sensitive) везде.
2. **URL** — всегда абсолютные (RFC3986 Section 4.3), если не указано иное.
3. **`action`** — только `"send"` или `"receive"` (не `publish`/`subscribe` как в v2).
4. **Channels и Operations разделены** — канал описывает _что_, операция описывает _как приложение использует канал_.
5. **`$ref`** — поддерживает внутренние (`#/...`) и внешние (`./file.yaml#/...`) ссылки.
6. **Traits** — мержатся поверх объекта, значения трейта имеют _меньший_ приоритет (объект перекрывает трейт).
7. **`defaultContentType`** — применяется к сообщениям, у которых не указан `contentType`.
8. **Channel `address`** — может быть `null` (адрес неизвестен/определяется динамически).
