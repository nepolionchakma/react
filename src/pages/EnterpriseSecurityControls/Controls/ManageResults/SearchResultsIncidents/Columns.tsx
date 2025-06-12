import { IControlsTypes } from "@/types/interfaces/manageControls.interface";
import { Checkbox } from "@radix-ui/react-checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

const columns: ColumnDef<IControlsTypes>[] = [
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
    accessorKey: "control_name",
    header: ({ column }) => {
      return (
        <div
          className="flex items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Control Name
          <ArrowUpDown className="ml-2 h-4 w-4 hover:text-slate-800 cursor-pointer" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("control_name")}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("description")}</div>
    ),
  },
  {
    accessorKey: "pending_results_count",
    header: "Pending Results Count",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("pending_results_count")}</div>
    ),
  },
  {
    accessorKey: "control_type",
    header: "Control Type",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("control_type")}</div>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("priority")}</div>
    ),
  },
  {
    accessorKey: "datasources",
    header: "Datasources",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("datasources")}</div>
    ),
  },
  {
    accessorKey: "control_last_run",
    header: "Control Last Run",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("control_last_run")}</div>
    ),
  },
  {
    accessorKey: "control_last_updated",
    header: "Control Last Updated",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("control_last_updated")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("control_last_updated")}</div>
    ),
  },
  {
    accessorKey: "state",
    header: "State",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("control_last_updated")}</div>
    ),
  },
  {
    accessorKey: "result_investigator",
    header: "Result Investigator",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("control_last_updated")}</div>
    ),
  },
  {
    accessorKey: "authorized_data",
    header: "Authorized Data",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("control_last_updated")}</div>
    ),
  },
  {
    accessorKey: "revision",
    header: "Revision",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("control_last_updated")}</div>
    ),
  },
  {
    accessorKey: "revision_date",
    header: "Revision Date",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("control_last_updated")}</div>
    ),
  },
  {
    accessorKey: "created_date",
    header: "Created Date",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("control_last_updated")}</div>
    ),
  },
  {
    accessorKey: "created_by",
    header: "Created By",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("control_last_updated")}</div>
    ),
  },
];
export default columns;
