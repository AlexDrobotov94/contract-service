import { createColumnHelper } from "@tanstack/react-table";
import { LifecycleBadge, ProtocolBadge } from "@/entities/service";
import Link from "next/link";
import { ROUTES } from "@/shared/configs";
import { Button } from "@/shared/ui/atoms/button";
import { QualityBar } from "@/shared/ui/molecules/quality-bar";
import { IconChevronDown, IconChevronRight, IconExternalLink } from "@tabler/icons-react";
import { ContractRow } from "../model/types";

const columnHelper = createColumnHelper<ContractRow>();

function resolveHref(row: ContractRow): string | null {
  if (row.protocol === "http") return ROUTES.contractHttpService(row.serviceId);
  if (row.protocol === "socket") return ROUTES.contractSocketService(row.serviceId);
  if (row.protocol === "websocket") return ROUTES.contractWebsocketService(row.serviceId);
  if (row.protocol === "rabbitmq") return ROUTES.contractRabbitmqService(row.serviceId);
  return null;
}

export const columns = [
  columnHelper.accessor("serviceName", {
    header: "Сервис",
    cell: ({ getValue, row }) => {
      const hasChildren = row.subRows.length > 0;
      return (
        <div className="flex items-center gap-1">
          {hasChildren && (
            <button
              onClick={row.getToggleExpandedHandler()}
              className="flex items-center text-muted-foreground hover:text-foreground"
            >
              {row.getIsExpanded() ? (
                <IconChevronDown size={14} />
              ) : (
                <IconChevronRight size={14} />
              )}
            </button>
          )}
          <Link href={ROUTES.service(row.original.serviceId)} className="hover:underline">
            {getValue()}
          </Link>
        </div>
      );
    },
  }),
  columnHelper.accessor("serviceId", {
    header: "ID",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">{getValue()}</span>
    ),
  }),
  columnHelper.accessor("protocol", {
    header: "Протокол",
    cell: ({ getValue, row }) => {
      if (row.subRows.length > 0) {
        return (
          <div className="flex flex-wrap gap-1">
            {row.subRows.map((sub) =>
              sub.original.protocol ? (
                <ProtocolBadge key={sub.original.protocol} protocol={sub.original.protocol} />
              ) : null,
            )}
          </div>
        );
      }
      const val = getValue();
      return val ? <ProtocolBadge protocol={val} /> : null;
    },
  }),
  columnHelper.accessor("lifecycle", {
    header: "Lifecycle",
    cell: ({ getValue }) => <LifecycleBadge lifecycle={getValue()} />,
  }),
  columnHelper.accessor("quality", {
    header: "Quality",
    enableSorting: false,
    cell: ({ getValue, row }) => {
      if (row.subRows.length > 0) return null;
      const q = getValue();
      if (!q) return <span className="text-muted-foreground text-xs">—</span>;
      return <QualityBar score={q.score} summary={q.summary} showTooltip />;
    },
  }),
  columnHelper.accessor("owner", {
    header: "Owner",
    cell: ({ getValue }) => <>{getValue()}</>,
  }),
  columnHelper.accessor("description", {
    header: "Описание",
    enableSorting: false,
    cell: ({ getValue, row }) => {
      if (row.subRows.length > 0) return null;
      return <>{getValue() ?? "—"}</>;
    },
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    enableSorting: false,
    cell: ({ row }) => {
      if (row.subRows.length > 0) return null;
      const href = resolveHref(row.original);
      if (!href) {
        return (
          <Button size="icon" variant="ghost" disabled>
            <IconExternalLink />
          </Button>
        );
      }
      return (
        <Button asChild size="icon" variant="ghost">
          <Link href={href}>
            <IconExternalLink />
          </Link>
        </Button>
      );
    },
  }),
];
