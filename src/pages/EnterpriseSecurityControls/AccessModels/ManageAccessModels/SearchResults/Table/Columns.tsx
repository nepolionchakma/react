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
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "model_name",
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 flex gap-1 min-w-max items-center cursor-pointer"
        >
          Model Name
          <ArrowUpDown className=" h-4 w-4" />
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
    cell: ({ row }) => (
      <div className="capitalize w-[15rem] px-1">
        {row.getValue("description")}
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <div className="capitalize px-1">{row.getValue("type")}</div>
    ),
  },
  {
    accessorKey: "run_status",
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 flex min-w-max items-center cursor-pointer"
        >
          Status
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="p-1 capitalize">{row.getValue("run_status")}</div>
    ),
  },
  {
    accessorKey: "last_run_date",
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 flex min-w-max items-center cursor-pointer"
        >
          Last Run Date
        </div>
      );
    },
    cell: ({ row }) => {
      const data: string = row.getValue("last_run_date");
      const date = new Date(data).toLocaleString("en-US");
      console.log(date, "dfdsfsd", data);
      return <div className="capitalize px-1">{date}</div>;
    },
  },
  {
    accessorKey: "created_by",
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 flex min-w-max items-center cursor-pointer"
        >
          Created By
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize px-1">{row.getValue("created_by")}</div>
    ),
  },
  {
    accessorKey: "last_updated_by",
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 flex min-w-max items-center cursor-pointer"
        >
          Last Updated By
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize px-1">{row.getValue("last_updated_by")}</div>
    ),
  },
  {
    accessorKey: "last_updated_date",
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 flex min-w-max items-center cursor-pointer"
        >
          Last Updated Date
        </div>
      );
    },
    cell: ({ row }) => {
      const data: string = row.getValue("last_updated_date");
      const date = new Date(data).toLocaleString();
      return <div className="capitalize px-1">{date}</div>;
    },
  },
  {
    accessorKey: "revision",
    header: "Revision",
    cell: ({ row }) => (
      <div className="capitalize px-1">{row.getValue("revision")}</div>
    ),
  },
  {
    accessorKey: "revision_date",
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 flex min-w-max items-center cursor-pointer"
        >
          Revision Date
        </div>
      );
    },
    cell: ({ row }) => {
      const data: string = row.getValue("revision_date");
      const date = new Date(data).toLocaleString();
      return <div className="capitalize px-1">{date}</div>;
    },
  },
];
export default columns;
