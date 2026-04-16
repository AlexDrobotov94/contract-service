# Quality Assessment Patterns — AsyncAPI / Go

Паттерны для оценки 4 AsyncAPI-критериев качества в Go-сервисах.

Охватывает: **RabbitMQ** (`amqp091-go`, `rabbitmq/amqp091-go`) и **WebSocket** (`gorilla/websocket`, `nhooyr.io/websocket`, `gobwas/ws`).

---

## RabbitMQ

Определяется по `go.mod`: `github.com/rabbitmq/amqp091-go` или `github.com/streadway/amqp`.

### 1. `x-quality-payload-typed`

Считать `true` если тело сообщения (`d.Body`) декодируется в именованную struct (не в `map[string]interface{}`, не в `interface{}`).

```go
// TRUE — decode в именованную struct
type MessageCreatedEvent struct {
    ChatID  string `json:"chatId"`
    Content string `json:"content"`
}

msgs, _ := ch.Consume(queue, ...)
for d := range msgs {
    var event MessageCreatedEvent
    if err := json.Unmarshal(d.Body, &event); err != nil { ... }
    // event.ChatID — типизировано — TRUE
}

// FALSE — decode в map
var body map[string]interface{}
json.Unmarshal(d.Body, &body)  // FALSE

// FALSE — decode в interface{}
var body interface{}
json.Unmarshal(d.Body, &body)  // FALSE

// FALSE — работа с d.Body напрямую без unmarshaling
content := string(d.Body)  // если используется как строка без структуры — FALSE
```

### 2. `x-quality-payload-validated`

Считать `true` при выполнении любого из условий:

```go
// TRUE — go-playground/validator
import "github.com/go-playground/validator/v10"

type MessageCreatedEvent struct {
    ChatID  string `json:"chatId"  validate:"required,uuid"`
    Content string `json:"content" validate:"required,min=1"`
}

validate := validator.New()
var event MessageCreatedEvent
json.Unmarshal(d.Body, &event)
if err := validate.Struct(event); err != nil {
    d.Nack(false, false)
    return
}
// TRUE

// TRUE — ручная валидация с явным обработчиком
var event MessageCreatedEvent
json.Unmarshal(d.Body, &event)
if event.ChatID == "" || event.Content == "" {
    logger.Error("invalid message: missing required fields")
    d.Nack(false, false)
    return
}
// TRUE

// FALSE — decode без последующей валидации
var event MessageCreatedEvent
json.Unmarshal(d.Body, &event)
processEvent(event)  // нет валидации — FALSE
```

### 3. `x-quality-errors-defined`

Считать `true` при выполнении любого из условий:

```go
// TRUE — d.Nack() в случае ошибки
for d := range msgs {
    if err := processMessage(d.Body); err != nil {
        logger.Error("failed to process", "error", err)
        d.Nack(false, false)  // TRUE — явный nack
        continue
    }
    d.Ack(false)
}

// TRUE — публикация в Dead Letter Exchange
ch.Publish(
    "dlx.exchange",      // DLX
    d.RoutingKey,
    false, false,
    amqp.Publishing{Body: d.Body},
)

// TRUE — Dead Letter Exchange настроен через аргументы очереди
args := amqp.Table{
    "x-dead-letter-exchange":    "dlx",
    "x-dead-letter-routing-key": "failed",
}
ch.QueueDeclare(queue, true, false, false, false, args)
// Само наличие DLX настройки — TRUE

// FALSE — нет ack/nack разделения по результату
for d := range msgs {
    processMessage(d.Body)  // всегда ack или нет обработки ошибок
    d.Ack(false)  // FALSE — нет nack при ошибке
}
```

### 4. `x-quality-contract-implemented`

Значение из Pre-scan флага `contractImplemented`.

Признаки кодогенерации для Go:
- `//go:generate` директивы с `oapi-codegen`, `protoc-gen-go`, `buf generate`
- Makefile с `oapi-codegen` или `protoc` командами
- Импорт пакетов с заголовком `// Code generated` в первой строке
- `buf.gen.yaml` или `buf.work.yaml` файлы (protobuf/gRPC)

---

## WebSocket

Определяется по `go.mod`: `github.com/gorilla/websocket`, `nhooyr.io/websocket`, `github.com/gobwas/ws`.

### 1. `x-quality-payload-typed`

Считать `true` если полученное сообщение декодируется в именованную struct.

```go
// TRUE — gorilla/websocket: ReadJSON в именованную struct
type IncomingMessage struct {
    Type    string          `json:"type"`
    Payload json.RawMessage `json:"payload"`
}

var msg IncomingMessage
if err := conn.ReadJSON(&msg); err != nil { ... }
// msg.Type — типизировано — TRUE

// TRUE — nhooyr.io/websocket
var msg IncomingMessage
wsjson.Read(ctx, conn, &msg)  // TRUE если msg — именованная struct

// TRUE — ручное чтение + json.Unmarshal в struct
_, raw, _ := conn.ReadMessage()
var msg IncomingMessage
json.Unmarshal(raw, &msg)  // TRUE

// FALSE — decode в interface{} или map
var msg interface{}
conn.ReadJSON(&msg)  // FALSE

var body map[string]interface{}
json.Unmarshal(raw, &body)  // FALSE
```

### 2. `x-quality-payload-validated`

Считать `true` при явной валидации после получения:

```go
// TRUE — go-playground/validator
type IncomingMessage struct {
    Type    string `json:"type"    validate:"required,oneof=sendMessage joinRoom"`
    Content string `json:"content" validate:"required"`
}

var msg IncomingMessage
conn.ReadJSON(&msg)
if err := validate.Struct(msg); err != nil {
    conn.WriteMessage(websocket.TextMessage,
        []byte(`{"error":"invalid message"}`))
    return
}
// TRUE

// TRUE — ручная проверка
var msg IncomingMessage
conn.ReadJSON(&msg)
if msg.Type == "" {
    conn.WriteMessage(websocket.CloseMessage,
        websocket.FormatCloseMessage(1008, "type required"))
    return
}
// TRUE

// FALSE — decode без валидации
var msg IncomingMessage
conn.ReadJSON(&msg)
processMessage(msg)  // нет валидации — FALSE
```

### 3. `x-quality-errors-defined`

Считать `true` при явной обработке ошибок с отправкой клиенту или закрытием соединения с кодом:

```go
// TRUE — CloseMessage с кодом
conn.WriteMessage(
    websocket.CloseMessage,
    websocket.FormatCloseMessage(1008, "policy violation"),  // TRUE
)

// TRUE — отправка JSON-ошибки клиенту
if err := processMessage(msg); err != nil {
    conn.WriteJSON(map[string]string{"error": err.Error()})  // TRUE
}

// TRUE — CloseNormalClosure при невалидных данных (с контекстом ошибки)
wsutil.WriteServerText(conn, []byte(`{"type":"error","message":"invalid"}`))  // TRUE

// FALSE — только логирование без ответа клиенту
if err := processMessage(msg); err != nil {
    logger.Error("failed", err)  // нет ответа клиенту — FALSE
}

// FALSE — нет обработки ошибок
conn.ReadJSON(&msg)
processMessage(msg)  // нет try/catch аналога — FALSE
```

### 4. `x-quality-contract-implemented`

Значение из Pre-scan флага `contractImplemented` (те же признаки кодогенерации, что для RabbitMQ).
