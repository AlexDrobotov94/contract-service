---
name: kvint-assess-contract-quality
description: >
  Reference skill for OpenAPI and AsyncAPI generation agents in the Kvint monorepo.
  Defines the quality assessment playbook: pre-scan (contract implementation check),
  per-operation criteria (x-quality-* boolean extensions), and post-scan summary
  (x-quality-summary). Use this skill when generating OpenAPI specs or AsyncAPI files
  to annotate each operation with quality flags. Trigger when any kvint-openapi-* or
  kvint-*-agent (rabbitmq, socketio, websocket) needs to evaluate API quality.
---

# Kvint Contract Quality Assessment

Этот скилл — справочник для агентов-генераторов контрактов. Он **не интерактивен** и не исправляет код — только описывает, как оценить качество и записать результат в виде `x-quality-*` расширений в YAML.

Агент вызывает этот скилл и выполняет три фазы: **Pre-scan → Per-operation → Post-scan**.

---

## Фаза 1: Pre-scan (один раз на весь сервис)

Цель — определить значение `x-quality-contract-implemented` для всех операций сервиса.

### Шаг 1. Определить язык и фреймворк

Проверить по файлам в `scannedDir`:

| Признак                                           | Язык/Фреймворк |
| ------------------------------------------------- | -------------- |
| `package.json` с `@nestjs/core` в dependencies    | NestJS         |
| `package.json` с `express` (без `@nestjs`)        | Express        |
| `go.mod`                                          | Go             |
| `requirements.txt` / `pyproject.toml` с `fastapi` | Python/FastAPI |

### Шаг 2. Проверить наличие контракт-имплементации

Для каждого языка доказательства разные:

| Язык/Фреймворк      | Что проверять                                                                                                                                                                 | Где                                              |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| NestJS / Express TS | Наличие `@kvint/<service>-module` в `dependencies` или `devDependencies`                                                                                                   | `package.json`                                   |
| Express JS          | Наличие `@kvint/<service>-module` в `package.json`                                                                                                                         | `package.json`                                   |
| Go                  | Наличие `//go:generate` директив с `oapi-codegen`/`protoc-gen-go`, или Makefile с commandами кодогенерации, или импорт shared proto-пакетов                                   | `*.go`, `Makefile`, `go.mod`                     |
| Python/FastAPI      | Наличие `datamodel-codegen`/`openapi-python-client` в зависимостях или Makefile; или `response_model` ссылается на явно сгенерированные классы (с `# generated` комментарием) | `requirements.txt`, `pyproject.toml`, `Makefile` |

Если доказательства найдены → `contractImplemented = true`, иначе `contractImplemented = false`.

**Ключ `x-quality-contract-implemented` применяется для всех языков** — `false` означает "не реализовано", а не "неприменимо".

---

## Фаза 2: Per-operation (для каждой операции)

### HTTP-операции (OpenAPI)

Шесть критериев, оцениваемых на основе исходного кода:

| Ключ                             | Что проверяется                                                               | Применяется когда     |
| -------------------------------- | ----------------------------------------------------------------------------- | --------------------- |
| `x-quality-params-typed`         | Все path/query/header параметры имеют явные типы (не `any`, не без аннотации) | Только если ≥1 param  |
| `x-quality-body-typed`           | Тело запроса имеет явный DTO/интерфейс/Zod-схему (не `any`, не `object`)      | Только если есть body |
| `x-quality-response-typed`       | Метод возвращает явный не-`any` тип                                           | Всегда                |
| `x-quality-body-validated`       | Тело проходит runtime-валидацию                                               | Только если есть body |
| `x-quality-errors-defined`       | Есть ≥1 задокументированный или явно брошенный error-кейс (4xx/5xx)           | Всегда                |
| `x-quality-contract-implemented` | Из Pre-scan флага `contractImplemented`                                       | Всегда                |

Для детальных паттернов по каждому фреймворку — загружай нужный reference-файл:

| Фреймворк      | Reference file                      |
| -------------- | ----------------------------------- |
| NestJS         | `references/http-nestjs.md`         |
| Express        | `references/http-express-ts.md`     |
| Go             | `references/http-go.md`             |
| Python/FastAPI | `references/http-python-fastapi.md` |

### AsyncAPI-операции (RabbitMQ, Socket.IO, WebSocket)

Четыре критерия:

| Ключ                             | Что проверяется                                                                            | Применяется когда |
| -------------------------------- | ------------------------------------------------------------------------------------------ | ----------------- |
| `x-quality-payload-typed`        | Payload имеет явный DTO/схему (не `any`, не `{}`, не `map[string]interface{}`)             | Всегда            |
| `x-quality-payload-validated`    | Payload проходит runtime-валидацию                                                         | Всегда            |
| `x-quality-errors-defined`       | Определена обработка ошибок: error-событие, nack/dead-letter, try/catch с явной обработкой | Всегда            |
| `x-quality-contract-implemented` | Из Pre-scan флага `contractImplemented`                                                    | Всегда            |

Для детальных паттернов:

| Фреймворк                     | Reference file                |
| ----------------------------- | ----------------------------- |
| NestJS (RabbitMQ + Socket.IO) | `references/async-nestjs.md`  |
| Express (Socket.IO + ws)      | `references/async-express.md` |
| Go (RabbitMQ + WebSocket)     | `references/async-go.md`      |
| Python (RabbitMQ + WebSocket) | `references/async-python.md`  |

### Правила записи `x-quality-*` флагов

1. **Если критерий применим** → пишется `true` или `false`
2. **Если критерий не применим** (N/A) → ключ **не пишется вообще** (не `null`, не `false`)
3. **Порядок ключей** (HTTP):
   `x-quality-params-typed` → `x-quality-body-typed` → `x-quality-response-typed` → `x-quality-body-validated` → `x-quality-errors-defined` → `x-quality-contract-implemented`
4. **Порядок ключей** (AsyncAPI):
   `x-quality-payload-typed` → `x-quality-payload-validated` → `x-quality-errors-defined` → `x-quality-contract-implemented`
5. **Позиция в YAML** — флаги размещаются сразу после `summary:` / `operationId:`, до `parameters:` / `requestBody:`

---

## Фаза 3: Post-scan (после обхода всех операций)

После генерации всех операций вычисли и запиши `x-quality-summary` в корень YAML-файла.

### Алгоритм агрегации

Для каждого критерия пройди по всем операциям:

- `yes` — ключ присутствует и равен `true`
- `no` — ключ присутствует и равен `false`
- `na` — ключ отсутствует (критерий не применяется к этой операции)

`total` — общее количество операций.

### Позиция в YAML

`x-quality-summary` пишется в корень файла на уровне `openapi:`/`asyncapi:`, `info:`, `paths:`/`channels:`.

### Примеры

**OpenAPI:**

```yaml
x-quality-summary:
  total: 17
  scores:
    params-typed: { yes: 12, no: 3, na: 2 }
    body-typed: { yes: 5, no: 7, na: 5 }
    response-typed: { yes: 10, no: 7, na: 0 }
    body-validated: { yes: 3, no: 9, na: 5 }
    errors-defined: { yes: 6, no: 11, na: 0 }
    contract-implemented: { yes: 17, no: 0, na: 0 }
  generatedAt: "2026-04-16T10:00:00Z"
  generatedBy: kvint-openapi-full-agent
```

**AsyncAPI:**

```yaml
x-quality-summary:
  total: 8
  scores:
    payload-typed: { yes: 6, no: 2, na: 0 }
    payload-validated: { yes: 4, no: 4, na: 0 }
    errors-defined: { yes: 5, no: 3, na: 0 }
    contract-implemented: { yes: 8, no: 0, na: 0 }
  generatedAt: "2026-04-16T10:00:00Z"
  generatedBy: kvint-rabbitmq-agent
```

`generatedBy` — имя агента, который выполняет генерацию (например: `kvint-openapi-full-agent`, `kvint-rabbitmq-agent`, `kvint-socketio-agent`, `kvint-websocket-agent`).

---

## Запреты

- **Не угадывать типы из имён переменных** (`data`, `payload`, `body` без аннотации — это не тип)
- **Не анализировать тело функции/метода для вывода типов** — `return { id: 1 }` не является объявлением типа; схема строится только из явных аннотаций сигнатуры (декораторы, type hints, struct definitions)
- **Не генерировать поля схемы из примеров, логов, комментариев** — допустимые источники схемы: TypeScript interface/class, Pydantic BaseModel, Go struct с json-тегами, Zod-схема
- **Не считать `any` и `object` как typed** — только именованные типы, интерфейсы, классы, Pydantic-модели, Go-struct
- **Не считать `logger.error(...)` как errors-defined** — только явные HTTP-статусы (4xx/5xx), выброшенные исключения с кодом, error-события или nack/close
- **Не сканировать `dist/`, `node_modules/`, `.next/`** — только исходный код
- **Не изменять исходный код** — только читать и оценивать
- **Не блокировать генерацию** — даже если все критерии `false`, операция всё равно записывается
