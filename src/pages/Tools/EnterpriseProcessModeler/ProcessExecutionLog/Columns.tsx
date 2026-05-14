import {
  IOrchestrationDataTypes,
  IProcessExecution,
} from "@/types/interfaces/orchestration.interface";
import { Users } from "@/types/interfaces/users.interface";
import { convertDate } from "@/Utility/DateConverter";
import { processName } from "@/Utility/general";
import { renderUserName } from "@/Utility/NotificationUtils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, View } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NavigateFunction } from "react-router-dom";

export const getColumns = (
  workflows: IOrchestrationDataTypes[],
  users: Users[],
  navigate: NavigateFunction,
): ColumnDef<IProcessExecution>[] => [
  {
    accessorKey: "def_process_execution_id",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as number;
      const b = rowB.getValue(columnId) as number;

      return a - b;
    },
    header: ({ column }) => {
      return (
        <div
          className="flex justify-center min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Execution Id
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => (
      <div className="flex justify-center min-w-max py-1">
        {row.getValue("def_process_execution_id")}
      </div>
    ),
  },
  {
    accessorKey: "process_id",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = processName(rowA.getValue(columnId), workflows) as string;
      const b = processName(rowB.getValue(columnId), workflows) as string;

      return a.localeCompare(b, undefined, { sensitivity: "base" });
    },
    header: ({ column }) => {
      return (
        <div
          className="flex justify-center min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Workflow Name
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => (
      <div className="flex justify-center min-w-max">
        {processName(row.getValue("process_id"), workflows)}
      </div>
    ),
  },
  {
    accessorKey: "execution_status",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as string;
      const b = rowB.getValue(columnId) as string;

      return a.localeCompare(b, undefined, { sensitivity: "base" });
    },
    header: ({ column }) => {
      return (
        <div
          className="flex justify-center min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => (
      <div className={`flex justify-center min-w-max`}>
        {row.getValue("execution_status")}
      </div>
    ),
  },

  {
    accessorKey: "error_message",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as string;
      const b = rowB.getValue(columnId) as string;

      return a.localeCompare(b, undefined, { sensitivity: "base" });
    },
    header: ({ column }) => {
      return (
        <div
          className="flex justify-center min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Error Message
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => (
      <div className="flex justify-center min-w-max">
        {row.getValue("error_message")}
      </div>
    ),
  },

  {
    accessorKey: "execution_start_date",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as Date;
      const b = rowB.getValue(columnId) as Date;

      return a.getTime() - b.getTime();
    },
    // header: "Username",
    header: ({ column }) => {
      return (
        <div
          className="flex justify-center min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Start Date
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => (
      <div className="capitalize flex justify-center min-w-max">
        {convertDate(row.getValue("execution_start_date"))}
      </div>
    ),
  },
  {
    accessorKey: "execution_end_date",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as Date;
      const b = rowB.getValue(columnId) as Date;

      return a.getTime() - b.getTime();
    },
    // header: "Username",
    header: ({ column }) => {
      return (
        <div
          className="flex justify-center min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          End Date
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => (
      <div className="capitalize flex justify-center min-w-max">
        {convertDate(row.getValue("execution_end_date"))}
      </div>
    ),
  },
  {
    accessorKey: "created_by",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = renderUserName(rowA.getValue(columnId), users) as string;
      const b = renderUserName(rowB.getValue(columnId), users) as string;

      return a.localeCompare(b, undefined, { sensitivity: "base" });
    },
    header: ({ column }) => {
      return (
        <div
          className="flex justify-center min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created By
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => (
      <div className="capitalize flex justify-center min-w-max">
        {renderUserName(row.getValue("created_by"), users)}
      </div>
    ),
  },
  {
    accessorKey: "creation_date",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as Date;
      const b = rowB.getValue(columnId) as Date;

      return a.getTime() - b.getTime();
    },
    // header: "Username",
    header: ({ column }) => {
      return (
        <div
          className="flex justify-center min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Creation Date
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => (
      <div className="capitalize flex justify-center min-w-max">
        {convertDate(row.getValue("creation_date"))}
      </div>
    ),
  },
  {
    accessorKey: "last_updated_by",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = renderUserName(rowA.getValue(columnId), users) as string;
      const b = renderUserName(rowB.getValue(columnId), users) as string;

      return a.localeCompare(b, undefined, { sensitivity: "base" });
    },
    header: ({ column }) => {
      return (
        <div
          className="flex justify-center min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Updated By
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => (
      <div className="capitalize flex justify-center min-w-max">
        {renderUserName(row.getValue("last_updated_by"), users)}
      </div>
    ),
  },
  {
    accessorKey: "last_update_date",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as Date;
      const b = rowB.getValue(columnId) as Date;

      return a.getTime() - b.getTime();
    },
    // header: "Username",
    header: ({ column }) => {
      return (
        <div
          className="flex justify-center min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Update Date
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => (
      <div className="capitalize flex justify-center min-w-max">
        {convertDate(row.getValue("last_update_date"))}
      </div>
    ),
  },
  {
    accessorKey: "action",
    enableResizing: false,

    header: () => {
      return <div className="flex justify-center min-w-max">Action</div>;
    },

    cell: ({ row }) => (
      <div className="flex justify-center min-w-max">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="relative">
                <View
                  onClick={() =>
                    navigate(
                      `/tools/enterprise-process-modeler/workflow-execution-log/${row.getValue("def_process_execution_id")}`,
                    )
                  }
                  className="cursor-pointer"
                />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>View</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    ),
  },
];
