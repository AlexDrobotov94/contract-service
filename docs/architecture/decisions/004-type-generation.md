# 004 — Генерация TypeScript-типов из JSON Schema

## Контекст

`service.yaml` валидируется через JSON Schema. В приложении `contracts-ui`
нужны TypeScript-типы для работы с данными из этих файлов.
Можно писать типы руками или генерировать из схемы.

---

## Решение

Типы генерируются из `service.schema.json` через `json-schema-to-typescript`.

```bash
npm run generate:types
```

Скрипт: `tooling/generate-types.ts`
Результат: `apps/contracts-ui/src/shared/types/service.generated.ts`

Файл — артефакт сборки, не редактировать руками.

---

## Почему

Единственный источник правды — схема. Типы из неё вытекают автоматически.
Изменил схему → перегенерировал → TypeScript сразу показывает что сломалось.

Если писать типы руками — схема и типы неизбежно разойдутся.

---

## Использование в приложении

Сгенерированный тип `ServiceDescriptor` не гоняется по приложению напрямую.
В `entities/service/model/types.ts` он оборачивается в доменный тип:

```ts
import type { ServiceDescriptor } from "../../../shared/types/service.generated";

export type ServiceMeta = ServiceDescriptor & {
  _packageDir: string; // абсолютный путь до пакета, для чтения контракт-файлов
  _packageName: string; // имя npm-пакета
  _version: string; // версия из package.json
};
```

Runtime-поля с префиксом `_` не являются частью `service.yaml` —
добавляются при чтении из `package.json` в `get-services.ts`.

---

## Когда перегенерировать

- Изменился `service.schema.json`
- Добавлено новое поле в формат дескриптора

Рекомендуется добавить в CI проверку что сгенерированный файл не устарел:

```bash
npm run generate:types && git diff --exit-code apps/contracts-ui/src/shared/types/service.generated.ts
```

---

## Зависимости

```bash
npm install -D json-schema-to-typescript ts-node
```
