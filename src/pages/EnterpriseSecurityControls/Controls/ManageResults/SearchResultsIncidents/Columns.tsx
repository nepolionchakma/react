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
          className="flex items-center w-[15rem]"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Control Name
          <ArrowUpDown className="ml-2 h-4 w-4 hover:text-slate-800 cursor-pointer" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize w-[15rem]">{row.getValue("control_name")}</div>
    ),
  },
  {
    accessorKey: "description",
    header: () => <div className="w-[25rem]">Description</div>,
    cell: ({ row }) => (
      <div className="capitalize w-[20rem]">{row.getValue("description")}</div>
    ),
  },
  {
    accessorKey: "pending_results_count",
    header: () => <div className="min-w-max">Pending Results Count</div>,
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("pending_results_count")}</div>
    ),
  },
  {
    accessorKey: "control_type",
    header: () => <div className="min-w-max">Control Type</div>,
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
    header: () => <div className="w-[15rem]">Datasources</div>,
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("datasources")}</div>
    ),
  },
  {
    accessorKey: "control_last_run",
    header: () => <div className="min-w-max">Control Last Run</div>,
    cell: ({ row }) => (
      <div className="capitalize min-w-max">
        {row.getValue("control_last_run")}
      </div>
    ),
  },
  {
    accessorKey: "control_last_updated",
    header: () => <div className="min-w-max">Control Last Updated</div>,
    cell: ({ row }) => (
      <div className="capitalize min-w-max">
        {row.getValue("control_last_updated")}
      </div>
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
    header: () => <div className="min-w-max">Result Investigator</div>,
    cell: ({ row }) => (
      <div className="capitalize min-w-max">
        {row.getValue("control_last_updated")}
      </div>
    ),
  },
  {
    accessorKey: "authorized_data",
    header: () => <div className="min-w-max">Authorized Data</div>,
    cell: ({ row }) => (
      <div className="capitalize min-w-max">
        {row.getValue("control_last_updated")}
      </div>
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
    header: () => <div className="min-w-max">Revision Date</div>,
    cell: ({ row }) => (
      <div className="capitalize min-w-max">
        {row.getValue("control_last_updated")}
      </div>
    ),
  },
  {
    accessorKey: "created_date",
    header: () => <div className="min-w-max">Created Date</div>,
    cell: ({ row }) => (
      <div className="capitalize min-w-max">
        {row.getValue("control_last_updated")}
      </div>
    ),
  },
  {
    accessorKey: "created_by",
    header: () => <div className="min-w-max">Created By</div>,
    cell: ({ row }) => (
      <div className="capitalize  min-w-max">
        {row.getValue("control_last_updated")}
      </div>
    ),
  },
];
export default columns;
