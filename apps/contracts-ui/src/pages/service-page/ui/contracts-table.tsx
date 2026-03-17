"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/atoms/table"

type ContractStatus = "active" | "pending" | "expired" | "cancelled"

type Contract = {
  id: string
  title: string
  counterparty: string
  amount: number
  currency: string
  status: ContractStatus
  startDate: string
  endDate: string
}

const mockContracts: Contract[] = [
  {
    id: "CTR-001",
    title: "Поставка оборудования",
    counterparty: "ООО Техносервис",
    amount: 1_500_000,
    currency: "RUB",
    status: "active",
    startDate: "2025-01-15",
    endDate: "2025-12-31",
  },
  {
    id: "CTR-002",
    title: "Разработка ПО",
    counterparty: "ИП Иванов А.А.",
    amount: 850_000,
    currency: "RUB",
    status: "pending",
    startDate: "2025-03-01",
    endDate: "2025-09-01",
  },
  {
    id: "CTR-003",
    title: "Аренда офисных помещений",
    counterparty: "АО Бизнес-Центр Плаза",
    amount: 240_000,
    currency: "RUB",
    status: "active",
    startDate: "2024-06-01",
    endDate: "2026-05-31",
  },
  {
    id: "CTR-004",
    title: "Консалтинговые услуги",
    counterparty: "McKinsey & Company",
    amount: 75_000,
    currency: "USD",
    status: "expired",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
  },
  {
    id: "CTR-005",
    title: "Техническое обслуживание",
    counterparty: "ООО СервисПлюс",
    amount: 360_000,
    currency: "RUB",
    status: "cancelled",
    startDate: "2025-02-01",
    endDate: "2025-07-31",
  },
]

const statusLabels: Record<ContractStatus, string> = {
  active: "Активен",
  pending: "На согласовании",
  expired: "Истёк",
  cancelled: "Отменён",
}

const statusStyles: Record<ContractStatus, string> = {
  active: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  expired: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-700",
}

const columns: ColumnDef<Contract>[] = [
  {
    accessorKey: "id",
    header: "№ договора",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "title",
    header: "Наименование",
  },
  {
    accessorKey: "counterparty",
    header: "Контрагент",
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Сумма</div>,
    cell: ({ row }) => {
      const { amount, currency } = row.original
      const formatted = new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(amount)
      return <div className="text-right">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ getValue }) => {
      const status = getValue<ContractStatus>()
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
        >
          {statusLabels[status]}
        </span>
      )
    },
  },
  {
    accessorKey: "startDate",
    header: "Дата начала",
    cell: ({ getValue }) =>
      new Date(getValue<string>()).toLocaleDateString("ru-RU"),
  },
  {
    accessorKey: "endDate",
    header: "Дата окончания",
    cell: ({ getValue }) =>
      new Date(getValue<string>()).toLocaleDateString("ru-RU"),
  },
]

export const ContractsTable = () => {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: mockContracts,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

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
                    header.column.getCanSort() ? "cursor-pointer select-none" : ""
                  }
                >
                  <div className="flex items-center gap-1">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
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
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
              >
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
  )
}
