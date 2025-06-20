import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
  // ColumnResizeMode,
} from "@tanstack/react-table";
// import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useState } from "react";

// Sample data
type DataType = {
  id: number;
  name: string;
  email: string;
};

const defaultData: DataType[] = [
  { id: 1, name: "John", email: "john@example.com" },
  { id: 2, name: "Alice", email: "alice@example.com" },
];

// Column definitions
const columns: ColumnDef<DataType>[] = [
  {
    accessorKey: "name",
    header: "Name",
    size: 200,
    minSize: 100,
    maxSize: 400,
    enableResizing: true,
  },
  {
    accessorKey: "email",
    header: "Email",
    size: 250,
    minSize: 150,
    maxSize: 500,
    enableResizing: true,
  },
];

const ActionItems = () => {
  const [data] = useState<DataType[]>(defaultData);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange", // or "onEnd"
  });

  return (
    <div className="overflow-auto">
      <Table className="w-full">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="relative border h-9 py-0 px-1 border-slate-400 bg-slate-200"
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}

                  {header.column.getCanResize() && (
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none bg-slate-400 hover:bg-slate-600"
                    />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className="border py-0 px-1"
                  style={{ width: cell.column.getSize() }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
export default ActionItems;
