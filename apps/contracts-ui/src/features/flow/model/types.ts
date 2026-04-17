import { Edge, Node } from "@xyflow/react";

export type Protocol = "http" | "socket";

export type ServiceDependency = {
  serviceId: string;
  protocol: Protocol;
};

export type ServiceNode = {
  id: string;
  name: string;
  provides: Protocol[];
  dependsOn: ServiceDependency[];
};

export type GraphPortDirection = "in" | "out";
export type GraphPortSide = "WEST" | "EAST";

export type GraphPort = {
  id: string;
  protocol: Protocol;
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
  protocol: Protocol;
};

export type ServiceGraph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

//

export type ReactFlowNodeData = {
  label: string;
  ports: GraphPort[];
};

export type ServiceFlowNode = Node<ReactFlowNodeData, "service">;

export type ServiceEdgeData = {
  label: string;
  protocol: "http" | "socket";
};

export type ServiceEdge = Edge<ServiceEdgeData, "service-edge">;
