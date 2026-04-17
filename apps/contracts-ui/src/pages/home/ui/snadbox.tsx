// apps\contracts-ui\src\pages\home\ui\snadbox.tsx
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

import { ServiceEdgeComponent } from "./custom-edge";
import { buildServiceGraph } from "@/features/flow/model/build-service-graph";
import { services } from "@/features/flow/model/constants";
import { layoutServiceGraph } from "@/features/flow/model/layout-service-graph";
import { mapElkGraphToReactFlow } from "@/features/flow/model/map-elk-graph-to-react-flow";
import { ServiceEdge, ServiceFlowNode } from "@/features/flow/model/types";
import { ServiceNode } from "@/features/flow/ui/service-node";
// import { ServiceEdge } from "../model/types";

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

export const ReactFlowSandbox = () => {
  const [nodes, setNodes] = useState<ServiceFlowNode[]>([]);
  const [edges, setEdges] = useState<ServiceEdge[]>([]);

  useEffect(() => {
    async function load() {
      const graph = buildServiceGraph(services);
      const layoutedGraph = await layoutServiceGraph(graph);
      const result = mapElkGraphToReactFlow(layoutedGraph, graph);

      setNodes(result.nodes);
      setEdges(result.edges);
    }

    void load();
  }, []);

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
