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
    size: 24,
    minSize: 24,
    maxSize: 24,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
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
          Tenancy Name
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize min-w-[10rem]">
        {row.getValue("tenant_name")}
      </div>
    ),
  },
  {
    accessorKey: "enterprise_name",
    enableResizing: true,
    header: "Enterprise Name",
    cell: ({ row }) => (
      <div className="capitalize min-w-[10rem]">
        {row.getValue("enterprise_name")}
      </div>
    ),
  },
  {
    accessorKey: "enterprise_type",
    enableResizing: true,
    header: "Enterprise Type",
    cell: ({ row }) => (
      <div className="capitalize min-w-[10rem]">
        {row.getValue("enterprise_type")}
      </div>
    ),
  },
];
export default columns;
