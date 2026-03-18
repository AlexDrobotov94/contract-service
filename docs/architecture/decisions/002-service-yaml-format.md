# 002 — Формат service.yaml

## Контекст

Порталу нужны метаданные о каждом сервисе: кто владелец, какие протоколы,
от кого зависит. Нужно решить где и в каком формате это хранить.

---

## Решение

Каждый контракт-пакет содержит `metadata/service.yaml` —
дескриптор сервиса в фиксированном формате.

Файл валидируется через JSON Schema, что даёт автокомплит и подсветку
ошибок прямо в редакторе.

---

## Структура файла

```yaml
apiVersion: kvint/v1
kind: component
namespace: default
id: chat-service
name: Chat Service

owner: group:default/team-chat
lifecycle: production
type: service

system: voice-robots
domain: chat

tags:
  - nestjs
  - rabbitmq

links:
  - url: https://gitlab.kvint.io/...
    title: GitLab
    icon: gitlab

contracts:
  - protocol: http
    path: openapi/openapi.yaml

dependsOn:
  - service: component:default/user-service
    type: http
```

---

## Ключевые решения внутри формата

**`apiVersion`** — версия формата дескриптора. Позволяет порталу
выбрать правильный парсер при эволюции схемы. Текущая: `kvint/v1`.

**`contracts[]`** — явный список протоколов с путями к файлам.
Портал не угадывает где лежат файлы — берёт из этого поля.
Определяет какие вкладки показывать на странице сервиса.

**`dependsOn[]`** — явные зависимости от других сервисов.
Используются для построения графа сервисов.

**Entity reference format** — ссылки на сущности в формате
`<kind>:<namespace>/<id>` (например `component:default/user-service`).
Заимствовано из Backstage для однозначной идентификации.

---

## Схемы и реестр

```
tooling/schemas/
  service.schema.json    ← структура дескриптора
  services.schema.json   ← реестр всех ID сервисов (enum)
```

`services.schema.json` — единственное место где регистрируется новый сервис.
`service.schema.json` ссылается на него через `$ref`.

Это даёт автокомплит для полей `id` и `dependsOn.service` в редакторе.

**Правило:** новый сервис → сначала добавить ID в `services.schema.json`,
потом создавать пакет контрактов.

---

## Вдохновение: Backstage

Формат намеренно близок к Backstage Component descriptor.
Совпадают: `kind`, `namespace`, `owner`, `lifecycle`, `system`, `domain`, `tags`, `links`.

Отличия от Backstage:

- Нет разделения `metadata` / `spec` — плоская структура проще
- `contracts[]` вместо `providesApis` / `consumesApis` — API не отдельный kind сущности
- `apiVersion` без домена (`kvint/v1` вместо `backstage.io/v1alpha1`)
- Нет `labels`, `annotations` — добавим когда появится реальная потребность

---

## Альтернативы

**Хранить метаданные в `package.json`** — проще, один файл.
Отклонено: `package.json` станет захламлён, нет валидации через схему,
неудобно редактировать большие структуры.

**Отдельный файл на каждый протокол** — `http.yaml`, `queue.yaml`.
Отклонено: дублирование общих метаданных (owner, lifecycle),
сложнее автодискавери.
