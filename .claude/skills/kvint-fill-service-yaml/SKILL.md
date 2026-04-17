---
name: kvint-fill-service-yaml
description: >
  Use this skill to interactively create or edit metadata/service.yaml for a Kvint monorepo
  contract package. Trigger whenever the user asks to fill, generate, create, write, update, edit,
  or modify service.yaml, service metadata, or service descriptor for a kvint contract package —
  even if they just say "заполни метадату", "напиши service.yaml", "создай дескриптор сервиса",
  "обнови service.yaml", "измени метадату", "отредактируй дескриптор" or pass a package path
  like "packages/orders-module". Also trigger when the user says /kvint-fill-service-yaml.
---

# kvint-fill-service-yaml

Интерактивно создаёт или редактирует `metadata/service.yaml` для пакета контрактов монорепо Kvint.

## Язык общения

Веди весь диалог с пользователем **на русском языке**.

---

## Шаг 1: Определить путь к пакету

Если путь к пакету передан как аргумент (например `packages/orders-module`) — используй его напрямую.

Иначе спроси: «Укажи путь к пакету контрактов (например: `packages/orders-module`)»

Принимается относительный путь от корня монорепо или абсолютный.

---

## Шаг 1.5: Определить режим (создание или редактирование)

Проверь, существует ли файл `{path}/metadata/service.yaml`.

- **Если файл существует** → режим **редактирования**: прочитай его, извлеки текущие значения всех полей. На каждый вопрос далее показывай текущее значение и предлагай оставить его (Enter) или изменить. Например: `[текущее: "Orders Service"] — Enter чтобы оставить, или введи новое:`
- **Если файла нет** → режим **создания**: задавай вопросы как обычно, без предзаполненных значений.

---

## Шаг 2: Прочитать актуальную схему

**Обязательно прочитай все три файла перед тем как задавать вопросы:**

1. `tooling/schemas/service.schema.json` — required-поля, enum-значения, паттерны, описания
2. `tooling/schemas/services.schema.json` — список зарегистрированных `serviceId` и `serviceRef`
3. `tooling/schemas/owners.schema.json` — список зарегистрированных владельцев (`definitions.owner.enum`)

Используй схему как источник истины для формирования вопросов — не полагайся на захардкоженные значения из этой инструкции. Если в схеме появятся новые enum-значения или поля, учитывай их.

---

## Шаг 3: Вычислить id сервиса

Вычисли slug из имени пакета по правилу:

- Убери путь (`packages/`) — возьми только имя директории
- Замени суффикс `-module` на `-service`
- Примеры: `packages/orders-module` → `orders-service`, `packages/chat-module` → `chat-service`
- Если пакет не содержит `-module`, просто используй `{dirname}-service`

Проверь, есть ли вычисленный ID в `services.schema.json#/definitions/serviceId/enum`.

Если **не зарегистрирован** — скажи пользователю:

> ⚠️ ID `{slug}` не зарегистрирован в `tooling/schemas/services.schema.json`. Файл не пройдёт валидацию. Нужно добавить его в массив `serviceId.enum` перед использованием.

Продолжай создание файла вне зависимости от этого — предупреждение информационное.

---

## Шаг 4: Обязательные поля

Задавай вопросы последовательно. Поля `apiVersion: kvint/v1`, `kind: component`, `namespace: default` определяются автоматически — не спрашивай о них.

### name

Спроси: «Введи человекочитаемое название сервиса (например: Orders Service)»

### owner

Прочитай актуальный список из `tooling/schemas/owners.schema.json#/definitions/owner/enum` и покажи его пронумерованным списком:

```
Выбери владельца:
  1. group:default/team-chat
  ... (все значения из enum)
  N. Добавить нового владельца
```

Если пользователь выбирает существующий вариант — используй его.

Если пользователь выбирает «Добавить нового владельца»:

- Спроси: «Введи владельца в формате `group:default/<team>` или `user:default/<login>`»
- Если ввод не соответствует паттерну `^(group|user):[a-z][a-z0-9-]*/[a-z][a-z0-9-]*$` — попроси ввести заново
- Добавь новое значение в массив `enum` в файле `tooling/schemas/owners.schema.json` и сохрани файл
- Сообщи: «Владелец `{value}` добавлен в `tooling/schemas/owners.schema.json`»

### lifecycle

Спроси с выбором из актуального enum в схеме:

```
Выбери стадию жизненного цикла:
  1. experimental
  2. production
  3. deprecated
```

### system

Спроси: «Укажи логическую систему или продукт (строчные буквы и дефисы, например: voice-robots)»

### domain

Спроси: «Укажи доменную область внутри системы (например: chat, billing, auth)»

---

## Шаг 5: Необязательные поля

Предлагай каждую группу по очереди. Пользователь может пропустить любую.

### description

«Добавить описание сервиса? (да/нет)»
Если да: «Введи описание (несколько строк — пустая строка завершает ввод):»

### type

«Указать тип компонента?»

```
  1. service (по умолчанию)
  2. library
  3. website
  (Enter — пропустить, будет "service")
```

### tags

«Добавить теги для фильтрации? (да/нет)»
Если да: «Введи теги через запятую (только строчные буквы, цифры, дефисы и точки, например: nestjs,postgresql,rabbitmq)»

### source

«Добавить ссылку на репозиторий сервиса в GitLab/GitHub? (да/нет)»

Если да: «Введи URL репозитория (например: https://gitlab.kvint.io/voice-robots/chat-service)»

Поле `source` отображается в блоке About как VIEW SOURCE с иконкой GitLab.

### links

«Добавить ссылки на внешние ресурсы? (да/нет)»

Для каждой ссылки:

1. **URL** — полный URL
2. **Заголовок** — название ссылки
3. **Иконка** (необязательно):
   ```
   1. alert    (мониторинг, алерты)
   2. support  (поддержка, команда)
   3. website  (сайт, документация)
   (Enter — пропустить)
   ```

После каждой: «Добавить ещё ссылку? (да/нет)»

### dependsOn

«Указать зависимости от других сервисов? (да/нет)»

Если да — покажи список зарегистрированных serviceRef из `services.schema.json#/definitions/serviceRef/enum`.

Для каждой зависимости:

1. **Сервис** — выбор из списка (или ввод вручную если нужного нет)
2. **Тип связи**:
   ```
   1. http   (синхронный вызов)
   2. event  (асинхронный, событие)
   3. queue  (асинхронный, очередь)
   4. socket (WebSocket)
   ```
3. **Описание** — зачем нужен этот сервис

После каждой: «Добавить ещё зависимость? (да/нет)»

---

## Шаг 6: Записать файл

Создай директорию `{path}/metadata/` если не существует. Запиши файл в `{path}/metadata/service.yaml`.

### Правила формирования YAML

**Первая строка всегда:**

```
# yaml-language-server: $schema=../../../tooling/schemas/service.schema.json
```

**Для полей с дефолтами, которые не заполнил пользователь:**

- `description` — не включай блок в файл
- `type` — `service`
- `tags` — `[]`
- `source` — не включай блок в файл
- `links` — `[]`
- `contracts` — `[]` (записи добавляются автоматически агентами-генераторами)
- `dependsOn` — `[]`

**Структура файла** (порядок полей строго такой):

```yaml
# yaml-language-server: $schema=../../../tooling/schemas/service.schema.json

apiVersion: kvint/v1
kind: component
namespace: default
id: { slug }
name: { name }
description: |
  {description}

owner: { owner }
lifecycle: { lifecycle }
type: { type }

system: { system }
domain: { domain }

tags:
  - { tag }

source: { source_url }

links:
  - url: { url }
    title: { title }
    icon: { icon }

contracts: []

dependsOn:
  - service: { serviceRef }
    type: { type }
    description: "{description}"
```

Блок `description:` пиши только если пользователь его заполнил.
`tags: []`, `links: []`, `dependsOn: []` — если пустые.
`source` — только если был указан.
Иконку в links — только если была выбрана.

---

## Шаг 7: Финальное сообщение

Выведи краткое резюме. Используй «Файл создан» в режиме создания или «Файл обновлён» в режиме редактирования:

```
Файл создан / Файл обновлён: {path}/metadata/service.yaml

id:        {id}
name:      {name}
owner:     {owner}
lifecycle: {lifecycle}
system:    {system}
domain:    {domain}
```

Если ID не был в реестре — повтори предупреждение: «Не забудь зарегистрировать `{id}` в `tooling/schemas/services.schema.json`»
