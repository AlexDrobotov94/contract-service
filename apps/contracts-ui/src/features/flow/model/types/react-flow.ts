import type { Edge, Node } from "@xyflow/react";

import type { GraphPort } from "./graph";
import type { Protocol } from "./protocol";

export type ReactFlowPortData = GraphPort & { x: number; y: number };

export type ReactFlowNodeData = {
  label: string;
  ports: ReactFlowPortData[];
};

export type ServiceFlowNode = Node<ReactFlowNodeData, "service">;

export type ServiceEdgeData = {
  protocol: Protocol;
};

export type ServiceEdge = Edge<ServiceEdgeData, "service-edge">;

export type EmbedEdgeData = Record<string, never>;

export type EmbedEdge = Edge<EmbedEdgeData, "embed-edge">;
