import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { IEnterprisesTypes } from "@/types/interfaces/users.interface";
import { ArrowUpDown } from "lucide-react";

export const columns: ColumnDef<IEnterprisesTypes>[] = [
  {
    id: "select",
    // header: ({ table }) => (
    //   <Checkbox
    //     checked={
    //       table.getIsAllPageRowsSelected() ||
    //       (table.getIsSomePageRowsSelected() && "indeterminate")
    //     }
    //     onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //     aria-label="Select all"
    //   />
    // ),
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
    accessorKey: "tenant_name",
    header: ({ column }) => {
      return (
        <div
          className="flex items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tenancy Name
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("tenant_name")}</div>
    ),
  },
  {
    accessorKey: "enterprise_name",
    header: ({ column }) => {
      return (
        <div
          className="flex items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Enterprise Name
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("enterprise_name")}</div>
    ),
  },
  {
    accessorKey: "enterprise_type",
    header: "Enterprise Type",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("enterprise_type")}</div>
    ),
  },
];
export default columns;
