"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/atoms/table";
import {
  ServiceMeta,
  LifecycleBadge,
  ProtocolBadge,
} from "@/entities/service";
import Link from "next/link";
import { ROUTES } from "@/shared/configs";
import { Button } from "@/shared/ui/atoms/button";
import { IconExternalLink } from "@tabler/icons-react";

const columnHelper = createColumnHelper<ServiceMeta>();

const columns = [
  columnHelper.accessor("name", {
    header: "Название",
  }),
  columnHelper.accessor("id", {
    header: "ID",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">{getValue()}</span>
    ),
  }),
  columnHelper.accessor("lifecycle", {
    header: "Lifecycle",
    cell: ({ getValue }) => <LifecycleBadge lifecycle={getValue()} />,
  }),
  columnHelper.accessor("owner", {
    header: "Owner",
  }),
  columnHelper.accessor("system", {
    header: "System",
  }),
  columnHelper.accessor("domain", {
    header: "Domain",
  }),
  columnHelper.accessor("contracts", {
    header: "Контракты",
    enableSorting: false,
    cell: ({ getValue }) => {
      const contracts = getValue();
      return (
        <div className="flex flex-wrap gap-1">
          {contracts.map((c) => (
            <ProtocolBadge key={c.protocol} protocol={c.protocol} />
          ))}
        </div>
      );
    },
  }),
  columnHelper.accessor("tags", {
    header: "Теги",
    enableSorting: false,
    cell: ({ getValue }) => {
      const tags = getValue();
      if (!tags?.length) return null;
      return (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>
      );
    },
  }),
  columnHelper.accessor("_version", {
    header: "Версия",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">{getValue()}</span>
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    enableSorting: false,
    cell: ({ row }) => (
      <Button asChild size="icon" variant="ghost">
        <Link href={ROUTES.service(row.original.id)}>
          <IconExternalLink />
        </Link>
      </Button>
    ),
  }),
];

export const ServicesTable = ({ services }: { services: ServiceMeta[] }) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: services,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={
                    header.column.getCanSort()
                      ? "cursor-pointer select-none"
                      : ""
                  }
                >
                  <div className="flex items-center gap-1">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    {header.column.getIsSorted() === "asc" && " ↑"}
                    {header.column.getIsSorted() === "desc" && " ↓"}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Нет данных
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
