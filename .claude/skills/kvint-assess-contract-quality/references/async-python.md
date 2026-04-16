# Quality Assessment Patterns — AsyncAPI / Python

Паттерны для оценки 4 AsyncAPI-критериев качества в Python-сервисах.

Охватывает: **RabbitMQ** (`aio-pika`, `pika`) и **WebSocket** (`fastapi` WebSocket endpoint, библиотека `websockets`).

---

## RabbitMQ

Определяется по `requirements.txt` или `pyproject.toml`: `aio-pika`, `pika`, `aio_pika`.

### 1. `x-quality-payload-typed`

Считать `true` если тело сообщения декодируется в Pydantic BaseModel или dataclass с явными полями.

```python
# TRUE — Pydantic BaseModel
from pydantic import BaseModel

class MessageCreatedEvent(BaseModel):
    chat_id: str
    content: str
    author_id: int

async def handle_message(message: aio_pika.IncomingMessage):
    async with message.process():
        event = MessageCreatedEvent.parse_raw(message.body)  # TRUE
        await process_event(event)

# TRUE — parse_raw или model_validate
event = MessageCreatedEvent.model_validate_json(message.body)  # Pydantic v2 — TRUE

# TRUE — dataclass с типами
from dataclasses import dataclass
import json

@dataclass
class MessageCreatedEvent:
    chat_id: str
    content: str

data = json.loads(message.body)
event = MessageCreatedEvent(**data)  # TRUE если используется dataclass

# FALSE — dict без Pydantic
data = json.loads(message.body)  # result: dict — FALSE
content = data.get('content')    # нет типизированной структуры

# FALSE — без декодирования структуры
raw = message.body.decode()  # работа со строкой — FALSE
```

### 2. `x-quality-payload-validated`

Считать `true` если используется Pydantic (автовалидирует при парсинге) или явная ручная валидация с обработкой:

```python
# TRUE — Pydantic BaseModel (валидация автоматическая)
class MessageCreatedEvent(BaseModel):
    chat_id: str                              # обязательное поле — Pydantic проверит
    content: str = Field(..., min_length=1)   # с ограничением — TRUE

async def handle(message: aio_pika.IncomingMessage):
    async with message.process():
        try:
            event = MessageCreatedEvent.parse_raw(message.body)  # валидирует — TRUE
        except ValidationError as e:
            logger.error("Invalid message", extra={"error": str(e)})
            await message.reject(requeue=False)
            return

# TRUE — @validator или @field_validator (Pydantic v2)
class MessageCreatedEvent(BaseModel):
    chat_id: str

    @validator('chat_id')
    def chat_id_not_empty(cls, v):
        if not v.strip():
            raise ValueError('chat_id must not be empty')
        return v

# TRUE — ручная валидация с обработкой
data = json.loads(message.body)
if not data.get('chat_id') or not data.get('content'):
    await message.reject(requeue=False)
    return

# FALSE — Pydantic без try/except и без reject при ошибке
event = MessageCreatedEvent.parse_raw(message.body)
# нет обработки ValidationError — FALSE (нет видимой валидации с последствиями)

# FALSE — dict без валидации
data = json.loads(message.body)
await process(data)  # нет проверки структуры — FALSE
```

**Примечание:** если `x-quality-payload-typed` = `true` (Pydantic) и есть `try/except ValidationError` → `x-quality-payload-validated` = `true`.

### 3. `x-quality-errors-defined`

Считать `true` при выполнении любого из условий:

```python
# TRUE — message.reject() или message.nack() при ошибке
async def handle(message: aio_pika.IncomingMessage):
    async with message.process(requeue=False):
        try:
            event = MessageCreatedEvent.parse_raw(message.body)
            await process_event(event)
        except (ValidationError, ProcessingError) as e:
            logger.error("Failed", error=str(e))
            await message.reject(requeue=False)  # TRUE

# TRUE — aio_pika: requeue=False в process() означает автоматический reject при ошибке
async with message.process(requeue=False):  # TRUE — явное указание requeue=False

# TRUE — Dead Letter Queue настроена в объявлении очереди
await channel.declare_queue(
    "messages",
    arguments={
        "x-dead-letter-exchange": "dlx",
        "x-dead-letter-routing-key": "failed.messages",
    }
)
# Само наличие DLX настройки — TRUE

# TRUE — pika: basic_nack при ошибке
def callback(ch, method, properties, body):
    try:
        process(body)
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception:
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)  # TRUE

# FALSE — нет nack/reject при ошибке
async def handle(message: aio_pika.IncomingMessage):
    async with message.process():
        data = json.loads(message.body)
        await process(data)  # исключение пойдёт в message.process() без явного reject
```

### 4. `x-quality-contract-implemented`

Значение из Pre-scan флага `contractImplemented`.

Признаки кодогенерации для Python:
```
# requirements.txt / pyproject.toml:
datamodel-code-generator>=0.20.0
openapi-python-client>=0.12.0
fastapi-code-generator>=0.4.0

# Makefile:
generate:
    datamodel-codegen --input openapi.yaml --output app/schemas/generated.py

# Сгенерированный файл содержит заголовок:
# generated by datamodel-codegen:
#   filename:  openapi.yaml
#   timestamp: 2026-04-16T10:00:00+00:00
```

---

## WebSocket

Определяется по: `fastapi` с `WebSocket` endpoint, или библиотека `websockets`.

### 1. `x-quality-payload-typed`

Считать `true` если полученные данные парсятся в Pydantic BaseModel или dataclass.

```python
# TRUE — FastAPI WebSocket с Pydantic
from fastapi import WebSocket
from pydantic import BaseModel

class IncomingMessage(BaseModel):
    type: str
    content: str

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_json()
        msg = IncomingMessage(**data)   # TRUE — Pydantic модель
        await handle(msg)

# TRUE — model_validate (Pydantic v2)
msg = IncomingMessage.model_validate(data)  # TRUE

# TRUE — websockets library с Pydantic
import websockets

async def handler(websocket):
    async for raw in websocket:
        msg = IncomingMessage.parse_raw(raw)  # TRUE

# FALSE — dict без Pydantic
data = await websocket.receive_json()
# data — dict, нет типизированной структуры — FALSE

# FALSE — строка без парсинга в структуру
raw = await websocket.receive_text()
# работа с raw строкой — FALSE
```

### 2. `x-quality-payload-validated`

Если используется Pydantic BaseModel — TRUE автоматически (валидация при создании). Дополнительно:

```python
# TRUE — Pydantic BaseModel с Field ограничениями
class IncomingMessage(BaseModel):
    type: str = Field(..., pattern="^(sendMessage|joinRoom)$")
    content: str = Field(..., min_length=1, max_length=10000)

# TRUE — try/except ValidationError
try:
    msg = IncomingMessage(**data)
except ValidationError as e:
    await websocket.send_json({"error": str(e)})
    return

# TRUE — ручная валидация
if not data.get('type') or not data.get('content'):
    await websocket.send_json({"error": "Missing required fields"})
    return

# FALSE — dict без валидации
data = await websocket.receive_json()
await handle(data)  # нет проверки — FALSE
```

### 3. `x-quality-errors-defined`

Считать `true` при явной обработке ошибок с ответом клиенту или закрытием:

```python
# TRUE — send_json с ошибкой
await websocket.send_json({"type": "error", "message": "Invalid input"})  # TRUE

# TRUE — websocket.close() с кодом
await websocket.close(code=1008, reason="Policy Violation")  # TRUE
await websocket.close(code=4000, reason="Custom error")      # TRUE

# TRUE — try/except с ответом клиенту
try:
    msg = IncomingMessage(**data)
    await process(msg)
except ValidationError as e:
    await websocket.send_json({"error": "Validation failed", "details": str(e)})  # TRUE
except ProcessingError as e:
    await websocket.close(code=1011, reason="Internal error")  # TRUE

# TRUE — websockets library
await websocket.send(json.dumps({"error": "invalid"}))  # TRUE

# FALSE — только логирование без ответа клиенту
except Exception as e:
    logger.error("Failed", error=str(e))  # нет ответа — FALSE

# FALSE — нет обработки ошибок
data = await websocket.receive_json()
await handle(data)  # нет try/except — FALSE
```

### 4. `x-quality-contract-implemented`

Значение из Pre-scan флага `contractImplemented` (те же признаки кодогенерации, что для RabbitMQ).
