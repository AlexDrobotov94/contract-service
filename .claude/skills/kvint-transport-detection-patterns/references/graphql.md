# GraphQL Transport Detection Patterns

Patterns for detecting GraphQL APIs in NestJS and Express services.

---

## Detection Signals

GraphQL is present when you find any of:
- `@nestjs/graphql` in dependencies (NestJS code-first or schema-first)
- `apollo-server-express`, `apollo-server`, `apollo-server-fastify` (standalone Apollo)
- `graphql-yoga` (standalone Yoga)
- `type-graphql` (decorator-based schema builder)
- `.graphql` or `.gql` schema files in the repository

---

## NestJS GraphQL (Code-First)

Code-first is the most common NestJS approach: decorators generate the schema.

### Module setup

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: 'schema.gql',    // generated schema path
  autoSchemaFile: true,            // in-memory (no file)
  playground: true,
  subscriptions: {
    'graphql-ws': true,            // WebSocket subscriptions
    'subscriptions-transport-ws': true,
  },
})
```

### Resolvers

```typescript
import { Resolver, Query, Mutation, Subscription, Args, ID } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';

@Resolver(() => Order)
export class OrdersResolver {

  @Query(() => Order, { name: 'order', nullable: true })
  async getOrder(@Args('id', { type: () => ID }) id: string): Promise<Order | null> {}

  @Query(() => [Order], { name: 'orders' })
  async getOrders(
    @Args('status', { type: () => OrderStatus, nullable: true }) status?: OrderStatus
  ): Promise<Order[]> {}

  @Mutation(() => Order)
  async createOrder(@Args('input') input: CreateOrderInput): Promise<Order> {}

  @Subscription(() => Order, {
    filter: (payload, variables) => payload.orderId === variables.orderId,
  })
  orderUpdated(@Args('orderId', { type: () => ID }) orderId: string) {
    return pubSub.asyncIterator('orderUpdated');
  }
}
```

**What to extract:**
- `@Query(() => ReturnType, { name? })` → query name (defaults to method name), return type
- `@Mutation(() => ReturnType)` → mutation name, return type
- `@Subscription(() => ReturnType)` → subscription name (implies WebSocket transport too)
- `@Args('argName', { type, nullable })` → argument name, type, required/optional
- Resolver class name → associated object type (`@Resolver(() => Order)` → resolves `Order`)

### Object types and input types

```typescript
import { ObjectType, Field, ID, InputType, registerEnumType } from '@nestjs/graphql';

@ObjectType()
export class Order {
  @Field(() => ID)
  id: string;

  @Field()
  total: number;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => [OrderItem])
  items: OrderItem[];

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class CreateOrderInput {
  @Field()
  customerId: string;

  @Field(() => [OrderItemInput])
  items: OrderItemInput[];
}

enum OrderStatus { PENDING, CONFIRMED, SHIPPED }
registerEnumType(OrderStatus, { name: 'OrderStatus' });
```

**What to extract:**
- `@ObjectType()` → GraphQL output type
- `@InputType()` → GraphQL input type
- `@Field()` on each property → field name, type, nullable
- `registerEnumType()` → enum definition

### Schema-First (alternative)

If `typePaths` is used instead of `autoSchemaFile`, the schema is in `.graphql` files:

```typescript
GraphQLModule.forRoot({
  typePaths: ['./**/*.graphql'],
})
```

Read those `.graphql` files directly — they are the authoritative schema.

---

## NestJS GraphQL (Schema-First)

```graphql
# orders.graphql
type Query {
  order(id: ID!): Order
  orders(status: OrderStatus): [Order!]!
}

type Mutation {
  createOrder(input: CreateOrderInput!): Order!
}

type Subscription {
  orderUpdated(orderId: ID!): Order!
}

type Order {
  id: ID!
  total: Float!
  status: OrderStatus!
  items: [OrderItem!]!
  notes: String
}

input CreateOrderInput {
  customerId: String!
  items: [OrderItemInput!]!
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
}
```

Read all `.graphql` / `.gql` files in the codebase. The resolver classes will have `@ResolveField` or `@Query`/`@Mutation` decorators that implement these.

---

## Apollo Server with Express

### Setup detection

```typescript
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';

const server = new ApolloServer({ typeDefs, resolvers });
app.use('/graphql', expressMiddleware(server));

// Or older API
const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app, path: '/graphql' });
```

### Type definitions

```typescript
const typeDefs = gql`
  type Query {
    user(id: ID!): User
  }
  type User {
    id: ID!
    name: String!
  }
`;
// OR loaded from file:
const typeDefs = readFileSync('./schema.graphql', 'utf8');
```

Look for `.graphql` files or `gql` template literal tags.

### Resolvers

```typescript
const resolvers = {
  Query: {
    user: (parent, { id }, context) => findUser(id),
  },
  Mutation: {
    createUser: (parent, { input }, context) => createUser(input),
  },
};
```

---

## graphql-yoga

```typescript
import { createYoga } from 'graphql-yoga';

const yoga = createYoga({ schema, graphqlEndpoint: '/graphql' });
app.use('/graphql', yoga);
```

Same approach: look for `.graphql` files or `buildSchema` / `makeExecutableSchema` calls.

---

## type-graphql (standalone)

```typescript
import { buildSchema } from 'type-graphql';

const schema = await buildSchema({
  resolvers: [OrdersResolver],
  emitSchemaFile: 'schema.graphql',
});
```

Resolver and type decorators are identical to NestJS code-first (`@Resolver`, `@Query`, `@Mutation`, `@ObjectType`, `@Field`, etc.).

---

## Subscriptions Note

If GraphQL subscriptions are enabled (`@Subscription` decorator or `Subscription` type in schema), the service also exposes a **WebSocket** transport for subscriptions. Note this in your transport inventory and cross-reference with `websocket.md` patterns.

---

## Output Format

```
GraphQL API: /graphql  (code-first, NestJS ApolloDriver)
  Queries:
    order(id: ID!): Order
    orders(status: OrderStatus): [Order!]!
  Mutations:
    createOrder(input: CreateOrderInput!): Order!
  Subscriptions:
    orderUpdated(orderId: ID!): Order!   ← also implies WebSocket transport

Types:
  Order:       { id: ID!, total: Float!, status: OrderStatus!, items: [OrderItem!]!, notes: String }
  CreateOrderInput: { customerId: String!, items: [OrderItemInput!]! }
  OrderStatus: enum [PENDING, CONFIRMED, SHIPPED]
```

Contract path convention for `metadata/service.yaml`:
```yaml
contracts:
  - protocol: graphql
    path: graphql/schema.graphql
```

---

## Output JSON shape (`endpoint` field)

Each resolver method (`@Query`, `@Mutation`, `@Subscription`) produces one `TransportEntry` with `endpoint.kind = "graphql"`.

```json
{
  "contractType": "graphql",
  "file": "src/orders/orders.resolver.ts",
  "symbol": {
    "kind": "method",
    "name": "getOrder",
    "startLine": 14,
    "endLine": 18
  },
  "evidence": {
    "matchedPattern": "@Query(() => Order)",
    "snippet": "@Query(() => Order, { name: 'order', nullable: true })\nasync getOrder(@Args('id', { type: () => ID }) id: string): Promise<Order | null> {"
  },
  "endpoint": {
    "kind": "graphql",
    "operation": "query",
    "name": "order",
    "args": [
      { "name": "id", "type": "ID", "nullable": false }
    ],
    "returnType": "Order"
  }
}
```

**Правила заполнения `endpoint`:**
- `operation` — из декоратора: `@Query` → `"query"`, `@Mutation` → `"mutation"`, `@Subscription` → `"subscription"`
- `name` — из `{ name: 'order' }` опции декоратора; если не задана — имя TypeScript-метода
- `args` — каждый `@Args('name', { type, nullable })` аргумент; `nullable: true` если `{ nullable: true }` или тип опциональный
- `returnType` — из декоратора `@Query(() => ReturnType)` или `@Mutation(() => ReturnType)`; для массивов: `"[Order!]!"`
