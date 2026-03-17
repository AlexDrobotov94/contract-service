import { ServiceDescriptor } from "@/shared/types/service.generated";

export type ServiceMeta = ServiceDescriptor & {
  _packageDir: string;
  _packageName: string;
  _version: string;
};

export type ServiceProtocol = ServiceMeta["contracts"][number]["protocol"];
export type ServiceLifecycle = ServiceMeta["lifecycle"];
