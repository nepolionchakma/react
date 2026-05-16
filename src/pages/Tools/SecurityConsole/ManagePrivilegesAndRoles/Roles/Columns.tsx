import { IRole, Users } from "@/types/interfaces/users.interface";
import { convertDate } from "@/Utility/DateConverter";
import { renderUserName } from "@/Utility/NotificationUtils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export const getColumns = (users: Users[]): ColumnDef<IRole>[] => [
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
    accessorKey: "role_id",
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
          Role Id
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => (
      <div className="flex justify-center min-w-max py-1">
        {row.getValue("role_id")}
      </div>
    ),
  },
  {
    accessorKey: "role_name",
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
          Role Name
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => (
      <div className={`flex justify-center min-w-max`}>
        {row.getValue("role_name")}
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
];
