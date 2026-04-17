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
  MarkerType,
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
import { ServiceEdgeComponent } from "./custom-edge";

const nodeTypes: NodeTypes = {
  service: ServiceNodeComponent,
};
const edgeTypes = {
  "service-edge": ServiceEdgeComponent,
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
  markerEnd: {
    type: MarkerType.ArrowClosed,
  },
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
  const onConnect: OnConnect = useCallback((connection) => {
    if (!connection.source || !connection.target) {
      return;
    }

    const newEdge: ServiceEdge = {
      id: `${connection.source}-${connection.target}`,
      type: "service-edge",
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle ?? null,
      targetHandle: connection.targetHandle ?? null,
      data: {
        label: "New connection",
        protocol: "http",
      },
    };

    setEdges((eds) => addEdge(newEdge, eds));
  }, []);

  return (
    <div className="w-[90dvw] h-[90dvh] border-2 border-solid border-gray-500">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
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
