---
name: kvint-website-quality-agent
description: Agent that assesses the quality of a registered website component by checking if the frontend imports any catalog contract packages from the monorepo. Writes the result into the package's service.yaml under quality.website. Accepts "<appPath> <packageName>" as arguments.
---

# kvint-website-quality-agent

Агент оценивает качество website-компонента: проверяет, импортирует ли фронтенд хотя бы один пакет контрактов из монорепо (catalog-пакет). Результат пишется в `service.yaml` под ключом `quality.website`.

## Входные данные

Аргументы передаются как одна строка: `<appPath> <packageName>`

- `appPath` — абсолютный путь к папке фронтенд-приложения (или корню репозитория)
- `packageName` — относительный путь к пакету контрактов (например `packages/admin-panel-module`)

## Инструменты

Glob, Grep, Read, Write, Bash

## Шаги

### 1. Собрать каталог пакетов монорепо

Найти все файлы `packages/*/package.json` в текущей рабочей директории.

Для каждого файла:
- Прочитать и распарсить JSON
- Если `catalog !== true` — пропустить
- Запомнить npm-имя пакета (поле `name`)

Итог: список `catalogPackageNames` — массив npm-имён пакетов с `catalog: true`.

Если список пустой — вывести предупреждение и завершить с `contract-imported: false`.

### 2. Поиск импортов в исходниках фронта

Для каждого `npmName` из `catalogPackageNames`: выполнить grep по `appPath` (рекурсивно, исключая `node_modules`).

Паттерн для поиска:
```
from ['"]<npmName>
require\(['"]<npmName>
```

Использовать Bash: `grep -r --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.mjs" --exclude-dir=node_modules -l "<npmName>" "<appPath>" 2>/dev/null`

Если хотя бы для одного пакета найден хотя бы один файл с совпадением — `contractImported = true`.

### 3. Записать результат в `service.yaml`

Прочитать `<packageName>/metadata/service.yaml`.

Добавить/перезаписать блок `quality.website` через Node.js inline-скрипт:

```bash
node -e "
const fs = require('fs');
const yaml = require('js-yaml');
const path = '<packageName>/metadata/service.yaml';
const doc = yaml.load(fs.readFileSync(path, 'utf8'));
doc.quality = doc.quality || {};
doc.quality.website = {
  'contract-imported': <true|false>
};
fs.writeFileSync(path, yaml.dump(doc, { lineWidth: 120 }));
"
```

**Важно**: js-yaml доступен как зависимость монорепо. Запускать скрипт из корня монорепо (cwd).

### 4. Вывести итог

```
Quality assessed.
contract-imported: <true|false>
Written to: <packageName>/metadata/service.yaml
```

## Правила

- Не изменять никакие другие поля `service.yaml`
- Если `service.yaml` не найден — вывести ошибку и остановиться
- Если `appPath` не существует — вывести ошибку и остановиться
- `node_modules` всегда исключать из поиска
