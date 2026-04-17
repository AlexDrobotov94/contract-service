import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkNode } from "elkjs/lib/elk-api";

import type { ServiceGraph } from "./types";
import { mapServiceGraphToElkGraph } from "./map-service-graph-to-elk-graph";

const elk = new ELK();

export async function layoutServiceGraph(
  graph: ServiceGraph,
): Promise<ElkNode> {
  return elk.layout(mapServiceGraphToElkGraph(graph));
}
