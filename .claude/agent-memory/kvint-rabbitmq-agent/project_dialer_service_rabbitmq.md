---
name: Dialer Service RabbitMQ Topology
description: Queue topology, envelope format, and publish patterns for kvint-dialer-go RabbitMQ transport
type: project
---

## Очереди потребления (receive)

| Очередь | Адрес | Назначение |
|---|---|---|
| Основная очередь задач | `kv.dialer.1-01.1-01sl` (env: RMQ_MAIN_QUEUE) | Задачи на дозвон от коллера |
| Очередь по серверу | `kv.dialer.{ServerName}.{ServerIdent}` (dynamic) | Задачи для конкретного слота |
| Очередь ответов бота | `kv.bot.12dsk2323ksd` (env: RMQ_BOT_QUEUE) | Ответы bot-api на запросы сессии |
| API-очередь | `kv.container.{ServerName}.api` (env: RMQ_API_QUEUE) | Команды управления дайлером |
| Direct bot API очередь | `{MainQueue}.direct_bot_api` | Прямые запросы к активным сессиям |

## Очереди публикации (send)

| Очередь | Адрес | Назначение |
|---|---|---|
| Reply-очередь коллера | `{replyTo}` (из d.ReplyTo доставки) | Результат задачи / ответ на API-команду |
| TTS-воркер | `kv.tts.workers.{voice}` | Запрос синтеза речи |

## Конверт сообщений

Все сообщения завёрнуты в `RmqCeleryPacket` (types/celery.go):
```
{ version, correlation_id, status, num, start_date, send_date, from, to, ttl, answer_queue, log, error_code, traceback, data }
```
Тело в большинстве очередей **сжато gzip** (utils.GzipData / utils.UnzipData).

## RabbitMQ headers

При публикации всегда добавляются headers:
```
{ correlation_id, reply_to, task (= имя целевой очереди), id (= correlation_id) }
```

## Паттерн request-reply

- API-очередь: команда приходит с `d.ReplyTo`; ответ публикуется в `d.ReplyTo` через `ApiService.SendResult` → `rmq.Publish`.
- Задачи дозвона: задача приходит с `d.ReplyTo`; результат после FSM публикуется через `Turnstile.RmqReply` → `rmq.PublishWithPacket`.

## Конкурентность

Все consumer-и используют `WithConsumerOptionsQueueDurable` + `WithConsumeOptionsArgXExpires` (x-expires=86400000ms = 1 день).

**Why:** Паттерн описан при анализе kvint-dialer-go (Go-сервис, github.com/wagslane/go-rabbitmq).
**How to apply:** При генерации asyncapi/rabbitmq.yaml для dialer-module — использовать эти очереди и envelope-структуру.
