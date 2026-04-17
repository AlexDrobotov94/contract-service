---
name: Dialer Service WebSocket patterns
description: Паттерны нативного WebSocket в kvint-dialer-go — flat-messages с полем event, порт и путь
type: project
---

Сервис kvint-dialer-go использует **flat-message pattern** для WebSocket сообщений: нет вложенного `payload`, вместо этого поле `event` является дискриминатором, а остальные поля сообщения находятся на верхнем уровне JSON.

Пример: `{"event":"audio","mark":"abc","audio":"base64..."}` — не `{"type":"audio","payload":{...}}`.

**Why:** Код на Go использует отдельные struct-типы для каждого события (webTeleRequestAudio, webTeleRequestLog и т.д.), все с тегом `json:"event"` на дискриминаторе.

**How to apply:** При генерации schemas для dialer-go WebSocket не оборачивать payload в `payload: {}`. Поле-дискриминатор — `event`, не `type`.

Дополнительно:
- Сервер слушает на порту `cfg.App.WebAudioPort` (env: `WEB_AUDIO_PORT`, дефолт не задан явно)
- Путь подключения: `/{callId}` (динамический, callId — идентификатор звонка)
- Два адаптера используют одну WebTeleMainService инфраструктуру: WebTeleDirect и Twilio
- Twilio-события имеют поле `streamSid` в дополнение к стандартным полям
- Файл контракта: `packages/dialer-module/asyncapi/websocket.yaml`
