import { ColumnDef } from "@tanstack/react-table";
import { IJobTitle, ITenantsTypes } from "@/types/interfaces/users.interface";
import { ArrowUpDown } from "lucide-react";
import { renderTenantsNames } from "@/Utility/general";

export const columns = (tenants: ITenantsTypes[]): ColumnDef<IJobTitle>[] => [
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
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as number;
      const b = rowB.getValue(columnId) as number;

      return a - b;
    },
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="min-w-max cursor-pointer"
        >
          Tenant Name
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize min-w-max">
        {renderTenantsNames(row.original.tenant_id, tenants)}
        {/* <span>Id {row.getValue("tenant_id")}</span> */}
      </div>
    ),
  },
  {
    accessorKey: "job_title_name",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as string;
      const b = rowB.getValue(columnId) as string;

      return a.localeCompare(b, undefined, { sensitivity: "base" });
    },
    header: ({ column }) => {
      return (
        <div
          className="flex items-center min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Job Title Name
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize min-w-[60rem]">
        {row.getValue("job_title_name")}
      </div>
    ),
  },
];
export default columns;
