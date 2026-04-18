import type { ELK, ElkNode } from "elkjs/lib/elk-api";

import type { ServiceGraph } from "./types";
import { mapServiceGraphToElkGraph } from "./map-service-graph-to-elk-graph";

let elkPromise: Promise<ELK> | null = null;

function getElk(): Promise<ELK> {
  if (!elkPromise) {
    elkPromise = import("elkjs/lib/elk.bundled.js").then(
      ({ default: ELK }) => new ELK(),
    );
  }
  return elkPromise;
}

export async function layoutServiceGraph(
  graph: ServiceGraph,
): Promise<ElkNode> {
  const instance = await getElk();
  return instance.layout(mapServiceGraphToElkGraph(graph)) as Promise<ElkNode>;
}
