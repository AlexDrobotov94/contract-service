/* AUTO-GENERATED — не редактировать руками. Источник: tooling/schemas/service.schema.json */

/**
 * Схема метаданных сервиса для портала контрактов Kvint
 */
export interface ServiceDescriptor {
  /**
   * Версия формата дескриптора. Используется порталом для выбора парсера.
   */
  apiVersion: 'kvint/v1';
  /**
   * Тип сущности каталога. Сейчас поддерживается только component.
   */
  kind: 'component';
  /**
   * Пространство имён. Обычно default.
   */
  namespace: string;
  /**
   * Уникальный идентификатор сервиса. Должен быть зарегистрирован в services.schema.json.
   */
  id: 'chat-service' | 'chat-service-old' | 'bff-service' | 'user-service' | 'payment-service';
  /**
   * Человекочитаемое название сервиса.
   */
  name: string;
  /**
   * Краткое описание назначения сервиса.
   */
  description?: string;
  /**
   * Владелец в формате <kind>:<namespace>/<id>. Должен быть зарегистрирован в owners.schema.json.
   */
  owner: 'group:default/team-chat';
  /**
   * Стадия жизненного цикла сервиса.
   */
  lifecycle: 'experimental' | 'production' | 'deprecated';
  /**
   * Тип компонента. Для бэкенд-сервисов — service.
   */
  type?: 'service' | 'library' | 'website';
  /**
   * Логическая система или продукт. Например: voice-robots, payments.
   */
  system: string;
  /**
   * Доменная область внутри системы. Например: chat, billing, auth.
   */
  domain: string;
  /**
   * Теги для фильтрации и поиска. Например: nestjs, rabbitmq, postgresql.
   */
  tags?: string[];
  /**
   * Ссылки на внешние ресурсы сервиса: GitLab, Grafana, Runbook и т.д.
   */
  links?: {
    /**
     * URL ресурса.
     */
    url: string;
    /**
     * Человекочитаемое название ссылки.
     */
    title: string;
    /**
     * Иконка для отображения в портале.
     */
    icon?: 'gitlab' | 'dashboard' | 'docs' | 'runbook' | 'alert';
  }[];
  /**
   * Список контрактных файлов сервиса. Определяет какие вкладки показывать в портале.
   *
   * @minItems 1
   */
  contracts: [
    {
      /**
       * Тип протокола. Определяет UI-компонент для рендеринга. http — REST/OpenAPI (Scalar). rabbitmq — RabbitMQ/AMQP (AsyncAPI viewer). socket — Socket.IO (AsyncAPI viewer). grpc — gRPC. graphql — GraphQL.
       */
      protocol: 'http' | 'rabbitmq' | 'socket' | 'grpc' | 'graphql';
      /**
       * Относительный путь к файлу контракта от корня пакета. Например: openapi/openapi.yaml
       */
      path: string;
      /**
       * Краткое описание этого контракта.
       */
      description?: string;
    },
    ...{
      /**
       * Тип протокола. Определяет UI-компонент для рендеринга. http — REST/OpenAPI (Scalar). rabbitmq — RabbitMQ/AMQP (AsyncAPI viewer). socket — Socket.IO (AsyncAPI viewer). grpc — gRPC. graphql — GraphQL.
       */
      protocol: 'http' | 'rabbitmq' | 'socket' | 'grpc' | 'graphql';
      /**
       * Относительный путь к файлу контракта от корня пакета. Например: openapi/openapi.yaml
       */
      path: string;
      /**
       * Краткое описание этого контракта.
       */
      description?: string;
    }[]
  ];
  /**
   * Явные зависимости от других сервисов.
   */
  dependsOn?: {
    service:
      | 'component:default/chat-service'
      | 'component:default/chat-service-old'
      | 'component:default/bff-service'
      | 'component:default/user-service'
      | 'component:default/payment-service';
    /**
     * Тип зависимости: http — синхронный вызов, event/queue — асинхронный, socket — WebSocket.
     */
    type: 'http' | 'event' | 'queue' | 'socket';
    /**
     * Зачем этот сервис нужен — контекст для карты зависимостей.
     */
    description?: string;
  }[];
}
