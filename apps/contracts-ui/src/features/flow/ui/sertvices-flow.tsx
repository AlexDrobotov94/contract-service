"use client";

import { ZoomSlider } from "@/shared/ui/atoms/zoom-slider";
import {
  Background,
  DefaultEdgeOptions,
  FitViewOptions,
  MarkerType,
  NodeTypes,
  ReactFlow,
} from "@xyflow/react";
import { useEffect, useState } from "react";
import { ServiceNode } from "./nodes/service-node";

import { ServiceEdge, ServiceFlowNode } from "../model/types";
import { buildServiceGraph } from "../model/build-service-graph";
import { services } from "../model/constants";
import { layoutServiceGraph } from "../model/layout-service-graph";
import { mapElkGraphToReactFlow } from "../model/map-elk-graph-to-react-flow";
import { ServiceEdgeComponent } from "./edges/servise-edge";

const nodeTypes: NodeTypes = {
  service: ServiceNode,
};
const edgeTypes = {
  "service-edge": ServiceEdgeComponent,
};

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
  markerEnd: {
    type: MarkerType.ArrowClosed,
  },
};

export const ServiceFlowViewer = () => {
  const [nodes, setNodes] = useState<ServiceFlowNode[]>([]);
  const [edges, setEdges] = useState<ServiceEdge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const graph = buildServiceGraph(services);
      const layoutedGraph = await layoutServiceGraph(graph);
      const result = mapElkGraphToReactFlow(layoutedGraph, graph);

      setNodes(result.nodes);
      setEdges(result.edges);
      setIsLoading(false);
    }

    load().catch(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="w-[90dvw] h-[90dvh] border-2 border-solid border-gray-500 flex items-center justify-center">
        <span className="text-muted-foreground text-sm">Загрузка графа...</span>
      </div>
    );
  }

  return (
    <div className="w-[90dvw] h-[90dvh] border-2 border-solid border-gray-500">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        // onNodesChange={onNodesChange}
        // onEdgesChange={onEdgesChange}
        // onConnect={onConnect}
        fitView
        fitViewOptions={fitViewOptions}
        defaultEdgeOptions={defaultEdgeOptions}
      >
        <Background />
        <ZoomSlider position="bottom-right" />
      </ReactFlow>
    </div>
  );
};
