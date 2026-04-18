import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ReactFlowPortData, ServiceFlowNode } from "../../model/types";

function getHandlePosition(side: ReactFlowPortData["side"]): Position {
  switch (side) {
    case "NORTH":
      return Position.Top;
    case "SOUTH":
      return Position.Bottom;
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
          style={{ left: port.x + 5 }}
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
