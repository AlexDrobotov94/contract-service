/* AUTO-GENERATED — не редактировать руками. Источник: tooling/schemas/quality.schema.json */

/**
 * Типы для x-quality-* расширений OpenAPI/AsyncAPI и x-quality-summary. Используются порталом контрактов для отображения метрик качества.
 */
export interface ContractQuality {
  [k: string]: unknown;
}
/**
 * Счётчики по одному критерию качества: yes — критерий выполнен, no — не выполнен, na — не применимо к операции.
 *
 * This interface was referenced by `ContractQuality`'s JSON-Schema
 * via the `definition` "QualitySummaryScore".
 */
export interface QualitySummaryScore {
  /**
   * Количество операций, для которых критерий выполнен.
   */
  yes: number;
  /**
   * Количество операций, для которых критерий не выполнен.
   */
  no: number;
  /**
   * Количество операций, для которых критерий неприменим.
   */
  na: number;
}
/**
 * Агрегированные счётчики по всем 6 HTTP-критериям качества.
 *
 * This interface was referenced by `ContractQuality`'s JSON-Schema
 * via the `definition` "HttpQualitySummaryScores".
 */
export interface HttpQualitySummaryScores {
  'params-typed': QualitySummaryScore;
  'body-typed': QualitySummaryScore;
  'response-typed': QualitySummaryScore;
  'body-validated': QualitySummaryScore;
  'errors-defined': QualitySummaryScore;
  'contract-implemented': QualitySummaryScore;
}
/**
 * Агрегированные счётчики по всем 4 AsyncAPI-критериям качества.
 *
 * This interface was referenced by `ContractQuality`'s JSON-Schema
 * via the `definition` "AsyncQualitySummaryScores".
 */
export interface AsyncQualitySummaryScores {
  'payload-typed': QualitySummaryScore;
  'payload-validated': QualitySummaryScore;
  'errors-defined': QualitySummaryScore;
  'contract-implemented': QualitySummaryScore;
}
/**
 * Корневой блок x-quality-summary в OpenAPI-файле. Содержит агрегированные метрики по всем HTTP-операциям.
 *
 * This interface was referenced by `ContractQuality`'s JSON-Schema
 * via the `definition` "HttpQualitySummary".
 */
export interface HttpQualitySummary {
  /**
   * Общее количество HTTP-операций в файле.
   */
  total: number;
  scores: HttpQualitySummaryScores;
  /**
   * ISO 8601 timestamp момента генерации контракта.
   */
  generatedAt: string;
  /**
   * Имя агента, выполнившего оценку (например: kvint-openapi-full-agent).
   */
  generatedBy: string;
}
/**
 * Корневой блок x-quality-summary в AsyncAPI-файле. Содержит агрегированные метрики по всем async-операциям.
 *
 * This interface was referenced by `ContractQuality`'s JSON-Schema
 * via the `definition` "AsyncQualitySummary".
 */
export interface AsyncQualitySummary {
  /**
   * Общее количество async-операций в файле.
   */
  total: number;
  scores: AsyncQualitySummaryScores;
  /**
   * ISO 8601 timestamp момента генерации контракта.
   */
  generatedAt: string;
  /**
   * Имя агента, выполнившего оценку (например: kvint-rabbitmq-agent).
   */
  generatedBy: string;
}
/**
 * x-quality-* расширения на уровне одной HTTP-операции OpenAPI. Все поля опциональны: отсутствующее поле означает неприменимость критерия (N/A).
 *
 * This interface was referenced by `ContractQuality`'s JSON-Schema
 * via the `definition` "HttpOperationQuality".
 */
export interface HttpOperationQuality {
  /**
   * Все path/query/header параметры операции имеют явные типы.
   */
  'x-quality-params-typed'?: boolean;
  /**
   * Тело запроса типизировано явным DTO/интерфейсом/схемой.
   */
  'x-quality-body-typed'?: boolean;
  /**
   * Метод возвращает явный не-any тип.
   */
  'x-quality-response-typed'?: boolean;
  /**
   * Тело запроса проходит runtime-валидацию.
   */
  'x-quality-body-validated'?: boolean;
  /**
   * Определён хотя бы один error-кейс (4xx/5xx).
   */
  'x-quality-errors-defined'?: boolean;
  /**
   * Сервис использует контракт-пакет (@kvint/*-contracts) или кодогенерацию.
   */
  'x-quality-contract-implemented'?: boolean;
}
/**
 * x-quality-* расширения на уровне одной AsyncAPI-операции. Все поля опциональны.
 *
 * This interface was referenced by `ContractQuality`'s JSON-Schema
 * via the `definition` "AsyncOperationQuality".
 */
export interface AsyncOperationQuality {
  /**
   * Payload сообщения типизирован явным DTO/схемой.
   */
  'x-quality-payload-typed'?: boolean;
  /**
   * Payload проходит runtime-валидацию.
   */
  'x-quality-payload-validated'?: boolean;
  /**
   * Определена обработка ошибок (nack, DLX, error-событие, close с кодом).
   */
  'x-quality-errors-defined'?: boolean;
  /**
   * Сервис использует контракт-пакет или кодогенерацию.
   */
  'x-quality-contract-implemented'?: boolean;
}
