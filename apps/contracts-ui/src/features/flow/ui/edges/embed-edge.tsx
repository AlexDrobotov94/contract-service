"use client";

import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import { EmbedEdge } from "../../model/types";

export const EmbedEdgeComponent = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    selected,
  }: EdgeProps<EmbedEdge>) => {
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    });

    return (
      <>
        <BaseEdge
          id={id}
          path={edgePath}
          markerEnd={markerEnd}
          style={{
            strokeWidth: selected ? 2 : 1.5,
            strokeDasharray: "6 3",
          }}
        />

        <EdgeLabelRenderer>
          <div
            className="absolute rounded border bg-background px-2 py-1 text-xs shadow-sm text-muted-foreground"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
            }}
          >
            embeds
          </div>
        </EdgeLabelRenderer>
      </>
    );
  },
);

EmbedEdgeComponent.displayName = "EmbedEdgeComponent";
