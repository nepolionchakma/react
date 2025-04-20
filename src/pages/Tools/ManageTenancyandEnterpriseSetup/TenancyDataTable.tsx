import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for tenancy
const tenancyData = [
  { id: "ten-001", name: "UNDP" },
  { id: "ten-002", name: "PBL" },
  { id: "ten-003", name: "Initech Solutions" },
  { id: "ten-004", name: "Umbrella Corporation" },
  { id: "ten-005", name: "Stark Enterprises" },
]

// Column definitions for tenancy
const tenancyColumns = [
  {
    accessorKey: "id",
    header: "Tenancy ID",
  },
  {
    accessorKey: "name",
    header: "Tenancy Name",
  },
]

export default function TenancyDataTable() {
  const table = useReactTable({
    data: tenancyData,
    columns: tenancyColumns,
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
            <TableCell colSpan={tenancyColumns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
