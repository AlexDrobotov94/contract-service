import { ServiceMeta } from "@/entities/service";
import { ContractRow } from "./types";

export function buildRows(services: ServiceMeta[]): ContractRow[] {
  return services.map((service) => {
    const base = {
      serviceId: service.id,
      serviceName: service.name,
      lifecycle: service.lifecycle,
      owner: service.owner,
    };

    if (service.contracts.length === 1) {
      return {
        ...base,
        protocol: service.contracts[0].protocol,
        description: service.contracts[0].description,
      };
    }

    return {
      ...base,
      protocol: undefined,
      description: undefined,
      subRows: service.contracts.map((c) => ({
        ...base,
        protocol: c.protocol,
        description: c.description,
      })),
    };
  });
}
