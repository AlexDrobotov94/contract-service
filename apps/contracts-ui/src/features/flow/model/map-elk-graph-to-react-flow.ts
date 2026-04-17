import type { ElkExtendedEdge, ElkNode } from "elkjs/lib/elk-api";

import type {
  GraphPort,
  ServiceEdge,
  ServiceFlowNode,
  ServiceGraph,
} from "./types";

function extractNodeLabel(node: ElkNode): string {
  return node.labels?.[0]?.text ?? node.id;
}

function extractNodeIdFromPortId(portId: string): string {
  const [nodeId] = portId.split("/");

  if (!nodeId) {
    throw new Error(`Некорректный port id: "${portId}"`);
  }

  return nodeId;
}

function extractHandleIdFromPortId(portId: string): string {
  const [, handleId] = portId.split("/");

  if (!handleId) {
    throw new Error(`Некорректный port id: "${portId}"`);
  }

  return handleId;
}

function mapElkNodeToReactFlowNode(
  node: ElkNode,
  ports: GraphPort[],
): ServiceFlowNode {
  return {
    id: node.id,
    position: {
      x: node.x ?? 0,
      y: node.y ?? 0,
    },
    width: node.width,
    height: node.height,
    data: {
      label: extractNodeLabel(node),
      ports,
    },
    type: "service",
  };
}

function mapElkEdgeToReactFlowEdge(edge: ElkExtendedEdge): ServiceEdge {
  const sourcePortId = edge.sources?.[0];
  const targetPortId = edge.targets?.[0];

  if (!sourcePortId || !targetPortId) {
    throw new Error(`У ребра "${edge.id}" отсутствует source или target port`);
  }

  const protocol = edge.labels?.[0]?.text === "socket" ? "socket" : "http";

  return {
    id: edge.id,
    source: extractNodeIdFromPortId(sourcePortId),
    target: extractNodeIdFromPortId(targetPortId),
    sourceHandle: extractHandleIdFromPortId(sourcePortId),
    targetHandle: extractHandleIdFromPortId(targetPortId),
    type: "service-edge",
    data: {
      label: edge.labels?.[0]?.text ?? "",
      protocol,
    },
  };
}

export function mapElkGraphToReactFlow(
  layoutedGraph: ElkNode,
  graph: ServiceGraph,
): { nodes: ServiceFlowNode[]; edges: ServiceEdge[] } {
  const elkNodes = layoutedGraph.children ?? [];
  const elkEdges = (layoutedGraph.edges ?? []) as ElkExtendedEdge[];

  const graphNodesById = new Map(graph.nodes.map((node) => [node.id, node]));

  const nodes: ServiceFlowNode[] = elkNodes.map((elkNode) => {
    const graphNode = graphNodesById.get(elkNode.id);

    if (!graphNode) {
      throw new Error(`Нода "${elkNode.id}" отсутствует в ServiceGraph`);
    }

    return mapElkNodeToReactFlowNode(elkNode, graphNode.ports);
  });

  const edges: ServiceEdge[] = elkEdges.map(mapElkEdgeToReactFlowEdge);

  return { nodes, edges };
}
