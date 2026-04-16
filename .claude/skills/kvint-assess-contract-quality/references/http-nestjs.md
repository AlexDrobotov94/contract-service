# Quality Assessment Patterns — HTTP / NestJS

Паттерны для оценки 6 HTTP-критериев качества в NestJS-контроллерах.

---

## 1. `x-quality-params-typed`

**Применяется только если** операция имеет ≥1 параметра (path, query, header).

Считать `true` если **все** параметры операции имеют явный TypeScript-тип, отличный от `any` и отличный от отсутствия аннотации.

```typescript
// TRUE — явные типы
@Param('id') id: string
@Param('chatId') chatId: number
@Query('page') page: number
@Query() query: PaginationDto          // именованный DTO — тоже TRUE
@Headers('x-api-key') apiKey: string

// FALSE — any или отсутствие аннотации
@Param('id') id: any
@Param('id') id                        // нет аннотации
@Query() query: any
@Query() query: object
@Headers('x-api-key') apiKey          // нет аннотации
```

**Особый случай:** `@Param()` без имени с типом `any` или без типа — всегда FALSE. `@ApiProperty` на DTO-классе не влияет на этот критерий — оцениваем аннотацию аргумента метода контроллера.

---

## 2. `x-quality-body-typed`

**Применяется только если** операция принимает тело запроса (декоратор `@Body()` присутствует; метод не GET и не DELETE без тела).

Считать `true` если тип `@Body()` — именованный класс, интерфейс или дженерик с явным типом-аргументом. Считать `false` если тип `any`, `object`, `Record<string, any>`, `{[key: string]: any}` или аннотация отсутствует.

```typescript
// TRUE
@Body() dto: CreateMessageDto
@Body() body: UpdateUserRequest
@Body('name') name: string             // тип примитива — тоже TRUE

// FALSE
@Body() body: any
@Body() body: object
@Body() body: Record<string, any>
@Body() body                           // нет аннотации
@Body() body: { [key: string]: unknown } // анонимная структура
```

---

## 3. `x-quality-response-typed`

**Применяется всегда.**

Считать `true` если метод имеет возвращаемый тип, отличный от `any`, `Promise<any>`, `Promise<void>`, `object`, и тип не отсутствует. Swagger-декораторы `@ApiOkResponse({ type: T })` и `@ApiCreatedResponse({ type: T })` также засчитываются как `true`.

```typescript
// TRUE — явная TypeScript-аннотация возвращаемого типа
async getUser(): Promise<UserDto>
async getUsers(): Promise<UserDto[]>
async create(): Promise<{ id: string }>    // явная структура — TRUE
async getCount(): Promise<number>

// FALSE
async getUser(): Promise<any>
async getUser()                             // нет аннотации
async getUser(): any
async getUser(): Promise<object>
```

Swagger-декораторы (`@ApiOkResponse`, `@ApiCreatedResponse`) **не засчитываются** — они описывают документацию, а не реальный возврат из функции.

---

## 4. `x-quality-body-validated`

**Применяется только если** операция принимает тело запроса.

Считать `true` при выполнении любого из условий:
- Тип `@Body()` — класс с хотя бы одним `class-validator` декоратором (`@IsString()`, `@IsNumber()`, `@IsNotEmpty()`, `@IsEmail()`, `@IsEnum()`, `@IsArray()`, `@Min()`, `@Max()`, `@MinLength()`, `@MaxLength()`, `@IsOptional()` в сочетании с другими и т.д.)
- Используется `ValidationPipe` глобально в `main.ts` (`app.useGlobalPipes(new ValidationPipe())`) И тип `@Body()` — класс (не интерфейс — интерфейсы стираются в JS и не валидируются)
- `@UsePipes(new ValidationPipe())` на методе или классе контроллера И тип `@Body()` — класс
- Тип реализует Zod-схему (файл DTO содержит `z.object(...)` и `.parse()` / `.safeParse()` используется в хэндлере или пайпе)
- Используется Joi-валидация через JoiPipe или явно в методе
- AJV: `ajv.compile(schema)` + `validate(req.body)` в хэндлере или кастомном пайпе

```typescript
// TRUE — class-validator
export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsNumber()
  parentId?: number;
}

// TRUE — Zod
const CreateMessageSchema = z.object({
  content: z.string().min(1),
  parentId: z.number().optional(),
});

// TRUE — AJV (кастомный пайп или напрямую в методе)
import Ajv from 'ajv';
const ajv = new Ajv();
const validate = ajv.compile({ type: 'object', required: ['content'], properties: { content: { type: 'string' } } });

@Post()
createMessage(@Body() body: unknown, @Res() res: Response) {
  if (!validate(body)) throw new BadRequestException(validate.errors);
  ...
}

// FALSE — интерфейс (class-validator не работает с интерфейсами)
export interface CreateMessageDto {
  content: string;
}

// FALSE — класс без декораторов валидации
export class CreateMessageDto {
  content: string;
  parentId?: number;
}
```

**Проверка глобального ValidationPipe:** если DTO — класс с декораторами, а ValidationPipe прописан в `main.ts` — это `true` даже без `@UsePipes` на контроллере.

---

## 5. `x-quality-errors-defined`

**Применяется всегда.**

Считать `true` при выполнении любого из условий:
- Явный `throw new HttpException(...)` / `throw new BadRequestException(...)` / `throw new NotFoundException(...)` и т.д. с 4xx/5xx кодом в теле метода или сервиса, который вызывается из метода
- `return res.status(4xx).json(...)` если метод использует `@Res()`

```typescript
// TRUE — явный throw в контроллере или вызываемом сервисе
throw new NotFoundException('Message not found');
throw new BadRequestException('Invalid input');
throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
throw new ConflictException();

// FALSE — нет throw, нет явного ответа с ошибкой
async getUser(): Promise<UserDto> {
  return this.userService.find(id);
}
```

**Не считается** как errors-defined:
- Swagger-декораторы (`@ApiNotFoundResponse`, `@ApiBadRequestResponse`) — это документация, не поведение
- `this.logger.error(...)` — логирование, не HTTP-ответ
- `throw new Error(...)` без HTTP-статуса — не HTTP-ошибка

---

## 6. `x-quality-contract-implemented`

**Применяется всегда.** Значение берётся из Pre-scan флага `contractImplemented` — одинаково для всех операций одного сервиса.

```json
// TRUE — в package.json (любой из разделов):
{
  "dependencies": {
    "@kvint/chat-contracts": "^1.0.0"
  }
}

// FALSE — пакет отсутствует в package.json
```

Имя пакета — `@kvint/<service-id>-contracts`, где `<service-id>` соответствует `id` в `metadata/service.yaml`.
