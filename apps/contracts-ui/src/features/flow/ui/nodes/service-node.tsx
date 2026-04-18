import { Handle, Position, type NodeProps } from "@xyflow/react";
import { GraphPort, ServiceFlowNode } from "../../model/types";

function getHandlePosition(side: GraphPort["side"]): Position {
  switch (side) {
    case "WEST":
      return Position.Left;
    case "EAST":
      return Position.Right;
  }
}

export function ServiceNode({ data }: NodeProps<ServiceFlowNode>) {
  return (
    <div
      style={{
        position: "relative",
        width: "220px",
        minHeight: "100px",
        border: "1px solid #d0d5dd",
        borderRadius: "12px",
        background: "#fff",
        padding: "16px",
        boxSizing: "border-box",
      }}
    >
      {data.ports.map((port) => (
        <Handle
          key={port.id}
          id={port.id}
          type={port.direction === "in" ? "target" : "source"}
          position={getHandlePosition(port.side)}
        />
      ))}

      <div
        style={{
          fontSize: "14px",
          fontWeight: 600,
        }}
      >
        {data.label}
      </div>
    </div>
  );
}
