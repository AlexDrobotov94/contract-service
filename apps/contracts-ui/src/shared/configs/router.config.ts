export const ROUTES = {
  home: () => "/",
  services: () => "/services",
  service: (service: string) => `/services/${service}`,
} as const;
