"server-only";

import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { getPackages } from "@manypkg/get-packages";
import type { ServiceMeta } from "../model/types";

export async function getServices(): Promise<ServiceMeta[]> {
  const { packages } = await getPackages(process.cwd());

  const contractPackages = packages.filter(
    (p) =>
      (p.packageJson as unknown as Record<string, unknown>).catalog === true,
  );

  const services: ServiceMeta[] = [];

  for (const pkg of contractPackages) {
    const yamlPath = path.join(pkg.dir, "metadata/service.yaml");

    if (!fs.existsSync(yamlPath)) {
      console.warn(`[contracts] service.yaml не найден: ${yamlPath}`);
      continue;
    }

    const raw = fs.readFileSync(yamlPath, "utf-8");
    const meta = yaml.load(raw) as ServiceMeta;

    services.push({
      ...meta,
      _packageDir: pkg.dir,
      _packageName: pkg.packageJson.name,
      _version: pkg.packageJson.version,
    });
  }

  return services;
}

export async function getService(id: string): Promise<ServiceMeta | undefined> {
  const services = await getServices();
  return services.find((s) => s.id === id);
}
