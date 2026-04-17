// apps\contracts-ui\src\pages\home\ui\snadbox.tsx
"use client";

import { ZoomSlider } from "@/shared/ui/atoms/zoom-slider";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  DefaultEdgeOptions,
  Edge,
  FitViewOptions,
  Node,
  NodeTypes,
  OnConnect,
  OnEdgesChange,
  OnNodeDrag,
  OnNodesChange,
  ReactFlow,
} from "@xyflow/react";
import { useCallback, useState } from "react";
import { ServiceNodeComponent } from "./custom-node";
import { ServiceEdge, ServiceNode } from "../model/types";

const nodeTypes: NodeTypes = {
  service: ServiceNodeComponent,
};

const initialNodes: ServiceNode[] = [
  {
    id: "n1",
    type: "service",
    position: { x: 0, y: 0 },
    data: { name: "Service 1", owner: "Owner 1" },
  },
  {
    id: "n2",
    type: "service",
    position: { x: 0, y: 150 },
    data: { name: "Service 2", owner: "Owner 2" },
  },
];

const initialEdges: ServiceEdge[] = [
  {
    id: "n1-n2",
    type: "service-edge",
    source: "n1",
    target: "n2",
    data: {
      label: "Calls API",
      protocol: "http",
    },
  },
];

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};

const onNodeDrag: OnNodeDrag = (_, node) => {
  console.log("drag event", node.data);
};

export const ReactFlowSandbox = () => {
  const [nodes, setNodes] = useState<ServiceNode[]>(initialNodes);
  const [edges, setEdges] = useState<ServiceEdge[]>(initialEdges);

  const onNodesChange: OnNodesChange<ServiceNode> = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );
  const onEdgesChange: OnEdgesChange<ServiceEdge> = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  return (
    <div className="w-[90dvw] h-[90dvh] border-2 border-solid border-gray-500">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDrag={onNodeDrag}
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
