import type { Protocol } from "./protocol";

export type GraphPortDirection = "in" | "out";
export type GraphPortSide = "NORTH" | "SOUTH";

export type GraphEdgeKind = Protocol | "embed";

export type GraphPort = {
  id: string;
  protocol: GraphEdgeKind;
  direction: GraphPortDirection;
  side: GraphPortSide;
};

export type GraphNode = {
  id: string;
  name: string;
  width: number;
  height: number;
  ports: GraphPort[];
};

export type GraphEdge = {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
  protocol: GraphEdgeKind;
};

export type ServiceGraph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};
