"server-only";

import fs from "fs";
import path from "path";
import type { ServiceMeta, ServiceProtocol } from "../model/types";

export function getContractContent(
  service: ServiceMeta,
  protocol: ServiceProtocol,
): string | null {
  const contract = service.providesApis?.find((c) => c.protocol === protocol);
  if (!contract) return null;

  const filePath = path.join(service._packageDir, contract.path);
  if (!fs.existsSync(filePath)) return null;

  return fs.readFileSync(filePath, "utf-8");
}
