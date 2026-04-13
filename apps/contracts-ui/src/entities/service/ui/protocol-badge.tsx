import { Badge } from "@/shared/ui/atoms/badge";
import { ServiceProtocol } from "../model/types";

const protocolStyles: Record<ServiceProtocol, string> = {
  http: "border-transparent bg-blue-100 text-blue-800",
  rabbitmq: "border-transparent bg-purple-100 text-purple-800",
  socket: "border-transparent bg-orange-100 text-orange-800",
  websocket: "border-transparent bg-cyan-100 text-cyan-800",
  grpc: "border-transparent bg-pink-100 text-pink-800",
  graphql: "border-transparent bg-indigo-100 text-indigo-800",
};

export const ProtocolBadge = ({ protocol }: { protocol: ServiceProtocol }) => (
  <Badge className={protocolStyles[protocol]}>{protocol}</Badge>
);
