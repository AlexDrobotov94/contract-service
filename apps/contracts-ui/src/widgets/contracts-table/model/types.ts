import { ServiceLifecycle, ServiceProtocol } from "@/entities/service";

export type ContractRow = {
  serviceId: string;
  serviceName: string;
  lifecycle: ServiceLifecycle;
  owner: string;
  protocol: ServiceProtocol | undefined;
  description: string | undefined;
  subRows?: ContractRow[];
};
