import { ServiceNode } from "./types";
import type { GraphEdgeKind } from "./types/graph";

export type EdgeDirection = "forward" | "backward" | "bidirectional";

export const PROTOCOL_EDGE_DIRECTION: Record<GraphEdgeKind, EdgeDirection> = {
  http: "forward",
  grpc: "forward",
  graphql: "forward",
  socket: "bidirectional",
  websocket: "bidirectional",
  rabbitmq: "backward",
  embed: "forward",
};

export const services: ServiceNode[] = [
  {
    id: "portal-frontend",
    name: "Portal Frontend",
    provides: [],
    consumesApis: [
      { serviceId: "portal-backend", protocol: "http" },
      { serviceId: "portal-backend", protocol: "socket" },
    ],
    embeds: ["mfe-chat"],
  },
  {
    id: "portal-backend",
    name: "Portal Backend",
    provides: ["http", "socket"],
    consumesApis: [],
  },
  {
    id: "mfe-chat",
    name: "MFE Chat",
    provides: [],
    consumesApis: [
      { serviceId: "chat-service", protocol: "http" },
      { serviceId: "chat-service", protocol: "socket" },
    ],
  },
  {
    id: "chat-service",
    name: "Chat Service",
    provides: ["http", "socket"],
    consumesApis: [{ serviceId: "dialer-service", protocol: "rabbitmq" }],
  },
  {
    id: "dialer-service",
    name: "Dialer Service",
    provides: ["rabbitmq"],
    consumesApis: [],
  },
];
