# Quality Assessment Patterns — AsyncAPI / Express

Паттерны для оценки 4 AsyncAPI-критериев качества в Express-приложениях.

Охватывает: **Socket.IO** (библиотека `socket.io` без NestJS) и **WebSocket** (библиотека `ws`).

TypeScript и JavaScript Express рассматриваются совместно — в TypeScript-разделах явно указаны type hint'ы; в JavaScript-проектах типизация через JSDoc засчитывается, отсутствие любого типа = FALSE.

---

## Socket.IO

### 1. `x-quality-payload-typed`

Считать `true` если тип payload события определён — либо через явную аннотацию в callback, либо через типизированные generic-интерфейсы `Server`/`Socket`.

```typescript
// TRUE — Socket.IO v4 TypeScript generics: типы выводятся из интерфейсов автоматически
import { Server, Socket } from 'socket.io';

interface ClientToServerEvents {
  sendMessage: (data: SendMessageDto) => void;
  createRoom: (data: CreateRoomDto, callback: (res: RoomDto) => void) => void;
}

interface ServerToClientEvents {
  messageCreated: (msg: MessageDto) => void;
}

const io = new Server<ClientToServerEvents, ServerToClientEvents>();

io.on('connection', (socket) => {
  socket.on('sendMessage', (data) => {  // data: SendMessageDto — выведено из интерфейса — TRUE
    ...
  });
  socket.on('createRoom', (data, callback) => {  // data: CreateRoomDto, callback типизирован — TRUE
    ...
  });
});

// TRUE — TypeScript: явная аннотация в callback (без generics)
socket.on('sendMessage', (data: SendMessageDto) => {  // TRUE
  ...
});
```

```javascript
// TRUE — JavaScript: JSDoc
/**
 * @param {SendMessageDto} data
 */
socket.on('sendMessage', (data) => {  // JSDoc есть — TRUE
  ...
});

// FALSE — JavaScript: нет JSDoc
socket.on('sendMessage', (data) => {  // нет типа — FALSE
  ...
});
```

```typescript
// FALSE — TypeScript: any
socket.on('sendMessage', (data: any) => {  // FALSE
  ...
});

// FALSE — нет generics на Server И нет аннотации в callback
const io = new Server();  // без generic-параметров
socket.on('sendMessage', (data) => {  // data: any — FALSE
  ...
});
```

### 2. `x-quality-payload-validated`

Считать `true` при выполнении любого из условий:

```typescript
// TRUE — Zod
const sendMessageSchema = z.object({ content: z.string().min(1), chatId: z.string().uuid() });
socket.on('sendMessage', (data: unknown) => {
  const dto = sendMessageSchema.parse(data);
  ...
});

// TRUE — Joi
const schema = Joi.object({ content: Joi.string().required() });
socket.on('sendMessage', (data) => {
  const { error } = schema.validate(data);
  if (error) { socket.emit('error', { message: error.message }); return; }
  ...
});

// TRUE — AJV
const validate = ajv.compile({ type: 'object', required: ['content'], properties: { content: { type: 'string' } } });
socket.on('sendMessage', (data) => {
  if (!validate(data)) { socket.emit('error', { errors: validate.errors }); return; }
  ...
});

// TRUE — class-validator
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
socket.on('sendMessage', async (data) => {
  const dto = plainToInstance(SendMessageDto, data);
  const errors = await validate(dto);
  if (errors.length > 0) { ... }
});

// FALSE — только type cast без runtime-проверки
socket.on('sendMessage', (data: SendMessageDto) => {
  this.messageService.send(data);  // нет validate/parse — FALSE
});
```

### 3. `x-quality-errors-defined`

Считать `true` при выполнении любого из условий:

```typescript
// TRUE — emit('error', ...) или emit('exception', ...)
socket.on('sendMessage', (data, callback) => {
  if (!data.content) {
    socket.emit('error', { message: 'Content is required' });  // TRUE
    return;
  }
});

// TRUE — acknowledgement callback с ошибкой
socket.on('sendMessage', (data, callback) => {
  if (!isValid(data)) {
    callback({ error: 'Invalid data' });  // TRUE
    return;
  }
  callback({ success: true });
});

// TRUE — try/catch с явной отправкой ошибки
socket.on('sendMessage', async (data) => {
  try {
    await this.process(data);
  } catch (err) {
    socket.emit('error', { message: err.message });  // TRUE
  }
});

// FALSE — нет обработки ошибок
socket.on('sendMessage', (data: SendMessageDto) => {
  this.messageService.send(data);  // нет emit('error') — FALSE
});
```

### 4. `x-quality-contract-implemented`

Значение из Pre-scan флага `contractImplemented` (проверка `@kvint/<service>-contracts` в `package.json`).

---

## WebSocket (`ws` library)

### 1. `x-quality-payload-typed`

Считать `true` если сообщение разбирается (`JSON.parse`) в именованный тип или переменную с явной аннотацией.

```typescript
// TRUE — TypeScript: явный тип после parse
import WebSocket from 'ws';

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (raw: Buffer | string) => {
    const msg: IncomingMessage = JSON.parse(raw.toString());  // TRUE
    ...
  });
});

// TRUE — явный тип с as
ws.on('message', (raw) => {
  const msg = JSON.parse(raw.toString()) as SendMessagePayload;  // TRUE
});
```

```javascript
// TRUE — JavaScript: JSDoc
ws.on('message', (raw) => {
  /** @type {SendMessagePayload} */
  const msg = JSON.parse(raw.toString());  // JSDoc — TRUE
});

// FALSE — JavaScript: нет JSDoc
ws.on('message', (raw) => {
  const msg = JSON.parse(raw.toString());  // нет типа — FALSE
});
```

```typescript
// FALSE — TypeScript: нет типа или any
ws.on('message', (raw) => {
  const msg = JSON.parse(raw.toString());  // тип any — FALSE
});
```

### 2. `x-quality-payload-validated`

Считать `true` при явной валидации разобранного payload перед обработкой:

```typescript
// TRUE — Zod
ws.on('message', (raw) => {
  const result = incomingMessageSchema.safeParse(JSON.parse(raw.toString()));
  if (!result.success) {
    ws.close(1008, 'Invalid message');
    return;
  }
  processMessage(result.data);
});

// TRUE — AJV
import Ajv from 'ajv';
const ajv = new Ajv();
const validate = ajv.compile({ type: 'object', required: ['type', 'payload'], properties: { type: { type: 'string' }, payload: { type: 'object' } } });

ws.on('message', (raw) => {
  const msg = JSON.parse(raw.toString());
  if (!validate(msg)) {
    ws.send(JSON.stringify({ error: 'Invalid message', details: validate.errors }));
    return;
  }
  processMessage(msg as IncomingMessage);
});

// TRUE — ручная валидация полей
ws.on('message', (raw) => {
  const msg = JSON.parse(raw.toString());
  if (!msg.type || !msg.payload) {
    ws.send(JSON.stringify({ error: 'Invalid message format' }));
    return;
  }
  ...
});

// FALSE — parse без валидации
ws.on('message', (raw) => {
  const msg: IncomingMessage = JSON.parse(raw.toString());
  processMessage(msg);  // нет проверки — FALSE
});
```

### 3. `x-quality-errors-defined`

Считать `true` при явной отправке сообщения об ошибке или закрытии соединения с кодом:

```typescript
// TRUE — ws.send с ошибкой
ws.on('message', (raw) => {
  try {
    processMessage(JSON.parse(raw.toString()));
  } catch (err) {
    ws.send(JSON.stringify({ error: err.message }));  // TRUE
  }
});

// TRUE — ws.close с кодом ошибки
ws.close(1008, 'Policy Violation');   // 1008 = Policy Violation — TRUE
ws.close(1011, 'Internal Error');     // 1011 = Internal Server Error — TRUE
ws.close(4000, 'Custom error');       // кастомный код — TRUE

// TRUE — emit('error') на уровне wss
wss.on('connection', (ws) => {
  ws.on('error', (err) => {
    ws.send(JSON.stringify({ type: 'error', message: err.message }));  // TRUE
  });
});

// FALSE — нет обработки ошибок
ws.on('message', (raw) => {
  processMessage(JSON.parse(raw.toString()));  // нет try/catch, нет close — FALSE
});
```

### 4. `x-quality-contract-implemented`

Значение из Pre-scan флага `contractImplemented`.
