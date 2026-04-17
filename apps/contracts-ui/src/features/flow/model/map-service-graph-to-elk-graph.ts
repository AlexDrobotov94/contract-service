import type {
  ElkExtendedEdge,
  ElkLabel,
  ElkNode,
  ElkPort,
} from "elkjs/lib/elk-api";

import type { GraphEdge, GraphNode, GraphPort, ServiceGraph } from "./types";

function createNodeLabel(text: string): ElkLabel {
  return {
    text,
    width: 120,
    height: 24,
  };
}

function createEdgeLabel(text: string): ElkLabel {
  return {
    text,
    width: 50,
    height: 18,
  };
}

function buildElkPortId(nodeId: string, portId: string): string {
  return `${nodeId}/${portId}`;
}

function mapGraphPortToElkPort(nodeId: string, port: GraphPort): ElkPort {
  return {
    id: buildElkPortId(nodeId, port.id),
    width: 10,
    height: 10,
    layoutOptions: {
      "elk.port.side": port.side,
    },
  };
}

function mapGraphNodeToElkNode(node: GraphNode): ElkNode {
  return {
    id: node.id,
    width: node.width,
    height: node.height,
    labels: [createNodeLabel(node.name)],
    ports: node.ports.map((port) => mapGraphPortToElkPort(node.id, port)),
  };
}

function mapGraphEdgeToElkEdge(edge: GraphEdge): ElkExtendedEdge {
  return {
    id: edge.id,
    sources: [buildElkPortId(edge.sourceNodeId, edge.sourcePortId)],
    targets: [buildElkPortId(edge.targetNodeId, edge.targetPortId)],
    labels: [createEdgeLabel(edge.protocol)],
  };
}

export function mapServiceGraphToElkGraph(graph: ServiceGraph): ElkNode {
  return {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "DOWN",
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.portConstraints": "FIXED_SIDE",
      "elk.layered.spacing.nodeNodeBetweenLayers": "80",
      "elk.spacing.nodeNode": "40",
    },
    children: graph.nodes.map(mapGraphNodeToElkNode),
    edges: graph.edges.map(mapGraphEdgeToElkEdge),
  };
}
