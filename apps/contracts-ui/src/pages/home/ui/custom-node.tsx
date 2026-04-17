// apps\contracts-ui\src\pages\home\ui\custom-node.tsx
"use client";

import { memo } from "react";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeFooter,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "@/shared/ui/atoms/base-node";
import { Button } from "@/shared/ui/atoms/button";
import { NodeProps } from "@xyflow/react";
import { ServiceNode } from "../model/types";

export const ServiceNodeComponent = memo(({ data }: NodeProps<ServiceNode>) => {
  const { name, owner } = data;

  return (
    <BaseNode className="w-96">
      <BaseNodeHeader className="border-b">
        <BaseNodeHeaderTitle>{name}</BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <BaseNodeContent>
        <p className="text-xs">Owner: {owner}</p>
      </BaseNodeContent>
    </BaseNode>
  );
});

ServiceNodeComponent.displayName = "ServiceNodeComponent";
