import {
  ApiParameter,
  IAPIEndpoint,
} from "@/types/interfaces/apiEndpoints.interface";
import { Users } from "@/types/interfaces/users.interface";
import { convertDate } from "@/Utility/DateConverter";
import { renderUserName } from "@/Utility/NotificationUtils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, EyeOff } from "lucide-react";
export const columns = (
  users: Users[],
  viewParameters: ApiParameter[],
  setViewParameters: React.Dispatch<ApiParameter[]>,
  clickedRowId: string,
  setClickedRowId: React.Dispatch<React.SetStateAction<string>>,
): ColumnDef<IAPIEndpoint>[] => [
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
    accessorKey: "api_endpoint_id",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as number;
      const b = rowB.getValue(columnId) as number;

      return a - b;
    },
    header: ({ column }) => {
      return (
        <div
          className="min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          API Endpoint Id
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => (
      <div className="capitalize min-w-max">
        {row.getValue("api_endpoint_id")}
      </div>
    ),
  },
  {
    accessorKey: "api_endpoint",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as string;
      const b = rowB.getValue(columnId) as string;

      return a.localeCompare(b, undefined, { sensitivity: "base" });
    },
    // header: "Username",
    header: ({ column }) => {
      return (
        <div
          className="min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Endpoint Name
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => (
      <div className="min-w-max">{row.getValue("api_endpoint")}</div>
    ),
  },
  {
    accessorKey: "parameters",
    enableResizing: true,
    header: () => {
      return <div className="min-w-max">Parameters</div>;
    },

    cell: ({ row }) => {
      const length = Object.keys(row.getValue("parameters") ?? {}).length === 0;

      return (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={length}
            className="disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => {
              setViewParameters(row.original.parameters);
              setClickedRowId(row.id);
            }}
          >
            {viewParameters && clickedRowId === row.id ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      );
    },

    // cell: ({ row }) => {
    //   const payload = row.getValue("payload") as any;
    //   const data = payload?.data;

    //   if (!data) return null;

    //   return (
    //     <pre className="min-w-max text-xs whitespace-pre-wrap">
    //       {JSON.stringify(data.result, null, 2)}
    //     </pre>
    //   );
    // },
  },
  {
    accessorKey: "method",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as string;
      const b = rowB.getValue(columnId) as string;

      return a.localeCompare(b, undefined, { sensitivity: "base" });
    },
    header: ({ column }) => {
      return (
        <div
          className="min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Method
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => (
      <div className="capitalize min-w-max">{row.getValue("method")}</div>
    ),
  },
  {
    accessorKey: "privilege_id",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as number;
      const b = rowB.getValue(columnId) as number;

      return a - b;
    },
    header: ({ column }) => {
      return (
        <div
          className="min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Privilege Id
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => (
      <div className="capitalize min-w-max">{row.getValue("privilege_id")}</div>
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
          className="min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created By
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => (
      <div className="capitalize min-w-max">
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
          className="min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Creation Date
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => (
      <div className="capitalize min-w-max">
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
          className="min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Updated By
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => (
      <div className="capitalize min-w-max">
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
          className="min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Update Date
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => (
      <div className="capitalize min-w-max">
        {convertDate(row.getValue("last_update_date"))}
      </div>
    ),
  },
];
export default columns;
