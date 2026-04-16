# Quality Assessment Patterns — AsyncAPI / NestJS

Паттерны для оценки 4 AsyncAPI-критериев качества в NestJS-сервисах.

Охватывает: **RabbitMQ** (`@golevelup/nestjs-rabbitmq`, `@nestjs/microservices`) и **Socket.IO** (`@nestjs/websockets`).

Единица оценки: одна операция AsyncAPI (одно событие Socket.IO или один RabbitMQ subscriber).

---

## RabbitMQ

### 1. `x-quality-payload-typed`

Считать `true` если обработчик имеет явный TypeScript-тип для аргумента сообщения (не `any`, не без аннотации).

```typescript
// TRUE — @golevelup/nestjs-rabbitmq
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

@RabbitSubscribe({ exchange: 'chat', routingKey: 'message.created' })
async handleMessageCreated(msg: MessageCreatedEvent): Promise<void> {
  // msg: MessageCreatedEvent — TRUE
}

// TRUE — @nestjs/microservices
@MessagePattern({ cmd: 'create_message' })
async createMessage(@Payload() dto: CreateMessageDto): Promise<MessageDto> {
  // dto: CreateMessageDto — TRUE
}

// FALSE — any
@RabbitSubscribe({ exchange: 'chat', routingKey: 'message.created' })
async handleMessageCreated(msg: any): Promise<void> {  // FALSE
}

// FALSE — нет аннотации
@RabbitSubscribe({ ... })
async handleMessageCreated(msg): Promise<void> {  // FALSE
}
```

### 2. `x-quality-payload-validated`

Считать `true` при выполнении любого из условий:
- Тип аргумента — класс с `class-validator` декораторами
- Применяется `ValidationPipe` (глобально или через `@UsePipes`)
- Ручная валидация с явным обработчиком ошибок
- Zod: `schema.parse(msg)` или `schema.safeParse(msg)` до обработки
- AJV: `ajv.compile(schema)` + `validate(msg)` до обработки

```typescript
// TRUE — DTO с class-validator + ValidationPipe
export class MessageCreatedEvent {
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

// TRUE — @UsePipes на методе
@RabbitSubscribe({ ... })
@UsePipes(new ValidationPipe())
async handleMessageCreated(@Payload() dto: MessageCreatedEvent) { ... }

// TRUE — Zod
import { z } from 'zod';
const messageCreatedSchema = z.object({
  chatId: z.string().uuid(),
  content: z.string().min(1),
});

async handleMessageCreated(msg: unknown): Promise<void> {
  const dto = messageCreatedSchema.parse(msg);  // бросит ZodError если невалидно — TRUE
  await this.messageService.create(dto);
}

// TRUE — Zod safeParse (с явной обработкой ошибки)
async handleMessageCreated(msg: unknown, amqpMsg: ConsumeMessage): Promise<void> {
  const result = messageCreatedSchema.safeParse(msg);
  if (!result.success) {
    this.channel.nack(amqpMsg, false, false);
    return;
  }
  await this.messageService.create(result.data);
}

// TRUE — AJV
import Ajv from 'ajv';
const ajv = new Ajv();
const validate = ajv.compile({ type: 'object', required: ['chatId', 'content'], properties: { chatId: { type: 'string' }, content: { type: 'string' } } });

@RabbitSubscribe({ exchange: 'chat', routingKey: 'message.created' })
async handleMessageCreated(msg: MessageCreatedEvent, amqpMsg: ConsumeMessage): Promise<void> {
  if (!validate(msg)) {
    this.channel.nack(amqpMsg, false, false);
    return;
  }
  await this.messageService.create(msg);
}

// FALSE — интерфейс (class-validator не работает с interface)
export interface MessageCreatedEvent {
  chatId: string;
  content: string;
}

// FALSE — класс без декораторов
export class MessageCreatedEvent {
  chatId: string;
  content: string;
}
```

### 3. `x-quality-errors-defined`

Считать `true` при выполнении любого из условий:
- `try/catch` с явным обработчиком (nack, DLX-публикация, логирование + повторный выброс)
- `errorHandler` опция в `@RabbitSubscribe`
- Конфигурация Dead Letter Exchange (DLX) в модуле

```typescript
// TRUE — try/catch с nack
@RabbitSubscribe({
  exchange: 'chat',
  routingKey: 'message.created',
  queue: 'chat-service.message.created',
})
async handleMessageCreated(
  msg: MessageCreatedEvent,
  amqpMsg: ConsumeMessage,
): Promise<void> {
  try {
    await this.messageService.create(msg);
  } catch (error) {
    this.logger.error('Failed to handle message', error);
    this.channel.nack(amqpMsg, false, false);  // TRUE
  }
}

// TRUE — errorHandler опция
@RabbitSubscribe({
  exchange: 'chat',
  routingKey: 'message.created',
  errorHandler: defaultNackErrorHandler,  // TRUE
})
async handleMessageCreated(msg: MessageCreatedEvent) { ... }

// TRUE — DLX настроен в RabbitMQModule.forRoot()
// Проверить: deadLetterExchange или deadLetterRoutingKey в конфигурации очереди

// FALSE — нет try/catch, нет errorHandler
@RabbitSubscribe({ exchange: 'chat', routingKey: 'message.created' })
async handleMessageCreated(msg: MessageCreatedEvent): Promise<void> {
  await this.messageService.create(msg);  // нет обработки ошибок — FALSE
}
```

### 4. `x-quality-contract-implemented`

Значение из Pre-scan флага `contractImplemented` (проверка `@kvint/<service>-contracts` в `package.json`).

---

## Socket.IO

### 1. `x-quality-payload-typed`

Считать `true` если `@MessageBody()` имеет явный TypeScript-тип (не `any`).

```typescript
// TRUE — @nestjs/websockets
import { SubscribeMessage, MessageBody, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway()
export class ChatGateway {
  @SubscribeMessage('sendMessage')
  handleSendMessage(
    @MessageBody() dto: SendMessageDto,  // TRUE
  ): void {
    ...
  }
}

// TRUE — с возвращаемым событием
@SubscribeMessage('createRoom')
async handleCreateRoom(
  @MessageBody() dto: CreateRoomDto,   // TRUE
  @ConnectedSocket() client: Socket,
): Promise<WsResponse<RoomDto>> {
  ...
}

// FALSE
@SubscribeMessage('sendMessage')
handleSendMessage(@MessageBody() data: any) { ... }  // FALSE

@SubscribeMessage('sendMessage')
handleSendMessage(@MessageBody() data) { ... }        // FALSE — нет аннотации
```

### 2. `x-quality-payload-validated`

Считать `true` при выполнении любого из условий:
- DTO — класс с `class-validator` декораторами + ValidationPipe
- `@UsePipes(new ValidationPipe())` на методе или гейтвее

```typescript
// TRUE — ValidationPipe на гейтвее
@WebSocketGateway()
@UsePipes(new ValidationPipe())
export class ChatGateway {
  @SubscribeMessage('sendMessage')
  handleSendMessage(@MessageBody() dto: SendMessageDto) { ... }
}

// TRUE — ValidationPipe на конкретном методе
@SubscribeMessage('sendMessage')
@UsePipes(new ValidationPipe())
handleSendMessage(@MessageBody() dto: SendMessageDto) { ... }

// TRUE — DTO с class-validator
export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  chatId: string;
}

// FALSE — интерфейс без валидации
export interface SendMessageDto { content: string; chatId: string; }
```

### 3. `x-quality-errors-defined`

Считать `true` при выполнении любого из условий:
- `throw new WsException(...)` в методе
- Возврат объекта с полем `error` (pattern-based error response)
- `handleError()` метод в гейтвее (интерфейс `OnGatewayConnection`)
- `try/catch` с явной обработкой

```typescript
// TRUE — WsException
import { WsException } from '@nestjs/websockets';

@SubscribeMessage('sendMessage')
async handleSendMessage(@MessageBody() dto: SendMessageDto) {
  if (!this.canSend(dto.chatId)) {
    throw new WsException('Access denied');  // TRUE
  }
}

// TRUE — error в ответном payload
@SubscribeMessage('sendMessage')
handleSendMessage(@MessageBody() dto: SendMessageDto): WsResponse<unknown> {
  if (!dto.content) {
    return { event: 'error', data: { message: 'Content required' } };  // TRUE
  }
  ...
}

// TRUE — handleError в гейтвее
@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection {
  handleError(client: Socket, error: Error) {
    client.emit('error', { message: error.message });  // TRUE
  }
}

// FALSE — нет обработки ошибок
@SubscribeMessage('sendMessage')
handleSendMessage(@MessageBody() dto: SendMessageDto): void {
  this.chatService.sendMessage(dto);  // нет throw, нет error response — FALSE
}
```

### 4. `x-quality-contract-implemented`

Значение из Pre-scan флага `contractImplemented`.
