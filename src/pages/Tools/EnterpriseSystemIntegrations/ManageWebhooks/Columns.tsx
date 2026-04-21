import { Users } from "@/types/interfaces/users.interface";
import { IWebhook } from "@/types/interfaces/webhook.interface";
import { convertDate } from "@/Utility/DateConverter";
import { renderUserName } from "@/Utility/NotificationUtils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
export const getColumns = (users: Users[]): ColumnDef<IWebhook>[] => [
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
    accessorKey: "webhook_name",
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
          Weebhook Name
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => (
      <div className="min-w-max">{row.getValue("webhook_name")}</div>
    ),
  },
  {
    accessorKey: "webhook_url",
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
          Weebhook URL
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => (
      <div className="min-w-max">{row.getValue("webhook_url")}</div>
    ),
  },
  {
    accessorKey: "table_name",
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
          Table Name
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => (
      <div className="min-w-max">{row.getValue("table_name")}</div>
    ),
  },
  {
    accessorKey: "http_methods",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const methodA = rowA.getValue(columnId) as string[];
      const methodB = rowB.getValue(columnId) as string[];

      const a = methodA[0] || "";
      const b = methodB[0] || "";

      return a.localeCompare(b, undefined, { sensitivity: "base" });
    },
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="min-w-max cursor-pointer"
        >
          Methods
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => {
      // const isExpanded = expandPrevilege === row.id;
      const methods: string[] = row.getValue("http_methods");
      return (
        <div className="flex items-center gap-2 min-w-max">
          <div className="capitalize min-w-max">
            <span>{methods.map((m) => m).join(", ")}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "is_active",
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
          Is Active
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => (
      <div className="min-w-max">{row.getValue("is_active")}</div>
    ),
  },
  {
    accessorKey: "failure_count",
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
          Failure Count
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => (
      <div className="capitalize min-w-max">
        {row.getValue("failure_count")}
      </div>
    ),
  },
  {
    accessorKey: "max_retries",
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
          Max Retries
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => (
      <div className="capitalize min-w-max">{row.getValue("max_retries")}</div>
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
