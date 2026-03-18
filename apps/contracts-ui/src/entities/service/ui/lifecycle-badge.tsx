import { Badge } from "@/shared/ui/atoms/badge";
import { ServiceLifecycle } from "../model/types";

const lifecycleStyles: Record<ServiceLifecycle, string> = {
  production: "border-transparent bg-green-100 text-green-800",
  experimental: "border-transparent bg-yellow-100 text-yellow-800",
  deprecated: "border-transparent bg-gray-100 text-gray-600",
};

export const LifecycleBadge = ({ lifecycle }: { lifecycle: ServiceLifecycle }) => (
  <Badge className={lifecycleStyles[lifecycle]}>{lifecycle}</Badge>
);
