import { ColumnDef } from "@tanstack/react-table";
import { ITenantsTypes } from "@/types/interfaces/users.interface";
import { ArrowUpDown } from "lucide-react";

export const columns: ColumnDef<ITenantsTypes>[] = [
  {
    id: "select",
    size: 24,
    minSize: 24,
    maxSize: 24,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
  },
  {
    accessorKey: "tenant_id",
    enableResizing: true,
    // header: "Tenant Id",
    header: "Tenant Id",
    cell: ({ row }) => (
      <div className="capitalize min-w-max">{row.getValue("tenant_id")}</div>
    ),
  },
  {
    accessorKey: "tenant_name",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as string;
      const b = rowB.getValue(columnId) as string;

      return a.localeCompare(b, undefined, { sensitivity: "base" });
    },
    header: ({ column }) => {
      return (
        <div
          className="flex items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tenant Name
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize min-w-max">{row.getValue("tenant_name")}</div>
    ),
  },
];
export default columns;
