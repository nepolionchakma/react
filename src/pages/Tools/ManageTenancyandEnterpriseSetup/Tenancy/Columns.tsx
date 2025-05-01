import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ITenantsTypes } from "@/types/interfaces/users.interface";
import { ArrowUpDown } from "lucide-react";

export const columns: ColumnDef<ITenantsTypes>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "tenant_id",
    // header: "Tenant Id",
    header: ({ column }) => {
      return (
        <div
          className="flex items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tenant Id
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("tenant_id")}</div>
    ),
  },
  {
    accessorKey: "tenant_name",
    header: "Tenant Name",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("tenant_name")}</div>
    ),
  },
];
export default columns;
