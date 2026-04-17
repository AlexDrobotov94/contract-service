// apps\contracts-ui\src\pages\home\model\types.ts
import { Edge, Node } from "@xyflow/react";

type ServiceNodeData = {
  name: string;
  owner: string;
};
type ServiceEdgeData = {
  label: string;
  protocol: "http" | "asyncapi";
};

export type ServiceNode = Node<ServiceNodeData, "service">;
export type ServiceEdge = Edge<ServiceEdgeData, "service-edge">;
