import { IApplicationType } from "@/types/interfaces/datasource.interface";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

const columns: ColumnDef<IApplicationType>[] = [
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
    accessorKey: "application_type",
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
          Application Type{" "}
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize w-[15rem]">
        {row.getValue("application_type")}
      </div>
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
          className="w-[30rem] cursor-pointer"
        >
          Description
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize w-[30rem]">{row.getValue("description")}</div>
    ),
  },
  {
    accessorKey: "versions",
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
          Versions
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => {
      const versions = row.getValue("versions") as string[];

      return (
        <div className="flex flex-wrap gap-1">
          {versions.map((v, i) => (
            <span key={i} className="rounded bg-muted px-2 py-0.5 text-xs">
              {v}
            </span>
          ))}
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
      <div className="capitalize  min-w-max">{row.getValue("created_by")}</div>
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
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => {
      const data: Date = row.getValue("creation_date");
      const date = new Date(data);
      const formattedDate = date.toLocaleString("en-US");
      return <div className="capitalize min-w-max">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "last_updated_by",
    enableResizing: true,
    header: () => <div className="min-w-max">Last Updated By</div>,
    cell: ({ row }) => {
      const data: Date = row.getValue("last_updated_by");
      const date = new Date(data);
      const formattedDate = date.toLocaleString("en-US");
      return <div className="capitalize min-w-max">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "last_update_date",
    enableResizing: true,
    header: () => <div className="min-w-max">Last Update Date</div>,
    cell: ({ row }) => {
      const data: Date = row.getValue("last_update_date");
      const date = new Date(data);
      const formattedDate = date.toLocaleString("en-US");
      return <div className="capitalize min-w-max">{formattedDate}</div>;
    },
  },
];
export default columns;
