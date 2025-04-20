import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for enterprise
const enterpriseData = [
  { id: "ten-001", name: "United Nations Development Program", type: "Multinational institute" },
  { id: "ten-002", name: "Pro Better Life Bangladesh", type: "NGO" },
  { id: "ten-003", name: "Initech International", type: "Partnership" },
  { id: "ten-004", name: "Umbrella Holdings", type: "Corporation" },
  { id: "ten-005", name: "Stark Industries", type: "Corporation" },
]

// Column definitions for enterprise
const enterpriseColumns = [
  {
    accessorKey: "name",
    header: "Enterprise Name",
  },
  {
    accessorKey: "type",
    header: "Enterprise Type",
  },
]

export default function EnterpriseDataTable() {
  const table = useReactTable({
    data: enterpriseData,
    columns: enterpriseColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} className="border h-9 py-0 px-1 border-slate-400 bg-slate-200">
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="border p-1 w-1/2">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={enterpriseColumns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
