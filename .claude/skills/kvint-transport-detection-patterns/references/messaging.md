# Messaging Transport Detection Patterns

Patterns for detecting message-based transports: RabbitMQ, Kafka, Redis pub/sub, and Bull queues.

---

## NestJS Microservices (`@nestjs/microservices`)

### Bootstrap — detect active transport

In `main.ts` or wherever `NestFactory.createMicroservice` / `connectMicroservice` is called:

```typescript
import { Transport } from '@nestjs/microservices';

// Standalone microservice
NestFactory.createMicroservice(AppModule, {
  transport: Transport.RMQ,       // RabbitMQ
  options: {
    urls: ['amqp://localhost'],
    queue: 'orders_queue',
    queueOptions: { durable: true },
  },
});

// Hybrid: HTTP + microservice
app.connectMicroservice({
  transport: Transport.KAFKA,
  options: {
    client: { brokers: ['localhost:9092'] },
    consumer: { groupId: 'orders-consumer' },
  },
});

// Redis transport
{ transport: Transport.REDIS, options: { host: 'localhost', port: 6379 } }

// TCP transport (internal, not a public contract)
{ transport: Transport.TCP }

// NATS
{ transport: Transport.NATS, options: { url: 'nats://localhost:4222' } }
```

**Transport enum → protocol mapping:**

| `Transport.*`  | Queue technology | protocol value |
|----------------|------------------|----------------|
| `RMQ`          | RabbitMQ         | `queue`        |
| `KAFKA`        | Kafka            | `queue`        |
| `REDIS`        | Redis pub/sub    | `queue`        |
| `NATS`         | NATS             | `queue`        |
| `TCP`          | Internal TCP     | (internal, skip) |
| `GRPC`         | gRPC             | → see grpc.md  |

### Message handlers

```typescript
import { MessagePattern, EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';

@MessagePattern('get_order')            // request-reply pattern
async getOrder(@Payload() data: GetOrderDto): Promise<OrderDto> {}

@MessagePattern({ cmd: 'create_order' }) // object pattern (common for RMQ/Kafka)
async createOrder(@Payload() dto: CreateOrderDto) {}

@EventPattern('order_created')          // fire-and-forget event
async handleOrderCreated(@Payload() event: OrderCreatedEvent) {}

// With transport context
@MessagePattern('get_order')
async getOrder(
  @Payload() data: GetOrderDto,
  @Ctx() context: RmqContext,           // RMQ-specific context
) {}
```

**What to extract:**
- Pattern string / object → message name / topic / routing key
- `@Payload()` type → message payload schema
- Return type → reply schema (only for `@MessagePattern`, not `@EventPattern`)
- Whether it's request-reply (`@MessagePattern`) or event (`@EventPattern`)

### RabbitMQ exchange / queue config

Check module registration:

```typescript
// @nestjs/microservices in AppModule or specific module
ClientsModule.register([{
  name: 'ORDERS_SERVICE',
  transport: Transport.RMQ,
  options: {
    urls: ['amqp://localhost'],
    queue: 'orders_queue',
    exchange: 'orders_exchange',
    exchangeType: 'topic',
    routingKey: 'order.created',
  },
}])
```

---

## `@golevelup/nestjs-rabbitmq`

A popular alternative to `@nestjs/microservices` for RabbitMQ.

### Module registration

```typescript
RabbitMQModule.forRoot({
  exchanges: [
    { name: 'orders', type: 'topic' },
    { name: 'notifications', type: 'fanout' },
  ],
  uri: 'amqp://localhost',
})
```

### Subscribers

```typescript
import { RabbitSubscribe, RabbitRPC } from '@golevelup/nestjs-rabbitmq';

@RabbitSubscribe({
  exchange: 'orders',
  routingKey: 'order.created',
  queue: 'order-processor',
})
async handleOrderCreated(msg: OrderCreatedEvent) {}

@RabbitRPC({
  exchange: 'orders',
  routingKey: 'order.get',
  queue: 'order-query',
})
async getOrder(msg: GetOrderQuery): Promise<OrderDto> {}
```

**What to extract:**
- `exchange` → exchange name
- `routingKey` → routing key / topic
- `queue` → queue name
- `@RabbitRPC` = request-reply, `@RabbitSubscribe` = event/consume
- Parameter type → message schema
- Return type (for RPC) → reply schema

---

## Bull / BullMQ (job queues)

Bull is a job queue, not a message broker in the traditional sense, but it is a messaging transport.

### Queue producers

```typescript
import { InjectQueue } from '@nestjs/bull'; // or @nestjs/bullmq
import { Queue } from 'bull'; // or bullmq

@InjectQueue('email') private emailQueue: Queue

await this.emailQueue.add('send-welcome', { userId, email });
await this.emailQueue.add({ type: 'order-confirmation', orderId });
```

### Queue consumers (processors)

```typescript
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('email')
export class EmailProcessor {
  @Process('send-welcome')
  async handleWelcome(job: Job<{ userId: string; email: string }>) {}

  @Process()                    // default processor for all jobs
  async handleAll(job: Job) {}
}
```

**What to extract:**
- `@Processor('queue-name')` → queue name
- `@Process('job-name')` → job type / name
- `job: Job<DataType>` → job payload schema

---

## Standalone `amqplib` / `kafkajs` (Express or non-NestJS)

When the framework is Express or vanilla Node and messaging is done via raw clients:

### amqplib (RabbitMQ)

```typescript
const channel = await connection.createChannel();

channel.assertQueue('orders', { durable: true });
channel.consume('orders', (msg) => { /* handler */ });

channel.publish('orders-exchange', 'order.created', Buffer.from(JSON.stringify(payload)));
channel.sendToQueue('orders', Buffer.from(JSON.stringify(data)));
```

**What to extract:** queue / exchange names, routing keys, payload shape from JSON.stringify calls.

### kafkajs

```typescript
const consumer = kafka.consumer({ groupId: 'orders-group' });
await consumer.subscribe({ topic: 'order-events', fromBeginning: false });
await consumer.run({
  eachMessage: async ({ topic, message }) => { /* handler */ }
});

const producer = kafka.producer();
await producer.send({
  topic: 'order-events',
  messages: [{ value: JSON.stringify(orderEvent) }],
});
```

**What to extract:** topic names, consumer group IDs, message schemas from JSON.stringify / TypeScript types.

---

## Output Format

For each detected messaging channel, record:

```
Exchange/Topic: orders-exchange
  Routing key:  order.created
  Queue:        order-processor
  Direction:    consume (inbound)
  Pattern:      event (fire-and-forget)
  Payload type: OrderCreatedEvent  → { orderId: string, customerId: string, total: number }

Queue: email
  Job name:     send-welcome
  Direction:    produce + consume
  Pattern:      job
  Payload type: { userId: string, email: string }
```
