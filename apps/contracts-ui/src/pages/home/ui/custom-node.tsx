// apps\contracts-ui\src\pages\home\ui\custom-node.tsx
"use client";

import { memo } from "react";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "@/shared/ui/atoms/base-node";
import { Handle, NodeProps, Position } from "@xyflow/react";
import { ServiceNode } from "../model/types";

export const ServiceNodeComponent = memo(({ data }: NodeProps<ServiceNode>) => {
  const { name, owner } = data;

  return (
    <BaseNode className="w-96">
      <Handle type="target" position={Position.Top} />
      <BaseNodeHeader className="border-b">
        <BaseNodeHeaderTitle>{name}</BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <BaseNodeContent>
        <p className="text-xs">Owner: {owner}</p>
      </BaseNodeContent>
      <Handle type="source" position={Position.Bottom} />
    </BaseNode>
  );
});

ServiceNodeComponent.displayName = "ServiceNodeComponent";
