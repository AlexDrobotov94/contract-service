# Quality Assessment Patterns — HTTP / Express (TypeScript)

Паттерны для оценки 6 HTTP-критериев качества в Express-приложениях на TypeScript.

В Express нет декораторов маршрутов — типы читаются из сигнатур функций-хэндлеров, дженериков `Request`/`Response` и JSDoc.

---

## 1. `x-quality-params-typed`

**Применяется только если** операция имеет ≥1 параметра (path, query, header).

Считать `true` если параметры типизированы через дженерик `Request<Params, ResBody, ReqBody, Query>` или явное приведение типа с именованной структурой.

```typescript
// TRUE — дженерик Request с именованными типами
app.get('/users/:id', (req: Request<{ id: string }>, res) => {
  const { id } = req.params;  // type: string
});

// TRUE — явное приведение с именованным интерфейсом
interface UserParams { id: string; }
const { id } = req.params as UserParams;

// TRUE — деструктуризация с явным типом
const id: string = req.params.id;

// TRUE — query через дженерик
app.get('/users', (req: Request<{}, {}, {}, { page: string; limit: string }>, res) => {});

// FALSE — неаннотированный доступ к params
app.get('/users/:id', (req, res) => {
  const id = req.params.id;  // тип string | undefined, но без явной аннотации — FALSE
});

// FALSE — приведение к any
const id = req.params.id as any;
```

---

## 2. `x-quality-body-typed`

**Применяется только если** операция принимает тело.

Считать `true` если тело типизировано через дженерик `Request` или явным приведением к именованному интерфейсу/классу (не `any`, не `object`).

```typescript
// TRUE — дженерик Request с именованным body-типом
app.post('/users', (req: Request<{}, {}, CreateUserDto>, res) => {
  const dto = req.body;  // type: CreateUserDto
});

// TRUE — явное приведение к именованному типу
const body = req.body as CreateUserDto;

// FALSE — req.body без типизации
app.post('/users', (req, res) => {
  const body = req.body;    // тип any — FALSE
});

// FALSE — приведение к any или object
const body = req.body as any;
const body = req.body as object;
```

---

## 3. `x-quality-response-typed`

**Применяется всегда.**

Считать `true` если ответ типизирован через дженерик `Response<T>` с именованным типом.

```typescript
// TRUE — дженерик Response с именованным типом
app.get('/users', (req, res: Response<UserDto[]>) => {
  res.json(users);
});

app.get('/users/:id', (req, res: Response<UserDto>) => {
  res.json(user);
});

// FALSE — res.json() без типизации Response
app.get('/users', (req, res) => {
  res.json(users);  // нет типизации ответа — FALSE
});

// FALSE — Response<any>
(req, res: Response<any>) => { ... }
```

Swagger-jsdoc аннотации (`@openapi`) **не засчитываются** — это документация, не TypeScript-тип.

---

## 4. `x-quality-body-validated`

**Применяется только если** операция принимает тело.

Считать `true` при выполнении любого из условий:
- `express-validator`: цепочка `body('field').isEmail()...` + `validationResult(req)`
- `Zod`: `schema.parse(req.body)` или `schema.safeParse(req.body)`
- `Joi`: `Joi.object({...}).validate(req.body)` + проверка ошибки
- `AJV`: `ajv.compile(schema)` + `validate(req.body)` + проверка `validate.errors`

```typescript
// TRUE — express-validator
import { body, validationResult } from 'express-validator';
app.post('/users', [
  body('email').isEmail(),
  body('name').isLength({ min: 1 }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  ...
});

// TRUE — Zod
const createUserSchema = z.object({ email: z.string().email() });
app.post('/users', (req, res) => {
  const dto = createUserSchema.parse(req.body);
  ...
});

// TRUE — Joi
const schema = Joi.object({ email: Joi.string().email().required() });
const { error } = schema.validate(req.body);
if (error) return res.status(400).json({ error: error.message });

// TRUE — AJV
import Ajv from 'ajv';
const ajv = new Ajv();
const validate = ajv.compile({ type: 'object', required: ['email'], properties: { email: { type: 'string' } } });
app.post('/users', (req, res) => {
  if (!validate(req.body)) return res.status(400).json({ errors: validate.errors });
  ...
});

// FALSE — только type cast, без runtime-валидации
const body = req.body as CreateUserDto;
```

---

## 5. `x-quality-errors-defined`

**Применяется всегда.**

Считать `true` при выполнении любого из условий:
- Явный `res.status(4xx/5xx).json(...)` в теле хэндлера
- `next(error)` с передачей объекта с кодом ошибки в error-middleware
- `throw` объекта HttpError (например, `http-errors` библиотека)

```typescript
// TRUE — явный ответ с кодом ошибки
app.get('/users/:id', async (req, res) => {
  const user = await db.find(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// TRUE — next() с ошибкой через http-errors
import createError from 'http-errors';
next(createError(404, 'User not found'));

// FALSE — только успешный ответ
app.get('/users/:id', (req, res) => {
  res.json(user);  // нет обработки ошибок
});
```

Swagger-jsdoc аннотации (`@openapi responses: 404`) **не засчитываются** — документация, не поведение кода.

---

## 6. `x-quality-contract-implemented`

**Применяется всегда.** Значение из Pre-scan флага `contractImplemented`.

```json
// TRUE — в package.json:
{
  "dependencies": {
    "@kvint/user-contracts": "^1.0.0"
  }
}

// FALSE — пакет отсутствует
```
