import { IExecutionMethodsTypes } from "@/types/interfaces/ARM.interface";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
export const columns: ColumnDef<IExecutionMethodsTypes>[] = [
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
    accessorKey: "execution_method",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as string;
      const b = rowB.getValue(columnId) as string;

      return a.localeCompare(b, undefined, { sensitivity: "base" });
    },
    header: ({ column }) => {
      return (
        <div
          className="min-w-max my-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Execution Method{" "}
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="min-w-max">{row.getValue("execution_method")}</div>
    ),
  },
  {
    accessorKey: "internal_execution_method",
    enableResizing: true,
    header: () => <div className="min-w-max">Internal Execution Method</div>,
    cell: ({ row }) => (
      <div className="min-w-max my-1">
        {row.getValue("internal_execution_method")}
      </div>
    ),
  },
  {
    accessorKey: "executor",
    enableResizing: true,
    header: "Executor",
    cell: ({ row }) => (
      <div className="min-w-max">{row.getValue("executor")}</div>
    ),
  },
  {
    accessorKey: "description",
    enableResizing: true,
    header: "Description",
    cell: ({ row }) => (
      <div className="min-w-[28rem]">{row.getValue("description")}</div>
    ),
  },
];
export default columns;
