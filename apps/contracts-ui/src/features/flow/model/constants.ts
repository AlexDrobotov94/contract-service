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
    dependsOn: [
      { serviceId: "orders", protocol: "http" },
      { serviceId: "auth", protocol: "http" },
      { serviceId: "notifications", protocol: "socket" },
    ],
  },
  {
    id: "orders",
    name: "Orders",
    provides: ["http"],
    dependsOn: [{ serviceId: "payments", protocol: "http" }],
  },
  {
    id: "auth",
    name: "Auth",
    provides: ["http"],
    dependsOn: [],
  },
  {
    id: "payments",
    name: "Payments",
    provides: ["http"],
    dependsOn: [],
  },
  {
    id: "notifications",
    name: "Notifications",
    provides: ["socket"],
    dependsOn: [],
  },
];
