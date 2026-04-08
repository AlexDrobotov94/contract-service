# 003 — Реестр сервисов через JSON Schema

## Контекст

В `service.yaml` поля `id` и `dependsOn[].service` ссылаются на другие сервисы.
Без контроля легко опечататься — портал либо упадёт, либо молча построит
неверный граф зависимостей.

Нужен механизм который:

- не даёт сослаться на несуществующий сервис
- даёт автокомплит прямо в редакторе

---

## Решение

Отдельный файл `tooling/schemas/services.schema.json` — реестр всех сервисов
в виде JSON Schema `definitions` с enum.

```json
{
  "definitions": {
    "serviceId": {
      "type": "string",
      "enum": ["chat-service", "bff-service", "user-service"]
    },
    "serviceRef": {
      "type": "string",
      "enum": [
        "component:default/chat-service",
        "component:default/bff-service",
        "component:default/user-service"
      ]
    }
  }
}
```

`service.schema.json` ссылается на реестр через `$ref`:

```json
"id": {
  "$ref": "services.schema.json#/definitions/serviceId"
},
"service": {
  "$ref": "services.schema.json#/definitions/serviceRef"
}
```

---

## Правило

**Новый сервис** → добавить в оба enum в `services.schema.json`:

- `serviceId` — короткий ID (`payments-service`)
- `serviceRef` — canonical ref (`component:default/payments-service`)

`service.schema.json` при этом не трогать.

---

## Что даёт

- Автокомплит `id` при заполнении своего дескриптора
- Автокомплит `dependsOn[].service` при указании зависимости
- Подсветка ошибки в редакторе если ID не зарегистрирован
- Единственное место для регистрации нового сервиса

---

## Альтернативы

**Валидация только в CI** — скрипт читает все `service.yaml`
и проверяет ссылки. Отклонено как первый шаг: обратная связь
приходит слишком поздно, хочется ошибку видеть сразу в редакторе.
Можно добавить поверх как дополнительный слой в будущем.

**Генерация enum из реестра** — отдельный `registry.yaml` →
скрипт генерирует `services.schema.json`. Отклонено: лишняя
сложность, два места для обновления вместо одного.
Enum в схеме и есть реестр.

**Паттерн-валидация без enum** — проверять формат
`component:<namespace>/<id>` через regex без фиксированного списка.
Отклонено: не даёт автокомплит, не защищает от несуществующих ID.
