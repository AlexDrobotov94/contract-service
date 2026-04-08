# Messages, Schemas, CorrelationID

## Message Object

Описывает сообщение, передаваемое по каналу.

| Поле            | Тип                                                | Обязательно | Описание                                                |
| --------------- | -------------------------------------------------- | ----------- | ------------------------------------------------------- |
| `headers`       | Schema Object \| MultiFormat Schema Object \| $ref | no          | Схема заголовков сообщения                              |
| `payload`       | Schema Object \| MultiFormat Schema Object \| $ref | no          | Схема тела сообщения                                    |
| `correlationId` | CorrelationID Object \| $ref                       | no          | Идентификатор корреляции                                |
| `contentType`   | string                                             | no          | MIME-тип содержимого (перекрывает `defaultContentType`) |
| `name`          | string                                             | no          | Машинное имя сообщения                                  |
| `title`         | string                                             | no          | Человекочитаемый заголовок                              |
| `summary`       | string                                             | no          | Краткое описание                                        |
| `description`   | string                                             | no          | Полное описание                                         |
| `tags`          | [Tag Object]                                       | no          | Теги                                                    |
| `externalDocs`  | ExternalDocs Object                                | no          | Внешняя документация                                    |
| `bindings`      | Message Bindings Object                            | no          | Protocol-specific настройки                             |
| `examples`      | [Message Example Object]                           | no          | Примеры сообщений                                       |
| `traits`        | [Message Trait Object \| $ref]                     | no          | Переиспользуемые трейты                                 |

> **Важно**: `traits` нельзя вкладывать рекурсивно — у Message Trait нет поля `traits`.
> **Важно**: `payload` не входит в Message Trait (только в Message Object).

### Пример Message Object

```yaml
components:
  messages:
    UserCreated:
      name: UserCreated
      title: User Created Event
      summary: Fired when a new user registers
      contentType: application/json
      headers:
        type: object
        properties:
          correlationId:
            type: string
            description: Correlation ID for tracing
          x-source-service:
            type: string
      payload:
        type: object
        required:
          - userId
          - email
          - createdAt
        properties:
          userId:
            type: string
            format: uuid
          email:
            type: string
            format: email
          firstName:
            type: string
          lastName:
            type: string
          createdAt:
            type: string
            format: date-time
      correlationId:
        description: Correlation ID from headers
        location: $message.header#/correlationId
      tags:
        - name: users
      examples:
        - name: BasicExample
          summary: Basic user creation event
          headers:
            correlationId: "abc-123"
            x-source-service: "auth-service"
          payload:
            userId: "550e8400-e29b-41d4-a716-446655440000"
            email: "john@example.com"
            firstName: John
            lastName: Doe
            createdAt: "2024-01-15T10:30:00Z"
      traits:
        - $ref: "#/components/messageTraits/commonHeaders"
```

### Message Example Object

| Поле      | Тип    | Описание                                                   |
| --------- | ------ | ---------------------------------------------------------- |
| `name`    | string | Имя примера                                                |
| `summary` | string | Краткое описание                                           |
| `headers` | Map    | Значения заголовков (должны соответствовать схеме headers) |
| `payload` | any    | Данные тела (должны соответствовать схеме payload)         |

---

## Schema Object

AsyncAPI Schema основан на **JSON Schema Draft 07** с расширениями.

### Основные ключевые слова JSON Schema

| Ключевое слово         | Тип                  | Описание                                                            |
| ---------------------- | -------------------- | ------------------------------------------------------------------- |
| `type`                 | string \| [string]   | `object`, `array`, `string`, `number`, `integer`, `boolean`, `null` |
| `properties`           | Map[string → Schema] | Свойства объекта                                                    |
| `required`             | [string]             | Список обязательных полей                                           |
| `items`                | Schema \| [Schema]   | Схема элементов массива                                             |
| `additionalProperties` | boolean \| Schema    | Разрешить/запретить доп. свойства                                   |
| `allOf`                | [Schema]             | Все схемы должны применяться                                        |
| `anyOf`                | [Schema]             | Хотя бы одна схема должна применяться                               |
| `oneOf`                | [Schema]             | Ровно одна схема должна применяться                                 |
| `not`                  | Schema               | Схема НЕ должна применяться                                         |
| `enum`                 | [any]                | Допустимые значения                                                 |
| `const`                | any                  | Единственное допустимое значение                                    |
| `default`              | any                  | Значение по умолчанию                                               |
| `$ref`                 | string               | Ссылка на другую схему                                              |
| `description`          | string               | Описание                                                            |
| `title`                | string               | Заголовок                                                           |
| `examples`             | [any]                | Примеры значений                                                    |

### Строки (type: string)

| Ключевое слово | Описание                                                                                                              |
| -------------- | --------------------------------------------------------------------------------------------------------------------- |
| `minLength`    | Минимальная длина строки                                                                                              |
| `maxLength`    | Максимальная длина строки                                                                                             |
| `pattern`      | Регулярное выражение (ECMAScript)                                                                                     |
| `format`       | Формат: `date-time`, `date`, `time`, `email`, `uri`, `uuid`, `hostname`, `ipv4`, `ipv6`, `byte`, `binary`, `password` |

### Числа (type: number / integer)

| Ключевое слово     | Описание                                  |
| ------------------ | ----------------------------------------- |
| `minimum`          | Минимальное значение (включительно)       |
| `maximum`          | Максимальное значение (включительно)      |
| `exclusiveMinimum` | boolean (DraftO7: минимум не включается)  |
| `exclusiveMaximum` | boolean (Draft07: максимум не включается) |
| `multipleOf`       | Кратность                                 |

### Массивы (type: array)

| Ключевое слово | Описание                                          |
| -------------- | ------------------------------------------------- |
| `minItems`     | Минимальное количество элементов                  |
| `maxItems`     | Максимальное количество элементов                 |
| `uniqueItems`  | Элементы должны быть уникальны                    |
| `contains`     | Хотя бы один элемент должен соответствовать схеме |

### AsyncAPI-специфичные расширения Schema

| Поле            | Тип                 | Описание                                      |
| --------------- | ------------------- | --------------------------------------------- |
| `discriminator` | string              | Имя поля для полиморфизма (в `oneOf`/`anyOf`) |
| `externalDocs`  | ExternalDocs Object | Внешняя документация                          |
| `deprecated`    | boolean             | Помечает схему устаревшей (default: `false`)  |

### Примеры схем

```yaml
# Объект с вложенными типами
UserPayload:
  type: object
  required:
    - id
    - email
  properties:
    id:
      type: string
      format: uuid
      description: Unique user identifier
    email:
      type: string
      format: email
    age:
      type: integer
      minimum: 0
      maximum: 150
    roles:
      type: array
      items:
        type: string
        enum:
          - admin
          - user
          - moderator
      uniqueItems: true
    metadata:
      type: object
      additionalProperties:
        type: string

# Полиморфизм
EventPayload:
  oneOf:
    - $ref: "#/components/schemas/UserCreatedPayload"
    - $ref: "#/components/schemas/UserUpdatedPayload"
  discriminator: eventType

# Nullable поле (JSON Schema Draft 07 способ)
OptionalField:
  type:
    - string
    - "null"
```

---

## Multi Format Schema Object

Используется, когда нужно указать схему в формате, отличном от AsyncAPI JSON Schema (например Avro, Protobuf).

| Поле           | Тип    | Обязательно | Описание                    |
| -------------- | ------ | ----------- | --------------------------- |
| `schemaFormat` | string | **YES**     | Идентификатор формата схемы |
| `schema`       | any    | **YES**     | Сама схема                  |

### Поддерживаемые форматы schemaFormat

| Формат                         | Значение schemaFormat                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| AsyncAPI Schema (по умолчанию) | `application/vnd.aai.asyncapi+json;version=3.0.0` или `application/vnd.aai.asyncapi+yaml;version=3.0.0` |
| JSON Schema Draft 07           | `application/schema+json;version=draft-07`                                                              |
| Apache Avro 1.9.0              | `application/vnd.apache.avro+json;version=1.9.0`                                                        |
| OpenAPI 3.0.0 Schema           | `application/vnd.oai.openapi+json;version=3.0.0`                                                        |
| RAML 1.0                       | `application/raml+yaml;version=1.0`                                                                     |
| Protocol Buffers               | `application/vnd.google.protobuf;version=3`                                                             |

### Пример Multi Format Schema

```yaml
payload:
  schemaFormat: "application/vnd.apache.avro+json;version=1.9.0"
  schema:
    type: record
    name: UserEvent
    fields:
      - name: userId
        type: string
      - name: eventType
        type:
          type: enum
          name: EventType
          symbols: [CREATED, UPDATED, DELETED]
```

---

## CorrelationID Object

Описывает, как извлечь идентификатор корреляции из сообщения.

| Поле          | Тип                   | Обязательно | Описание                                |
| ------------- | --------------------- | ----------- | --------------------------------------- |
| `location`    | string (runtime expr) | **YES**     | Выражение для нахождения correlation ID |
| `description` | string                | no          | Описание                                |

### Примеры

```yaml
# В заголовке
correlationId:
  description: Correlation ID для трейсинга запросов
  location: $message.header#/correlationId

# В теле сообщения
correlationId:
  description: Request ID в payload
  location: $message.payload#/requestId
```

**Синтаксис runtime expressions**: `$message.header#/<json-pointer>` или `$message.payload#/<json-pointer>`

Где `<json-pointer>` — путь по RFC6901 (например `/requestId`, `/metadata/traceId`).
