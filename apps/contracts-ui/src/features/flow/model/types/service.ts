import type { Protocol } from "./protocol";

export type ServiceDependency = {
  serviceId: string;
  protocol: Protocol;
};

export type ServiceNode = {
  id: string;
  name: string;
  provides: Protocol[];
  consumesApis: ServiceDependency[];
};
