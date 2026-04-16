import { ServiceLifecycle, ServiceProtocol } from "@/entities/service";
import type { QualityEntry } from "@/entities/service/lib/build-quality-map";

export type ContractRow = {
  serviceId: string;
  serviceName: string;
  lifecycle: ServiceLifecycle;
  owner: string;
  protocol: ServiceProtocol | undefined;
  description: string | undefined;
  quality?: QualityEntry;
  subRows?: ContractRow[];
};
