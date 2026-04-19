import type { ElkExtendedEdge, ElkNode } from "elkjs/lib/elk-api";
import { MarkerType } from "@xyflow/react";

import type {
  EmbedEdge,
  GraphNode,
  ReactFlowPortData,
  ServiceEdge,
  ServiceFlowNode,
  ServiceGraph,
} from "./types";
import type { Protocol } from "./types/protocol";
import { PROTOCOL_EDGE_DIRECTION } from "./constants";

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
  elkNode: ElkNode,
  graphNode: GraphNode,
): ServiceFlowNode {
  const elkPortById = new Map(elkNode.ports?.map((p) => [p.id, p]) ?? []);

  const ports: ReactFlowPortData[] = graphNode.ports.map((port) => {
    const elkPort = elkPortById.get(`${elkNode.id}/${port.id}`);
    return { ...port, x: elkPort?.x ?? 0, y: elkPort?.y ?? 0 };
  });

  return {
    id: elkNode.id,
    position: { x: elkNode.x ?? 0, y: elkNode.y ?? 0 },
    width: elkNode.width,
    height: elkNode.height,
    data: { label: extractNodeLabel(elkNode), ports },
    type: "service",
  };
}

function mapElkEdgeToReactFlowEdge(edge: ElkExtendedEdge): ServiceEdge | EmbedEdge {
  const sourcePortId = edge.sources?.[0];
  const targetPortId = edge.targets?.[0];

  if (!sourcePortId || !targetPortId) {
    throw new Error(`У ребра "${edge.id}" отсутствует source или target port`);
  }

  const label = edge.labels?.[0]?.text ?? "http";

  if (label === "embeds") {
    return {
      id: edge.id,
      source: extractNodeIdFromPortId(sourcePortId),
      target: extractNodeIdFromPortId(targetPortId),
      sourceHandle: extractHandleIdFromPortId(sourcePortId),
      targetHandle: extractHandleIdFromPortId(targetPortId),
      type: "embed-edge",
      data: {},
      markerEnd: { type: MarkerType.ArrowClosed },
    };
  }

  const protocol = label as Protocol;
  const direction = PROTOCOL_EDGE_DIRECTION[protocol];
  const marker = { type: MarkerType.ArrowClosed };

  return {
    id: edge.id,
    source: extractNodeIdFromPortId(sourcePortId),
    target: extractNodeIdFromPortId(targetPortId),
    sourceHandle: extractHandleIdFromPortId(sourcePortId),
    targetHandle: extractHandleIdFromPortId(targetPortId),
    type: "service-edge",
    data: { protocol },
    markerEnd: direction !== "backward" ? marker : undefined,
    markerStart: direction !== "forward" ? marker : undefined,
  };
}

export function mapElkGraphToReactFlow(
  layoutedGraph: ElkNode,
  graph: ServiceGraph,
): { nodes: ServiceFlowNode[]; edges: (ServiceEdge | EmbedEdge)[] } {
  const elkNodes = layoutedGraph.children ?? [];
  const elkEdges = (layoutedGraph.edges ?? []) as ElkExtendedEdge[];

  const graphNodesById = new Map(graph.nodes.map((node) => [node.id, node]));

  const nodes: ServiceFlowNode[] = elkNodes.map((elkNode) => {
    const graphNode = graphNodesById.get(elkNode.id);

    if (!graphNode) {
      throw new Error(`Нода "${elkNode.id}" отсутствует в ServiceGraph`);
    }

    return mapElkNodeToReactFlowNode(elkNode, graphNode);
  });

  const edges = elkEdges.map(mapElkEdgeToReactFlowEdge);

  return { nodes, edges };
}
