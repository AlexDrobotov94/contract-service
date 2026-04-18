"use client";

import { memo, useCallback } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import { ServiceEdge } from "../../model/types";

export const ServiceEdgeComponent = memo(
  ({
    id,
    data,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    selected,
  }: EdgeProps<ServiceEdge>) => {
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    });

    const renderData = useCallback(() => {
      if (!data) return null;

      return (
        <div>
          <div>{data.label}</div>
          <div>{data.protocol}</div>
        </div>
      );
    }, [data]);

    return (
      <>
        <BaseEdge
          id={id}
          path={edgePath}
          markerEnd={markerEnd}
          style={{
            strokeWidth: selected ? 2 : 1.5,
          }}
        />

        <EdgeLabelRenderer>
          <div
            className="absolute rounded border bg-background px-2 py-1 text-xs shadow-sm"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
            }}
          >
            {renderData()}
          </div>
        </EdgeLabelRenderer>
      </>
    );
  },
);

ServiceEdgeComponent.displayName = "ServiceEdgeComponent";
