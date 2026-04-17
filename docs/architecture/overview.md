# Contract Service — Overview

## Идея

Внутренний портал для отображения всех контрактов микросервисов.
Вдохновлён [Backstage.io](https://backstage.io), но значительно проще —
без плагинной архитектуры, без базы данных.

Contract-First принцип: если взаимодействие не описано в контракте — его официально не существует.

---

## Что это решает

- Разработчик не знает какие эндпоинты есть у соседнего сервиса → открывает портал
- Нет единого места где видно все протоколы сервиса сразу (HTTP + очереди + сокеты)
- Контракты жили в разных местах или не жили нигде

---

## Как устроено

```
packages/*-module/     ← контракты сервисов (npm-пакеты)
apps/contracts-ui/        ← Next.js портал
tooling/                  ← скрипты и схемы
```

Портал не требует ручного конфига — находит контракт-пакеты автоматически
по флагу `"catalog": true` в `package.json`.

---

## Типы контрактов

| Протокол  | Файл                    | UI                      |
|-----------|-------------------------|-------------------------|
| REST      | `openapi/openapi.yaml`  | Scalar                  |
| RabbitMQ  | `asyncapi/rabbitmq.yaml`| @asyncapi/react-component |
| Socket.IO | `asyncapi/socket.yaml`  | @asyncapi/react-component |
| gRPC      | `*.proto`               | protoc-gen-doc          |
| GraphQL   | `schema.graphql`        | GraphiQL                |

---

## Структура контракт-пакета

```
packages/chat-module/
  package.json              ← "contracts": true, @kvint/chat-module
  metadata/
    service.yaml            ← метаданные: owner, lifecycle, dependsOn и т.д.
  openapi/
    openapi.yaml
  asyncapi/
    rabbitmq.yaml
    socket.yaml
  schemas/                  ← только схемы пересекающие границу сервиса
  examples/                 ← примеры запросов/ответов/событий
  generated/                ← артефакты сборки, не редактировать руками
```

---

## service.yaml

Главный файл метаданных сервиса. Описывает кто владеет сервисом,
какие у него протоколы, от кого зависит.

Валидируется через JSON Schema: `tooling/schemas/service.schema.json`.
Реестр всех сервисов: `tooling/schemas/services.schema.json`.

Подробнее: [decisions/002-service-yaml-format.md](decisions/002-service-yaml-format.md)

---

## Автодискавери

```ts
const { packages } = await getPackages(process.cwd())
const contractPackages = packages.filter(p => p.packageJson.contracts === true)
```

Добавил новый контракт-пакет → после перезапуска портал его видит автоматически.

---

## Генерация типов

TypeScript-типы для `service.yaml` генерируются из JSON Schema:

```bash
npm run generate:types
```

Результат: `apps/contracts-ui/src/shared/types/service.generated.ts` — артефакт сборки,
не редактировать руками.

---

## Текущий статус

- [x] Формат `service.yaml` и JSON Schema
- [x] Реестр сервисов (`services.schema.json`)
- [x] Автодискавери контракт-пакетов
- [x] Генерация TypeScript-типов из схемы
- [ ] Моковый OpenAPI для chat-service
- [ ] UI: главная страница (карточки сервисов)
- [ ] UI: страница сервиса (табы по протоколам)
- [ ] Scalar для отображения OpenAPI