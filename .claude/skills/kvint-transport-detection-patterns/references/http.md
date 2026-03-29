# HTTP Transport Detection Patterns

Patterns for detecting HTTP REST endpoints in NestJS and Express services.

---

## NestJS

### 1. Find all controllers

Search for files containing `@Controller`:

```typescript
@Controller('users')           // prefix = /users
@Controller({ path: 'users', version: '1' })  // versioned prefix
export class UsersController {}
```

Also check for `RouterModule.register()` in `AppModule` — it can add additional path prefixes on top of controller paths.

### 2. Extract route handlers

Within each controller class, look for method decorators:

| Decorator         | HTTP method |
|-------------------|-------------|
| `@Get(path?)`     | GET         |
| `@Post(path?)`    | POST        |
| `@Put(path?)`     | PUT         |
| `@Patch(path?)`   | PATCH       |
| `@Delete(path?)`  | DELETE      |
| `@Options(path?)` | OPTIONS     |
| `@Head(path?)`    | HEAD        |
| `@All(path?)`     | ALL methods |

Full path = controller prefix + method path. Examples:
```
@Controller('users') + @Get(':id')   → GET /users/:id
@Controller()        + @Post('auth') → POST /auth
```

### 3. Extract parameters

```typescript
@Param('id') id: string          // path parameter
@Query('page') page: number      // query parameter
@Body() dto: CreateUserDto       // request body
@Headers('x-api-key') key: string // header
@Req() req: Request              // raw request (harder to introspect)
```

### 4. Extract response metadata

```typescript
// Return type annotation
async getUser(): Promise<UserDto> {}

// NestJS Swagger decorators (more reliable)
@ApiResponse({ status: 200, type: UserDto })
@ApiOkResponse({ type: UserDto })
@ApiCreatedResponse({ type: UserDto })
@HttpCode(204)

// Interceptors / class-transformer serialization
@SerializeOptions({ type: UserResponseDto })
```

### 5. Security / auth guards

```typescript
@UseGuards(JwtAuthGuard)          // JWT auth
@UseGuards(ApiKeyGuard)           // API key
@Auth()                           // custom auth decorator (read its implementation)
@Public()                         // marks route as public (no auth)
```

### 6. Global prefix

Check bootstrap (`main.ts`) for:
```typescript
app.setGlobalPrefix('api');
app.setGlobalPrefix('v1', { exclude: ['/health'] });
```

This prefix prepends to ALL routes.

---

## Express

### 1. Find router files

Look for files that export an Express Router or call `app.*`:

```typescript
const router = express.Router();
const router = Router();
```

### 2. Extract route definitions

```typescript
// Direct app methods
app.get('/users', handler)
app.post('/users', handler)
app.put('/users/:id', handler)
app.patch('/users/:id', handler)
app.delete('/users/:id', handler)

// Router methods (same pattern)
router.get('/', handler)
router.post('/', handler)

// Chained
router.route('/users')
  .get(handler)
  .post(handler)
```

### 3. Trace router mounting

```typescript
// In app.ts / server.ts
app.use('/api', apiRouter)
app.use('/api/v1', require('./routes/users'))
```

Full path = mount prefix + router path. Trace all `app.use()` calls to reconstruct paths.

### 4. Extract request data usage

Inside handlers, look for:
```typescript
req.params.id          // path parameter
req.query.page         // query parameter
req.body               // request body (requires body-parser or express.json())
req.headers['x-key']   // header
```

### 5. Auth middleware

```typescript
app.use(authMiddleware)         // global auth
router.use(requireAuth)         // router-scoped auth
app.get('/admin', isAdmin, handler) // route-scoped auth
```

---

## Common Patterns Across Frameworks

### Health check endpoints

Usually at `/health`, `/healthz`, `/ping`, `/status`. Note them but they typically don't need contract schemas.

### Versioning

```
/api/v1/users
/v2/orders
Accept: application/vnd.api+json;version=2
```

### OpenAPI annotation libraries

| Library                  | Framework | Decorator examples                              |
|--------------------------|-----------|-------------------------------------------------|
| `@nestjs/swagger`        | NestJS    | `@ApiProperty`, `@ApiOperation`, `@ApiResponse` |
| `swagger-jsdoc`          | Express   | JSDoc comments: `@swagger`, `@openapi`          |
| `tsoa`                   | Both      | `@Route`, `@Get`, `@Post`, `@Body`, `@Query`    |
| `routing-controllers`    | Express   | `@Controller`, `@Get`, `@Body`                  |

If `@nestjs/swagger` decorators are present, they are the most reliable source of truth for schemas — prefer them over inferring from TypeScript types alone.

---

## Output JSON shape (`endpoint` field)

Each HTTP route handler produces one `TransportEntry` with `endpoint.kind = "http"`.

```json
{
  "contractType": "openapi",
  "file": "src/users/users.controller.ts",
  "symbol": {
    "kind": "method",
    "name": "getUser",
    "startLine": 24,
    "endLine": 28
  },
  "evidence": {
    "matchedPattern": "@Get(':id')",
    "snippet": "@Get(':id')\nasync getUser(@Param('id') id: string): Promise<UserDto> {"
  },
  "endpoint": {
    "kind": "http",
    "method": "GET",
    "path": "/api/users/:id",
    "pathParams": ["id"],
    "queryParams": [],
    "hasBody": false,
    "responseType": "UserDto",
    "auth": "JwtAuthGuard"
  }
}
```

**Правила заполнения `endpoint`:**
- `path` — вычисляй как `globalPrefix + controllerPrefix + methodPath`. Пример: `setGlobalPrefix('api')` + `@Controller('users')` + `@Get(':id')` → `/api/users/:id`
- `pathParams` — все `@Param('name')` аргументы метода; также извлекай из пути (`:id`, `:orderId`)
- `queryParams` — все `@Query('name')` аргументы метода
- `hasBody` — `true` если есть `@Body()` аргумент
- `bodyType` — имя типа `@Body() dto: CreateUserDto` → `"CreateUserDto"`
- `responseType` — возвращаемый тип метода (без `Promise<>` обёртки); если есть `@ApiOkResponse({ type: X })` — используй его
- `auth` — имя guard из `@UseGuards(...)` на методе или контроллере; `"public"` если есть `@Public()`; `undefined` если неизвестно
