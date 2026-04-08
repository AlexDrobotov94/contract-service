export const ROUTES = {
  home: () => "/",
  services: () => "/services",
  service: (service: string) => `/services/${service}`,
  contracts: () => "/contracts",
  contractHttpService: (service: string) => `/contracts/http/${service}`,
  contractSocketService: (service: string) => `/contracts/socket/${service}`,
  contractRabbitmqService: (service: string) =>
    `/contracts/rabbitmq/${service}`,
} as const;
