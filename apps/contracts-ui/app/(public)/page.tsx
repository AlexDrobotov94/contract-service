// import { AsyncApiDocs } from "./async-api-docs";

import { AsyncApiViewer } from "@/shared/lib/asyncapi-viewer";

const schema1 = `
asyncapi: "3.1.0"
info:
  title: Chat Service Socket.IO API
  version: "1.0.0"
  description: Socket.IO события сервиса чатов в пространстве имён /chat

defaultContentType: application/json

servers:
  development:
    host: localhost:3000
    protocol: socketio
    description: Сервер разработки

channels:
  chat_join:
    address: "chat:join"
    description: Клиент входит в комнату чата
    messages:
      chat_joinMessage:
        $ref: "#/components/messages/ChatJoinMessage"

  chat_leave:
    address: "chat:leave"
    description: Клиент покидает комнату чата
    messages:
      chat_leaveMessage:
        $ref: "#/components/messages/ChatLeaveMessage"

  message_send:
    address: "message:send"
    description: Клиент отправляет сообщение в чат
    messages:
      message_sendMessage:
        $ref: "#/components/messages/MessageSendMessage"

  processing_catchup:
    address: "processing:catchup"
    description: Клиент запрашивает актуальное состояние обработки сообщений
    messages:
      processing_catchupMessage:
        $ref: "#/components/messages/ProcessingCatchupMessage"

  timeline_catchup:
    address: "timeline:catchup"
    description: Сервер отправляет клиенту снимок истории чата при входе
    messages:
      timeline_catchupMessage:
        $ref: "#/components/messages/TimelineCatchupMessage"

  chat_updated:
    address: "chat:updated"
    description: Сервер уведомляет о том, что состояние чата изменилось
    messages:
      chat_updatedMessage:
        $ref: "#/components/messages/ChatUpdatedMessage"

  timeline_new:
    address: "timeline:new"
    description: Сервер публикует новый элемент таймлайна (событие или сообщение)
    messages:
      timeline_newMessage:
        $ref: "#/components/messages/TimelineNewMessage"

  processing_updated:
    address: "processing:updated"
    description: Сервер уведомляет об обновлении статуса обработки сообщения
    messages:
      processing_updatedMessage:
        $ref: "#/components/messages/ProcessingUpdatedMessage"

  preview_new:
    address: "preview:new"
    description: Сервер транслирует текущий стриминговый превью ответа бота
    messages:
      preview_newMessage:
        $ref: "#/components/messages/PreviewNewMessage"

operations:
  chatJoinReceive:
    action: receive
    summary: Вход клиента в комнату чата
    channel:
      $ref: "#/channels/chat_join"
    messages:
      - $ref: "#/channels/chat_join/messages/chat_joinMessage"
    reply:
      messages:
        - $ref: "#/components/messages/ChatJoinAckMessage"

  chatLeaveReceive:
    action: receive
    summary: Выход клиента из комнаты чата
    channel:
      $ref: "#/channels/chat_leave"
    messages:
      - $ref: "#/channels/chat_leave/messages/chat_leaveMessage"

  messageSendReceive:
    action: receive
    summary: Отправка сообщения от клиента
    channel:
      $ref: "#/channels/message_send"
    messages:
      - $ref: "#/channels/message_send/messages/message_sendMessage"
    reply:
      messages:
        - $ref: "#/components/messages/MessageSendAckMessage"

  processingCatchupReceive:
    action: receive
    summary: Запрос клиентом состояния обработки сообщений
    channel:
      $ref: "#/channels/processing_catchup"
    messages:
      - $ref: "#/channels/processing_catchup/messages/processing_catchupMessage"
    reply:
      messages:
        - $ref: "#/components/messages/ProcessingCatchupAckMessage"

  timelineCatchupSend:
    action: send
    summary: Отправка снимка истории чата клиенту при входе
    channel:
      $ref: "#/channels/timeline_catchup"
    messages:
      - $ref: "#/channels/timeline_catchup/messages/timeline_catchupMessage"

  chatUpdatedSend:
    action: send
    summary: Уведомление об изменении состояния чата
    channel:
      $ref: "#/channels/chat_updated"
    messages:
      - $ref: "#/channels/chat_updated/messages/chat_updatedMessage"

  timelineNewSend:
    action: send
    summary: Публикация нового элемента таймлайна
    channel:
      $ref: "#/channels/timeline_new"
    messages:
      - $ref: "#/channels/timeline_new/messages/timeline_newMessage"

  processingUpdatedSend:
    action: send
    summary: Уведомление об обновлении статуса обработки
    channel:
      $ref: "#/channels/processing_updated"
    messages:
      - $ref: "#/channels/processing_updated/messages/processing_updatedMessage"

  previewNewSend:
    action: send
    summary: Трансляция стримингового превью ответа бота
    channel:
      $ref: "#/channels/preview_new"
    messages:
      - $ref: "#/channels/preview_new/messages/preview_newMessage"

components:
  messages:
    ChatJoinMessage:
      name: ChatJoinMessage
      title: Запрос на вход в чат
      summary: Клиент запрашивает подключение к комнате чата
      payload:
        $ref: "#/components/schemas/ChatJoinPayload"

    ChatLeaveMessage:
      name: ChatLeaveMessage
      title: Запрос на выход из чата
      summary: Клиент покидает комнату чата
      payload:
        $ref: "#/components/schemas/ChatLeavePayload"

    MessageSendMessage:
      name: MessageSendMessage
      title: Отправка сообщения
      summary: Клиент отправляет текстовое сообщение в чат
      payload:
        $ref: "#/components/schemas/MessageSendPayload"

    ProcessingCatchupMessage:
      name: ProcessingCatchupMessage
      title: Запрос состояния обработки
      summary: Клиент запрашивает список активно обрабатываемых сообщений
      payload:
        $ref: "#/components/schemas/ProcessingCatchupRequest"

    ChatJoinAckMessage:
      name: ChatJoinAckMessage
      title: Подтверждение входа в чат
      summary: Ответ сервера на запрос входа в чат (успех или ошибка)
      payload:
        $ref: "#/components/schemas/ChatJoinAck"

    MessageSendAckMessage:
      name: MessageSendAckMessage
      title: Подтверждение отправки сообщения
      summary: Ответ сервера на отправку сообщения (включает статус обработки)
      payload:
        $ref: "#/components/schemas/MessageSendAck"

    ProcessingCatchupAckMessage:
      name: ProcessingCatchupAckMessage
      title: Ответ на запрос состояния обработки
      summary: Список обрабатываемых сообщений чата
      payload:
        $ref: "#/components/schemas/ProcessingCatchupAck"

    TimelineCatchupMessage:
      name: TimelineCatchupMessage
      title: Снимок истории чата
      summary: Полный или частичный снимок таймлайна, отправляемый при входе
      payload:
        $ref: "#/components/schemas/TimelineCatchupEvent"

    ChatUpdatedMessage:
      name: ChatUpdatedMessage
      title: Обновление состояния чата
      summary: Уведомление о том, что stateVersion чата увеличился
      payload:
        $ref: "#/components/schemas/ChatUpdatedEvent"

    TimelineNewMessage:
      name: TimelineNewMessage
      title: Новый элемент таймлайна
      summary: Новое событие или сообщение, добавленное в таймлайн чата
      payload:
        $ref: "#/components/schemas/TimelineItem"

    ProcessingUpdatedMessage:
      name: ProcessingUpdatedMessage
      title: Обновление обработки сообщения
      summary: Изменение статуса или результата обработки конкретного сообщения
      payload:
        $ref: "#/components/schemas/MessageProcessing"

    PreviewNewMessage:
      name: PreviewNewMessage
      title: Стриминговый превью ответа
      summary: Промежуточный текст стримингового ответа бота
      payload:
        $ref: "#/components/schemas/PreviewNewEvent"

  schemas:
    # --- Инбаунд payload-типы ---

    ChatJoinPayload:
      type: object
      description: Данные для входа в комнату чата
      properties:
        chatId:
          type: string
          description: MongoDB ObjectId чата
        since:
          description: Опциональная точка синхронизации (тип уточняется)
      required:
        - chatId

    ChatLeavePayload:
      type: object
      description: Данные для выхода из комнаты чата
      properties:
        chatId:
          type: string
          description: MongoDB ObjectId чата
      required:
        - chatId

    MessageSendPayload:
      type: object
      description: Данные отправляемого сообщения
      properties:
        chatId:
          type: string
          description: MongoDB ObjectId чата
        clientMessageId:
          type: string
          minLength: 1
          description: Клиентский идентификатор сообщения (idempotency key)
        text:
          type: string
          description: Текст сообщения
      required:
        - chatId
        - clientMessageId
        - text

    ProcessingCatchupRequest:
      type: object
      description: Параметры запроса состояния обработки
      properties:
        chatId:
          type: string
          description: MongoDB ObjectId чата
      required:
        - chatId

    # --- Ack-типы (ответы на inbound события) ---

    ApiError:
      type: object
      description: Стандартная ошибка API
      properties:
        code:
          type: string
          enum:
            - invalid_payload
            - unauthorized
            - forbidden
            - not_found
            - conflict
            - too_many_requests
            - internal_error
          description: Код ошибки
        message:
          type: string
          description: Читаемое описание ошибки
        details:
          description: Дополнительные детали ошибки (произвольная структура)
      required:
        - code
        - message

    ChatJoinOk:
      type: object
      description: Успешный результат входа в чат (пустой объект)
      properties: {}

    ChatJoinAck:
      description: Подтверждение входа в чат (успех или ошибка)
      oneOf:
        - type: object
          description: Успешный ответ
          properties:
            ok:
              type: boolean
              enum: [true]
            data:
              $ref: "#/components/schemas/ChatJoinOk"
          required:
            - ok
            - data
        - type: object
          description: Ответ с ошибкой
          properties:
            ok:
              type: boolean
              enum: [false]
            error:
              $ref: "#/components/schemas/ApiError"
          required:
            - ok
            - error

    MessageSendOk:
      type: object
      description: Данные успешно поставленного в обработку сообщения
      properties:
        chatId:
          type: string
          description: MongoDB ObjectId чата
        clientMessageId:
          type: string
          description: Клиентский идентификатор сообщения
        processing:
          $ref: "#/components/schemas/MessageProcessing"
      required:
        - chatId
        - clientMessageId
        - processing

    MessageSendAck:
      description: Подтверждение отправки сообщения (успех или ошибка)
      oneOf:
        - type: object
          description: Успешный ответ
          properties:
            ok:
              type: boolean
              enum: [true]
            data:
              $ref: "#/components/schemas/MessageSendOk"
          required:
            - ok
            - data
        - type: object
          description: Ответ с ошибкой
          properties:
            ok:
              type: boolean
              enum: [false]
            error:
              $ref: "#/components/schemas/ApiError"
          required:
            - ok
            - error

    ProcessingCatchupOk:
      type: object
      description: Состояние обработки сообщений в чате
      properties:
        chatId:
          type: string
          description: MongoDB ObjectId чата
        stateVersion:
          type: number
          description: Текущая версия состояния чата
        items:
          type: array
          description: Список элементов обработки
          items:
            $ref: "#/components/schemas/MessageProcessing"
      required:
        - chatId
        - stateVersion
        - items

    ProcessingCatchupAck:
      description: Ответ на запрос состояния обработки (успех или ошибка)
      oneOf:
        - type: object
          description: Успешный ответ
          properties:
            ok:
              type: boolean
              enum: [true]
            data:
              $ref: "#/components/schemas/ProcessingCatchupOk"
          required:
            - ok
            - data
        - type: object
          description: Ответ с ошибкой
          properties:
            ok:
              type: boolean
              enum: [false]
            error:
              $ref: "#/components/schemas/ApiError"
          required:
            - ok
            - error

    # --- Outbound payload-типы ---

    ChatUpdatedEvent:
      type: object
      description: Уведомление об изменении состояния чата
      properties:
        chatId:
          type: string
          description: MongoDB ObjectId чата
        stateVersion:
          type: number
          description: Новая версия состояния чата
      required:
        - chatId
        - stateVersion

    MessageProcessingError:
      type: object
      description: Описание ошибки обработки сообщения
      properties:
        code:
          type: string
          minLength: 1
          description: Код ошибки обработки
        message:
          type: string
          minLength: 1
          description: Читаемое описание ошибки
        details:
          description: Дополнительные детали (произвольная структура)
      required:
        - code

    MessageProcessing:
      type: object
      description: Запись об обработке сообщения в очереди
      properties:
        id:
          type: string
          description: Идентификатор записи обработки
        chatId:
          type: string
          description: MongoDB ObjectId чата
        clientMessageId:
          type: string
          description: Клиентский идентификатор сообщения
        correlationId:
          type: string
          description: UUID корреляции с ответом бота (опционально)
        status:
          type: string
          enum:
            - queued
            - completed
            - failed
          description: Текущий статус обработки
        attempt:
          type: integer
          minimum: 1
          description: Номер попытки обработки
        version:
          type: integer
          minimum: 0
          description: Версия записи (для optimistic concurrency)
        error:
          $ref: "#/components/schemas/MessageProcessingError"
        createdAt:
          type: string
          format: date-time
          description: Дата создания записи (ISO 8601)
        updatedAt:
          type: string
          format: date-time
          description: Дата последнего обновления записи (ISO 8601)
      required:
        - id
        - chatId
        - clientMessageId
        - status
        - attempt
        - version
        - createdAt
        - updatedAt

    TimelineEventItem:
      type: object
      description: Событие в таймлайне чата (начало/завершение сессии и т.п.)
      properties:
        kind:
          type: string
          enum: [event]
          description: Дискриминатор типа элемента таймлайна
        key:
          type: string
          minLength: 1
          description: Уникальный ключ элемента
        chatId:
          type: string
          description: MongoDB ObjectId чата
        sessionId:
          type: string
          format: uuid
          description: UUID сессии
        type:
          type: string
          enum:
            - session.started
            - session.ended
          description: Тип события
        occurredAt:
          type: number
          description: Unix timestamp (миллисекунды) возникновения события
      required:
        - kind
        - key
        - chatId
        - sessionId
        - type
        - occurredAt

    TimelineMessageItem:
      type: object
      description: Сообщение в таймлайне чата
      properties:
        kind:
          type: string
          enum: [message]
          description: Дискриминатор типа элемента таймлайна
        key:
          type: string
          minLength: 1
          description: Уникальный ключ элемента
        chatId:
          type: string
          description: MongoDB ObjectId чата
        sessionId:
          type: string
          format: uuid
          description: UUID сессии
        correlationId:
          type: string
          format: uuid
          description: UUID корреляции с обработкой
        role:
          type: string
          enum:
            - user
            - bot
          description: Роль автора сообщения
        sideIndex:
          type: integer
          enum: [0, 1]
          description: Сторона диалога (0 = пользователь, 1 = бот)
        turnIndex:
          type: integer
          minimum: 0
          description: Порядковый номер хода в диалоге
        text:
          type: string
          description: Текст сообщения
        occurredAt:
          oneOf:
            - type: number
            - type: "null"
          description: Unix timestamp возникновения (null если ещё не зафиксировано)
      required:
        - kind
        - key
        - chatId
        - sessionId
        - correlationId
        - role
        - sideIndex
        - turnIndex
        - text

    TimelineItem:
      description: Элемент таймлайна чата — событие или сообщение
      oneOf:
        - $ref: "#/components/schemas/TimelineEventItem"
        - $ref: "#/components/schemas/TimelineMessageItem"

    TimelineCatchupEvent:
      type: object
      description: Снимок таймлайна чата, отправляемый клиенту при входе
      properties:
        chatId:
          type: string
          description: MongoDB ObjectId чата
        stateVersion:
          type: number
          description: Версия состояния чата на момент снимка
        items:
          type: array
          description: Элементы таймлайна
          items:
            $ref: "#/components/schemas/TimelineItem"
      required:
        - chatId
        - stateVersion
        - items

    PreviewNewEvent:
      type: object
      description: Стриминговый превью ответа бота
      properties:
        chatId:
          type: string
          description: MongoDB ObjectId чата
        sessionId:
          type: string
          description: UUID сессии
        text:
          type: string
          description: Накопленный текст превью ответа
      required:
        - chatId
        - sessionId
        - text

            `;

export default function Home() {
  // let schema: string;
  // try {
  //   const schemaPath = path.join(
  //     process.cwd(),
  //     "../../packages/chat-contracts/asyncapi/socket.yaml",
  //   );
  //   schema = fs.readFileSync(schemaPath, "utf-8");
  //   console.log(
  //     "[page] schema loaded, length:",
  //     schema.length,
  //     "cwd:",
  //     process.cwd(),
  //   );
  // } catch (e) {
  //   console.error("[page] failed to read schema:", e);
  //   return <pre style={{ color: "red" }}>{"" + e}</pre>;
  // }

  return (
    <AsyncApiViewer schema={schema1} config={{ show: { errors: true } }} />
  );
}
