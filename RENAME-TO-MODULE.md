Нужно переименовать все сущности в монорепе с концепции "contracts" на "module".

## Соглашения после переименования

- Папки пакетов: `packages/{slug}-module/` (было: `{slug}-contracts`)
- npm-пакеты: `@kvint/{slug}-module` (было: `@kvint/{slug}-contracts`)
- Флаг обнаружения в package.json: `"catalog": true` (было: `"contracts": true`)
- Внутренняя схема (`kind`, `service.yaml`) — не менять, остаётся `kind: component`

## Что переименовать

### 1. Существующие пакеты

Переименовать физически (папки + package.json):
- `packages/chat-service-contracts/` → `packages/chat-service-module/`
  - package.json: `"name": "@kvint/chat-service-module"`, `"catalog": true` (убрать `"contracts": true`)
- `packages/dialer-contracts/` → `packages/dialer-module/`
  - package.json: `"name": "@kvint/dialer-module"`, `"catalog": true` (убрать `"contracts": true`)

### 2. Логика обнаружения сервисов

Файл: `apps/contracts-ui/src/entities/service/api/get-services.ts`
- Поменять фильтрацию пакетов: искать `"catalog": true` вместо `"contracts": true`

### 3. Агент scaffolder

Файл: `.claude/agents/kvint-contract-scaffolder.md`
- Переименовать файл в `.claude/agents/kvint-module-scaffolder.md`
- Обновить frontmatter: `name: kvint-module-scaffolder`
- Обновить description и все упоминания внутри агента:
  - `packageName`: `@kvint/{slug}-module`
  - `packageDir`: `packages/{slug}-module`
  - `"contracts": true` → `"catalog": true`
  - Все упоминания "contract package" → "module"

### 4. CLAUDE.md

- Обновить раздел "Adding a new contract package" — переименовать в "Adding a new module"
- Обновить примеры папок и package.json
- Обновить раздел "Contract package folder structure"

### 5. Проверка

После всех изменений:
- `npm run check-types` — без ошибок
- Убедиться что сервисы chat и dialer появляются в UI (запустить `npm run dev` или проверить что get-services.ts корректно читает новый флаг)
