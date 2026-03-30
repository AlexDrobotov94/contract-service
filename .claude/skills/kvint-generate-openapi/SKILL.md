---
name: kvint-generate-openapi
description: >
  Скилл-диспетчер для генерации OpenAPI спецификации из результатов транспортного сканирования Kvint.
  Используй этот скилл когда пользователь просит сгенерировать, создать или заполнить OpenAPI для пакета контрактов,
  особенно если есть готовый transport-scan.*.json файл. Триггеры: "сгенерируй openapi", "заполни openapi из scan-файла",
  "создай openapi спецификацию для <пакет>", "/kvint-generate-openapi".
---

# kvint-generate-openapi

Скилл-диспетчер для генерации OpenAPI спецификации из результатов транспортного сканирования. Выбирает агента в зависимости от размера сервиса.

---

## Триггер

Пользователь просит сгенерировать OpenAPI для пакета контрактов, имея готовый `transport-scan.*.json`.

Примеры:

- "Сгенерируй openapi для chat-contracts"
- "Заполни openapi из scan-файла"
- "/kvint-generate-openapi"

---

## Входные данные

Нужно выяснить у пользователя (или взять из контекста разговора):

1. `<scan-json-path>` — путь к файлу `transport-scan.*.json`
2. `<package-name>` — имя пакета контрактов (например, `chat-contracts`)

Если путь к scan-файлу не указан — найти самый свежий файл в `.agent-workspace/transport-scan.*.json` и уточнить у пользователя, тот ли это файл.

---

## Логика выбора агента

### Шаг 1: Анализ scan-файла

Прочитать `<scan-json-path>` и собрать следующие метрики:

```
controllers  = количество элементов в массиве byContractType.openapi
routes       = суммарное количество маршрутов (routes[]) по всем контроллерам
types        = суммарное количество уникальных типов/DTO, упомянутых в параметрах и теле маршрутов
```

Если поле `routes` отсутствует — считать `routes = controllers * 3` (консервативная оценка).

### Шаг 2: Оценка объёма работы

Оцени, поместится ли полная генерация в **один контекстный проход** без auto-compact.

Для этого ориентируйся на следующие факторы:

- **controllers** — каждый контроллер требует чтения исходного файла + всех его зависимостей
- **routes** — каждый маршрут добавляет описание path + request/response схемы
- **types** — каждый DTO/тип добавляет компонент в `components/schemas`

**Принцип:** агент полного прохода должен за одну сессию прочитать все исходники, разрезолвить все типы и записать финальный YAML. Если объём кажется значительным — безопаснее итерировать.

### Шаг 3: Выбор агента

| Условие                                                             | Действие                                                                                 |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `controllers == 0`                                                  | Сообщить: "В scan-результате нет HTTP-эндпоинтов, openapi не требуется" — и остановиться |
| Объём **умеренный** (по твоей оценке всё уместится в один контекст) | Запустить **`kvint-openapi-full-agent`** — один проход, полный файл                      |
| Объём **значительный** (риск переполнения контекста)                | Запустить **`kvint-openapi-controller-agent`** — итеративно, по одному контроллеру       |

> **Главная цель:** каждая итерация должна помещаться в один контекст без auto-compact.
> Сомневаешься — выбирай controller-agent. Лучше лишняя итерация, чем потеря контекста.

### Шаг 3: Запуск агента

**Для `kvint-openapi-full-agent` (N ≤ 5):**

Передать аргументы: `<scan-json-path> <package-name>`

Агент сам запишет готовый `packages/{package-name}/openapi/openapi.yaml`.

---

**Для `kvint-openapi-controller-agent` (N > 5):**

Запускать агент **в цикле** до появления файла `packages/{package-name}/openapi/partials/.complete`:

```
Итерация 1: kvint-openapi-controller-agent <scan-json-path> <package-name>
Итерация 2: kvint-openapi-controller-agent <scan-json-path> <package-name>
...
Итерация N: агент создаёт .complete → выходим из цикла
```

После появления `.complete` — запустить **`kvint-openapi-merge-agent`**, передав аргументы: `<scan-json-path> <package-name>`.

Merge-агент объединит все партиалы в финальный `packages/{package-name}/openapi/openapi.yaml`.

---

## Финальный отчёт

После успешной генерации вывести:

```
✅ OpenAPI сгенерирован: packages/{packageName}/openapi/openapi.yaml

Агент:        kvint-openapi-full-agent | kvint-openapi-controller-agent + kvint-openapi-merge-agent
Эндпоинтов:   {N}
Фреймворк:    {framework}
```

Если использовался controller-agent — дополнительно:

```
📁 Партиалы: packages/{packageName}/openapi/partials/
   Готово контроллеров: {N}
   ✅ Merged → packages/{packageName}/openapi/openapi.yaml
```
