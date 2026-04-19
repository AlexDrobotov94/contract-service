import { ServiceNode } from "./types";
import type { Protocol } from "./types/protocol";

export type EdgeDirection = "forward" | "backward" | "bidirectional";

export const PROTOCOL_EDGE_DIRECTION: Record<Protocol, EdgeDirection> = {
  http: "forward",
  grpc: "forward",
  graphql: "forward",
  socket: "bidirectional",
  websocket: "bidirectional",
  rabbitmq: "backward",
};

export const services: ServiceNode[] = [
  {
    id: "frontend",
    name: "Frontend",
    provides: [],
    consumesApis: [
      { serviceId: "backend", protocol: "http" },
      { serviceId: "backend", protocol: "socket" },
    ],
  },
  {
    id: "backend",
    name: "Backend",
    provides: ["http", "socket"],
    consumesApis: [
      { serviceId: "orders", protocol: "http" },
      { serviceId: "auth", protocol: "http" },
      { serviceId: "notifications", protocol: "socket" },
    ],
  },
  {
    id: "orders",
    name: "Orders",
    provides: ["http"],
    consumesApis: [{ serviceId: "payments", protocol: "http" }],
  },
  {
    id: "auth",
    name: "Auth",
    provides: ["http"],
    consumesApis: [],
  },
  {
    id: "payments",
    name: "Payments",
    provides: ["http"],
    consumesApis: [],
  },
  {
    id: "notifications",
    name: "Notifications",
    provides: ["socket"],
    consumesApis: [],
  },
];
