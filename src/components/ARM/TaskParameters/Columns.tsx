import { IARMTaskParametersTypes } from "@/types/interfaces/ARM.interface";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
export const columns: ColumnDef<IARMTaskParametersTypes>[] = [
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
    accessorKey: "parameter_name",
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
          Parameter Name
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="min-w-max">{row.getValue("parameter_name")}</div>
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
          className="w-[20rem] cursor-pointer"
        >
          Description
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="w-[20rem] capitalize">{row.getValue("description")}</div>
    ),
  },
  {
    accessorKey: "data_type",
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
          Data Type
          <ArrowUpDown className="ml-2 h-4 min-w-max inline-block" />
        </div>
      );
    },

    cell: ({ row }) => {
      // const value = ;
      const convertString = (value: string) => {
        switch (value.toLowerCase()) {
          case "integer":
            return "Number";
          case "string":
            return "Text";
          case "varchar":
            return "Text";
          case "boolean":
            return "Boolean";
          case "datetime":
            return "Date and Time";
          case "interval":
            return "Interval";
        }
      };

      return (
        <div className=" min-w-max capitalize">
          {convertString(row.getValue("data_type"))}{" "}
        </div>
      );
    },
  },
  {
    accessorKey: "created_by",
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
          Created By
          <ArrowUpDown className="ml-2 h-4 min-w-max inline-block" />
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
          <ArrowUpDown className="ml-2 h-4 min-w-max inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="min-w-[8rem]">{row.getValue("last_updated_by")}</div>
    ),
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
          <ArrowUpDown className="ml-2 h-4 min-w-max inline-block" />
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
          Last Updated Date
          <ArrowUpDown className="ml-2 h-4 min-w-max inline-block" />
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
];
export default columns;
