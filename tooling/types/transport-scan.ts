export type ContractType =
  | "openapi"
  | "asyncapi"
  | "grpc"
  | "graphql"
  | "websocket"
  | "unknown";

export interface TransportEntry {
  contractType: ContractType;
  file: string; // относительно scannedDir
  symbol: {
    kind: "class" | "function" | "method";
    name: string;
    startLine: number;
    endLine: number;
  };
  evidence: {
    matchedPattern: string; // точная строка из скилла, по которой сработал матч
    snippet: string; // 1–3 строки исходного кода
  };
}

export interface TransportScanResult {
  createdAt: string; // ISO 8601, например "2026-03-27T14-32-05Z"
  scannedDir: string; // абсолютный путь
  framework: string;

  /** Для параллельного запуска субагентов — только непустые ключи */
  byContractType: Partial<Record<ContractType, TransportEntry[]>>;

  /** Для логов и отладки */
  all: TransportEntry[];

  /** Оркестратор логирует и не запускает субагентов для этих записей */
  warnings: Array<{
    message: string; // что найдено и почему не классифицировано
    file: string;
    snippet: string;
  }>;
}
