import { ServiceMeta } from "@/entities/service";
import type { QualityMap } from "@/entities/service/lib/build-quality-map";
import { ContractRow } from "./types";

export function buildRows(services: ServiceMeta[], qualityMap: QualityMap = {}): ContractRow[] {
  return services.map((service) => {
    const base = {
      serviceId: service.id,
      serviceName: service.name,
      lifecycle: service.lifecycle,
      owner: service.owner,
    };

    const contracts = service.contracts ?? [];

    if (contracts.length === 1) {
      const protocol = contracts[0].protocol;
      return {
        ...base,
        protocol,
        description: contracts[0].description,
        quality: qualityMap[`${service.id}:${protocol}`],
      };
    }

    return {
      ...base,
      protocol: undefined,
      description: undefined,
      subRows: contracts.map((c) => ({
        ...base,
        protocol: c.protocol,
        description: c.description,
        quality: qualityMap[`${service.id}:${c.protocol}`],
      })),
    };
  });
}
