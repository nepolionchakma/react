import { IARMAsynchronousTasksTypes } from "@/types/interfaces/ARM.interface";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
export const columns: ColumnDef<IARMAsynchronousTasksTypes>[] = [
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
    accessorKey: "user_task_name",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as string;
      const b = rowB.getValue(columnId) as string;

      return a.localeCompare(b, undefined, { sensitivity: "base" });
    },
    header: ({ column }) => {
      return (
        <div
          className="min-w-[15rem]"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User Task Name{" "}
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize m-1">{row.getValue("user_task_name")}</div>
    ),
  },
  {
    accessorKey: "task_name",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as string;
      const b = rowB.getValue(columnId) as string;

      return a.localeCompare(b, undefined, { sensitivity: "base" });
    },
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="min-w-max cursor-pointer"
        >
          Task Name
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="min-w-max">{row.getValue("task_name")}</div>
    ),
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
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="min-w-max cursor-pointer"
        >
          Execution Method
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="min-w-[8rem]">{row.getValue("execution_method")}</div>
    ),
  },
  {
    accessorKey: "internal_execution_method",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as string;
      const b = rowB.getValue(columnId) as string;

      return a.localeCompare(b, undefined, { sensitivity: "base" });
    },
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="min-w-max cursor-pointer"
        >
          Internal Execution Method
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="min-w-[12rem]">
        {row.getValue("internal_execution_method")}
      </div>
    ),
  },
  {
    accessorKey: "script_name",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as string;
      const b = rowB.getValue(columnId) as string;

      return a.localeCompare(b, undefined, { sensitivity: "base" });
    },
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="min-w-max cursor-pointer"
        >
          Script Name
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="min-w-[15rem]">{row.getValue("script_name")}</div>
    ),
  },
  {
    accessorKey: "description",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as string;
      const b = rowB.getValue(columnId) as string;

      return a.localeCompare(b, undefined, { sensitivity: "base" });
    },
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="min-w-max cursor-pointer"
        >
          Description
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="min-w-[25rem]">{row.getValue("description")}</div>
    ),
  },
  {
    accessorKey: "srs",
    enableResizing: true,
    header: "SRS",
    cell: ({ row }) => {
      const data: string = row.getValue("srs");
      return (
        <div className="flex justify-center">
          <input
            type="checkbox"
            name=""
            id=""
            checked={data === "Y"}
            className="cursor-not-allowed"
            readOnly
          />
        </div>
      );
    },
  },
  {
    accessorKey: "sf",
    enableResizing: true,
    header: "SF",
    cell: ({ row }) => {
      const data: string = row.getValue("sf");
      return (
        <div className="flex justify-center">
          <input
            type="checkbox"
            name=""
            id=""
            checked={data === "Y"}
            className="cursor-not-allowed"
            readOnly
          />
        </div>
      );
    },
  },
  {
    accessorKey: "created_by",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as string;
      const b = rowB.getValue(columnId) as string;

      return a.localeCompare(b, undefined, { sensitivity: "base" });
    },
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="min-w-max cursor-pointer"
        >
          Created By
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="min-w-[5rem]">{row.getValue("created_by")}</div>
    ),
  },
  {
    accessorKey: "last_updated_by",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as string;
      const b = rowB.getValue(columnId) as string;

      return a.localeCompare(b, undefined, { sensitivity: "base" });
    },
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="min-w-max cursor-pointer"
        >
          Last Updated By
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => {
      const data: string = row.getValue("last_updated_by");
      return <div className="min-w-[8rem]">{data ? data : "null"}</div>;
    },
  },
  {
    accessorKey: "creation_date",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = new Date(rowA.getValue(columnId));
      const b = new Date(rowB.getValue(columnId));
      return a.getTime() - b.getTime();
    },
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="min-w-max cursor-pointer"
        >
          Creation Date
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => {
      const data: Date = row.getValue("creation_date");
      const date = new Date(data);
      const formattedDate = date.toLocaleString("en-US");
      return <div className="min-w-max">{formattedDate} </div>;
    },
  },
  {
    accessorKey: "last_update_date",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as string;
      const b = rowB.getValue(columnId) as string;

      return a.localeCompare(b, undefined, { sensitivity: "base" });
    },
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="min-w-max cursor-pointer"
        >
          Last Updated Date
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => {
      const data: Date = row.getValue("last_update_date");
      const date = new Date(data);
      const formattedDate = date.toLocaleString("en-US");
      return <div className=" min-w-max">{formattedDate} </div>;
    },
  },
  {
    accessorKey: "cancelled_yn",
    enableResizing: true,
    header: "Cancelled",
    cell: ({ row }) => {
      const data: string = row.getValue("cancelled_yn");
      return (
        <div className="flex justify-center">
          <input
            type="checkbox"
            name=""
            id=""
            checked={data === "Y"}
            className="cursor-not-allowed"
            readOnly
          />
        </div>
      );
    },
  },
];
export default columns;
