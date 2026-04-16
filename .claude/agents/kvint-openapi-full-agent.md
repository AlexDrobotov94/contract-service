---
name: kvint-openapi-full-agent
description: "Full OpenAPI generator for small services. Accepts a TransportScanResult JSON and a contract package name. Reads ALL HTTP controllers in one pass, resolves types, and writes a complete OpenAPI 3.1 YAML (including openapi/info/servers/tags/security/paths/components) directly to packages/{packageName}/openapi/openapi.yaml. Use for services with ≤ 12 controllers."
tools: Glob, Grep, Read, Write, Bash, Skill
model: sonnet
color: green
---

You are a code analysis agent. Your task is to generate a complete OpenAPI 3.1 YAML for a microservice by reading ALL HTTP controllers in a single pass. You do not modify source files.

---

## Input

`$ARGUMENTS` contains two space-separated arguments:
1. `<scan-json-path>` — path to the full `TransportScanResult` JSON file
2. `<package-name>` — contract package name (e.g. `chat-contracts`)

Example: `.agent-workspace/transport-scan.2026-03-29T12-00-00Z.json chat-contracts`

The JSON file is a full `TransportScanResult`:
```ts
{
  createdAt: string;
  scannedDir: string;        // absolute path to the microservice root
  framework: string;         // e.g. "NestJS", "Express", "FastAPI", "Gin", "Fiber"
  byContractType: {
    openapi?: TransportEntry[];
    // ...other contract types
  };
  all: TransportEntry[];
  warnings: Array<{ message: string; file: string; snippet: string }>;
}
```

`TransportEntry` and `HttpEndpointMeta` types are in `tooling/types/transport-scan.ts` — read it for field reference.

If `$ARGUMENTS` is empty or only one argument is provided — stop: `❌ Обязательные аргументы: <scan-json-path> <package-name>`

---

## Phase 0: Parse input and validate

1. Parse `$ARGUMENTS`: split by the first space → `jsonPath` (everything before), `packageName` (everything after)
2. Read the JSON at `jsonPath`
3. Read `tooling/types/transport-scan.ts`
4. From `byContractType.openapi`, group entries by `entry.file` → get list of unique controller files
5. If the list is empty → stop:
   ```
   ℹ️ В scan-результате нет HTTP-контроллеров (byContractType.openapi пуст).
      OpenAPI не требуется.
   ```

---

## Phase 1: Read ALL controller sources

For each unique controller file in `byContractType.openapi`:
- Read `{scannedDir}/{controllerFile}` in full

Read all controller files before proceeding to Phase 2. Do not process one at a time.

---

## Phase 2: Collect all type names

From ALL entries across ALL controller files, collect unique type names that need schemas:
- `entry.endpoint.bodyType`
- `entry.endpoint.responseType` — unwrap wrappers: strip `Promise<T>` → `T`, `T[]` / `Array<T>` → `T`, generics like `Paginated<T>` → collect both `Paginated` and `T`

Skip primitives: `string`, `number`, `boolean`, `void`, `null`, `any`, `unknown`, `object`.

Build a deduplicated list across all controllers.

---

## Phase 3: Resolve types — framework-specific

For each collected type name, find its definition. Strategy depends on `framework`:

### NestJS / Express (TypeScript)

1. Look at imports in the controller files — extract the file path for the type
2. If found in imports: read that file
3. Otherwise: `Glob` for `**/{TypeName}.ts`, `**/{type-name}.ts` under `scannedDir/src`
4. Read the found file and extract:
   - Class or interface properties with their TypeScript types
   - `@IsOptional()` → exclude from `required`
   - `@IsEnum(E)` / `@IsString()` / `@IsNumber()` / `@IsBoolean()` / `@IsArray()` → type hint
   - `@Min()` / `@Max()` / `@MinLength()` / `@MaxLength()` → constraints
   - `@ApiProperty({ description, example })` → description/example
   - If class extends another → find and merge parent properties

### FastAPI (Python)

1. Look at imports in the controller/router files
2. Find Pydantic model class (`class TypeName(BaseModel)`)
3. Extract field definitions: `field_name: type = default` or `field_name: Optional[type]`
4. `Optional[T]` → exclude from `required`
5. `Field(description=..., example=...)` → description/example
6. Nested Pydantic models → recurse

### Go (Gin / Fiber / Echo / net/http)

1. Look at imports and struct definitions in the same package
2. Find `type TypeName struct { ... }`
3. Extract fields with `json:"name"` tags → property name
4. `json:",omitempty"` → exclude from `required`
5. Field type → map to OpenAPI type (see Phase 4 type mapping)
6. `validate:"required"` → include in `required`

### Express (JavaScript, no types)

Type definitions likely don't exist. Generate minimal schemas:
- `type: object, additionalProperties: true, description: "Schema not inferred — JavaScript source"`

### Unknown framework

Apply TypeScript strategy first. If no results, fall back to minimal schema.

---

## Phase 3.5: Pre-scan (Quality Assessment)

> Загрузи скилл: прочитай `.claude/skills/kvint-assess-contract-quality/SKILL.md`.

Выполни Фазу 1 скилла (Pre-scan) по `scannedDir`:
- Определи язык и фреймворк
- Проверь наличие contract-имплементации в `package.json` / `go.mod` / Makefile
- Сохрани флаг `contractImplemented` (true/false) для использования в Phase 4

---

## Phase 4: Generate complete OpenAPI YAML

### Type mapping

| Source | OpenAPI |
|---|---|
| `string` / `str` / `string` (Go) | `type: string` |
| `number` / `float` / `int` / `int64` etc. | `type: number` or `type: integer` |
| `boolean` / `bool` | `type: boolean` |
| `Date` / `datetime` / `time.Time` | `type: string, format: date-time` |
| `T[]` / `List[T]` / `[]T` | `type: array, items: ...` |
| `Record<K,V>` / `Dict[K,V]` / `map[K]V` | `type: object, additionalProperties: ...` |
| enum type | `type: string, enum: [...]` — read enum definition |
| another DTO/model/struct | `$ref: '#/components/schemas/TypeName'` |
| `any` / `interface{}` / unresolved | `type: object` |

### Document header

Derive values from `packageName` and scan metadata:

```yaml
openapi: "3.1.0"

info:
  title: <human-readable title from packageName, strip "-contracts" suffix, title-case>
  version: 1.0.0
  description: ""

servers:
  - url: http://localhost:3000
    description: Local development

tags: []  # populated from controller names — see Tags section below

security:
  - bearerAuth: []
```

### Tags

Derive tags from controller/router names. Strip suffixes: `Controller`, `Router`, `Handler`, `Resource`. Deduplicate.

```yaml
tags:
  - name: Chats
    description: ""
  - name: Health
    description: ""
```

### Paths

For each entry across ALL controllers, generate an operation:

```yaml
paths:
  /chats/{chatId}:
    get:
      operationId: ChatsController_getChat   # see naming rules below
      summary: ""
      tags:
        - Chats
      parameters:
        - name: chatId
          in: path
          required: true
          schema:
            type: string
      responses:
        "200":
          description: ""
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Chat"
      security:
        - bearerAuth: []
```

**operationId naming:**
- NestJS/Express TS: `{ControllerClassName}_{methodName}`
- Python: `{router_prefix}_{function_name}` or just `{function_name}`
- Go: `{HandlerFunctionName}`
- If unclear: `{HTTP_METHOD}_{path_slug}` (e.g. `GET_chats_chatId`)

**Path parameters:** convert `:param` (Express/NestJS) or `{param}` (already correct) to `{param}` in YAML key; add `in: path, required: true` parameter for each.

**Query parameters:** if `entry.endpoint.queryParams` is non-empty — add individual `in: query` parameters. If a queryDto type was resolved — generate parameters from its properties instead of the generic list.

**Request body:** if `entry.endpoint.hasBody` is true:
```yaml
requestBody:
  required: true
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/CreateChatInputDto"
```

**Response type:**
- `void` / missing → `204` with no content
- array type → `200` with `type: array, items: { $ref: ... }`
- otherwise → `200` with `$ref`
- POST → `201` by default; override if responseType suggests otherwise

**Auth:** if `entry.endpoint.auth` is set and not `"public"` → add `security: [{ bearerAuth: [] }]`. If `"public"` → add `security: []`.

**Quality flags:** для каждой операции добавляй `x-quality-*` флаги по HTTP-критериям скилла (Фаза 2):
`x-quality-params-typed`, `x-quality-body-typed`, `x-quality-response-typed`,
`x-quality-body-validated`, `x-quality-errors-defined`, `x-quality-contract-implemented`
Размести сразу после `summary:`, до `parameters:` / `requestBody:`. Если критерий N/A — ключ не пишется.
Для framework-специфичных паттернов читай нужный reference-файл из `.claude/skills/kvint-assess-contract-quality/references/`.

### Components/schemas

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Chat:
      type: object
      required:
        - id
        - name
      properties:
        id:
          type: string
        name:
          type: string
```

Unresolved types:
```yaml
UnresolvedType:
  type: object
  description: "Schema not resolved — source definition not found"
  additionalProperties: true
```

---

## Phase 4.5: Post-scan (Quality Summary)

После генерации всех операций выполни Фазу 3 скилла (Post-scan):
- Пройди по всем операциям, подсчитай yes/no/na по каждому критерию
- Запиши `x-quality-summary` в корень YAML (на уровне `openapi:`, `info:`, `paths:`)
- Укажи `generatedBy: kvint-openapi-full-agent`

---

## Phase 5: Write output

1. Check if `packages/{packageName}/openapi/openapi.yaml` already exists.

2. **If EXISTS (update mode)**:
   a. Read the existing file.
   b. Parse both the existing YAML and the newly generated YAML.
   c. Apply a **minimal diff** strategy — preserve from the existing file:
      - Custom `description` fields that are non-empty (not `""`) — these were likely written by hand.
      - All `x-*` extension fields at any level.
      - Security schemes in `components.securitySchemes` that are not present in the new generation.
      - Paths or operations **not present in the scan result** (could be manually added endpoints).
      - `externalDocs` at any level if present.
   d. From the new generation, apply:
      - New paths and operations that did not exist before.
      - Updated `parameters`, `requestBody`, `responses` for paths that ARE in the scan result.
      - New schemas in `components.schemas` from the scan.
   e. For conflicting schemas (same name, different shape): prefer the newly generated version (it reflects the current source code).
   f. Write the merged result.

3. **If NOT EXISTS (create mode)**: write the generated YAML as-is.

Add generation comment at the top of the file:
```yaml
# generated by kvint-openapi-full-agent
# source: {jsonPath}
# framework: {framework}
# generated: {ISO timestamp}
# controllers: {N}
# endpoints: {total endpoint count}
```

---

## Phase 5.5: Update service.yaml

After successfully writing `packages/{packageName}/openapi/openapi.yaml`, update the contract package metadata:

1. Read `packages/{packageName}/metadata/service.yaml`
2. Parse the YAML
3. If `contracts` key is missing or null → treat it as an empty array
4. Check if an entry with `protocol: http` already exists in the array
5. If it does **not** exist → append:
   ```yaml
   - protocol: http
     path: openapi/openapi.yaml
   ```
6. Write the updated `service.yaml` back to the file (preserve all other fields and formatting)

If `service.yaml` does not exist yet — skip silently (it may be created later).

---

## Phase 6: Report

```
✅ OpenAPI записан: packages/{packageName}/openapi/openapi.yaml

Фреймворк:          {framework}
Контроллеров:       {N}
Эндпоинтов:         {total}
Схем сгенерировано: {schema count}
```

Show `⚠️` only if there are unresolved types:
```
⚠️ Неразрешённые типы ({N}):
  - SomeType (не найден файл определения)
```

---

## Quality rules

- Never modify source files
- All `$ref` values must reference a schema present in `components/schemas`
- Do not invent field names — only use what is found in source files
- If a type file has multiple candidates, prefer the one imported by the controller file
- Path parameters in the path string must have a corresponding `parameters` entry
- Group paths logically: sort by tag, then by path string
