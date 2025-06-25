import { IManageAccessModelsTypes } from "@/types/interfaces/ManageAccessEntitlements.interface";
import { Checkbox } from "@radix-ui/react-checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
const columns: ColumnDef<IManageAccessModelsTypes>[] = [
  {
    id: "select",
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 24,
    minSize: 24,
    maxSize: 24,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
  },
  {
    accessorKey: "model_name",
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
          Model Name
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize px-1">{row.getValue("model_name")}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    enableResizing: true,
    cell: ({ row }) => (
      <div className="capitalize min-w-[20rem] px-1">
        {row.getValue("description")}
      </div>
    ),
  },
  {
    accessorKey: "type",
    enableResizing: true,
    header: "Type",
    cell: ({ row }) => (
      <div className="capitalize px-1">{row.getValue("type")}</div>
    ),
  },
  {
    accessorKey: "run_status",
    enableResizing: true,
    header: "Status",
    cell: ({ row }) => (
      <div className="px-1 capitalize">{row.getValue("run_status")}</div>
    ),
  },
  {
    accessorKey: "last_run_date",
    enableResizing: true,
    header: "Last Run Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("last_run_date")).toLocaleString();
      return <div className="capitalize px-1">{date}</div>;
    },
  },
  {
    accessorKey: "created_by",
    enableResizing: true,
    header: " Created By",
    cell: ({ row }) => (
      <div className="capitalize px-1">{row.getValue("created_by")}</div>
    ),
  },
  {
    accessorKey: "last_updated_by",
    enableResizing: true,
    header: "Last Updated By",
    cell: ({ row }) => (
      <div className="capitalize px-1">{row.getValue("last_updated_by")}</div>
    ),
  },
  {
    accessorKey: "last_updated_date",
    enableResizing: true,
    header: "Last Updated Date",
    cell: ({ row }) => {
      const data: string = row.getValue("last_updated_date");
      const date = new Date(data).toLocaleString();
      return <div className="capitalize px-1">{date}</div>;
    },
  },
  {
    accessorKey: "revision",
    enableResizing: true,
    header: "Revision",
    cell: ({ row }) => (
      <div className="capitalize px-1">{row.getValue("revision")}</div>
    ),
  },
  {
    accessorKey: "revision_date",
    enableResizing: true,
    header: "Revision Date",
    cell: ({ row }) => {
      const data: string = row.getValue("revision_date");
      const date = new Date(data).toLocaleString();
      return <div className="capitalize px-1">{date}</div>;
    },
  },
];
export default columns;
