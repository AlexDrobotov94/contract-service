import {
  GraphEdge,
  GraphNode,
  GraphPort,
  GraphPortDirection,
  Protocol,
  ServiceGraph,
  ServiceNode,
} from "./types";

function getPortId(protocol: Protocol, direction: GraphPortDirection): string {
  return `${protocol}-${direction}`;
}
function createInPort(protocol: Protocol): GraphPort {
  return {
    id: getPortId(protocol, "in"),
    protocol,
    direction: "in",
    side: "NORTH",
  };
}

function createOutPort(protocol: Protocol): GraphPort {
  return {
    id: getPortId(protocol, "out"),
    protocol,
    direction: "out",
    side: "SOUTH",
  };
}

function buildNodePorts(service: ServiceNode): GraphPort[] {
  const ports: GraphPort[] = [];

  for (const protocol of service.provides) {
    ports.push(createInPort(protocol));
  }

  const outgoingProtocols = new Set<Protocol>(
    service.dependsOn.map((dependency) => dependency.protocol),
  );

  for (const protocol of outgoingProtocols) {
    ports.push(createOutPort(protocol));
  }

  return ports;
}

function buildGraphNode(service: ServiceNode): GraphNode {
  return {
    id: service.id,
    name: service.name,
    width: 220,
    height: 100,
    ports: buildNodePorts(service),
  };
}

function buildGraphNodes(services: ServiceNode[]): GraphNode[] {
  return services.map(buildGraphNode);
}

function buildEdgeId(
  sourceNodeId: string,
  protocol: Protocol,
  targetNodeId: string,
): string {
  return `${sourceNodeId}-${protocol}-${targetNodeId}`;
}

function buildGraphEdges(services: ServiceNode[]): GraphEdge[] {
  const edges: GraphEdge[] = [];

  for (const service of services) {
    for (const dependency of service.dependsOn) {
      edges.push({
        id: buildEdgeId(service.id, dependency.protocol, dependency.serviceId),
        sourceNodeId: service.id,
        sourcePortId: getPortId(dependency.protocol, "out"),
        targetNodeId: dependency.serviceId,
        targetPortId: getPortId(dependency.protocol, "in"),
        protocol: dependency.protocol,
      });
    }
  }

  return edges;
}

function validateUniqueServiceIds(services: ServiceNode[]): void {
  const seen = new Set<string>();

  for (const service of services) {
    if (seen.has(service.id)) {
      throw new Error(`Найден дублирующийся service id: "${service.id}"`);
    }

    seen.add(service.id);
  }
}

function validateUniqueDependencies(service: ServiceNode): void {
  const seen = new Set<string>();

  for (const dependency of service.dependsOn) {
    const key = `${dependency.serviceId}:${dependency.protocol}`;

    if (seen.has(key)) {
      throw new Error(
        `У сервиса "${service.id}" найдена дублирующаяся зависимость "${dependency.protocol}" -> "${dependency.serviceId}"`,
      );
    }

    seen.add(key);
  }
}

function validateDependencyTargetExists(
  sourceService: ServiceNode,
  targetService: ServiceNode | undefined,
  targetServiceId: string,
): asserts targetService is ServiceNode {
  if (!targetService) {
    throw new Error(
      `Сервис "${sourceService.id}" зависит от несуществующего сервиса "${targetServiceId}"`,
    );
  }
}

function validateDependencyProtocolIsProvided(
  sourceService: ServiceNode,
  targetService: ServiceNode,
  protocol: Protocol,
): void {
  if (!targetService.provides.includes(protocol)) {
    throw new Error(
      `Сервис "${sourceService.id}" зависит от "${targetService.id}" по протоколу "${protocol}", но "${targetService.id}" его не предоставляет`,
    );
  }
}

function validateGraph(services: ServiceNode[]): void {
  validateUniqueServiceIds(services);

  const servicesById = new Map<string, ServiceNode>(
    services.map((service) => [service.id, service]),
  );

  for (const service of services) {
    validateUniqueDependencies(service);

    for (const dependency of service.dependsOn) {
      const targetService = servicesById.get(dependency.serviceId);

      validateDependencyTargetExists(
        service,
        targetService,
        dependency.serviceId,
      );

      validateDependencyProtocolIsProvided(
        service,
        targetService,
        dependency.protocol,
      );
    }
  }
}

export function buildServiceGraph(services: ServiceNode[]): ServiceGraph {
  validateGraph(services);

  return {
    nodes: buildGraphNodes(services),
    edges: buildGraphEdges(services),
  };
}
