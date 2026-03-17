import { ContractsTable } from "./contracts-table"

export const ServicePage = () => {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-semibold">Договоры</h1>
      <ContractsTable />
    </div>
  )
}
