import { ITenantsAndEnterprisesTypes } from "@/types/interfaces/users.interface";
import { Checkbox } from "@radix-ui/react-checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
const columns: ColumnDef<ITenantsAndEnterprisesTypes>[] = [
  {
    id: "select",

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
    accessorKey: "enterprise_name",
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 flex gap-1 min-w-max items-center cursor-pointer"
        >
          Enterprise Name
          <ArrowUpDown className=" h-4 w-4" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize px-1">{row.getValue("enterprise_name")}</div>
    ),
  },
  {
    accessorKey: "enterprise_type",
    header: "Enterprise Type",
    cell: ({ row }) => (
      <div className="capitalize w-[15rem] px-1">
        {row.getValue("enterprise_type")}
      </div>
    ),
  },
  {
    accessorKey: "tenant_name",
    header: "Tenant Name",
    cell: ({ row }) => (
      <div className="capitalize w-[15rem] px-1">
        {row.getValue("tenant_name")}
      </div>
    ),
  },
];
export default columns;
