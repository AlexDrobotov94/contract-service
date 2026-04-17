import { ServiceNode } from "./types";

export const services: ServiceNode[] = [
  {
    id: "frontend",
    name: "Frontend",
    provides: [],
    dependsOn: [
      { serviceId: "backend", protocol: "http" },
      { serviceId: "backend", protocol: "socket" },
    ],
  },
  {
    id: "backend",
    name: "Backend",
    provides: ["http", "socket"],
    dependsOn: [],
  },
];
