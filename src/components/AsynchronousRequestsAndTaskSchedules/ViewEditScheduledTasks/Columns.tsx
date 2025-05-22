import { IAsynchronousRequestsAndTaskSchedulesTypes } from "@/types/interfaces/ARM.interface";
import { Checkbox } from "@radix-ui/react-checkbox";
import { ColumnDef } from "@tanstack/react-table";
import {
  CircleChevronDown,
  CircleChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
export const columns = (
  expandedRow: string | null,
  setExpandedRow: (row: string | null) => void,
  viewParameters: string,
  setViewParameters: (row: string) => void,
  clickedRowId: string,
  setClickedRowId: (row: string) => void
): ColumnDef<IAsynchronousRequestsAndTaskSchedulesTypes>[] => [
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
    accessorKey: "user_task_name",
    header: () => {
      return <div className="min-w-max">User Task Name</div>;
    },
    cell: ({ row }) => {
      return <div className="w-[20rem]">{row.getValue("user_task_name")}</div>;
    },
  },
  {
    accessorKey: "task_name",
    header: () => {
      return <div className="min-w-max">Task Name</div>;
    },
    cell: ({ row }) => (
      <div className="min-w-max">{row.getValue("task_name")}</div>
    ),
  },
  {
    accessorKey: "user_schedule_name",
    header: () => {
      return <div className="min-w-max">User Schedule Name</div>;
    },
    cell: ({ row }) => {
      const isExpanded = expandedRow === row.id;
      const user_schedule_name: string = row.getValue("user_schedule_name");
      return (
        <div className="flex items-center gap-2 w-[25rem]">
          <button onClick={() => setExpandedRow(isExpanded ? null : row.id)}>
            {isExpanded ? (
              <CircleChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <CircleChevronRight className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <span className="capitalize">{user_schedule_name.toLowerCase()}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "redbeat_schedule_name",
    header: () => {
      return <div className="min-w-max">Redbeat Schedule Name</div>;
    },
    cell: ({ row }) => {
      const data: string = row.getValue("redbeat_schedule_name");
      return (
        <div className="break-all w-[20rem]">
          {data === null ? "null" : data}
        </div>
      );
    },
  },
  {
    accessorKey: "kwargs",
    header: () => {
      return <div className="min-w-max">kwargs</div>;
    },
    cell: ({ row }) => {
      const data: string = JSON.stringify(row.getValue("kwargs"));
      return <div className="min-w-max">{data}</div>;
    },
  },
  {
    accessorKey: "parameters",
    header: () => {
      return <div className="min-w-max text-center">Parameters</div>;
    },
    cell: ({ row }) => {
      const length = Object.keys(row.getValue("parameters")).length === 0;
      return (
        <div className="flex items-center justify-center gap-2 ">
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
  },
  {
    accessorKey: "schedule_type",
    header: () => {
      return <div className="min-w-max">Schedule Type</div>;
    },
    cell: ({ row }) => {
      const data: string = row.getValue("schedule_type");
      return (
        <div className="capitalize">
          {data === "" ? "null" : data.toLowerCase()}
        </div>
      );
    },
  },
  {
    accessorKey: "schedule",
    header: () => {
      return <div className="min-w-max">Schedule</div>;
    },
    cell: ({ row }) => {
      const data = row.getValue("schedule");
      return <div className="min-w-max">{JSON.stringify(data)}</div>;
    },
  },
  {
    accessorKey: "args",
    header: () => {
      return <div className="min-w-max">Args</div>;
    },
    cell: ({ row }) => {
      const args: Array<string> = row.getValue("args");
      return <div className="break-all w-[30rem]">{JSON.stringify(args)}</div>;
    },
  },
  {
    accessorKey: "created_by",
    header: () => {
      return <div className="min-w-max">Created By</div>;
    },
    cell: ({ row }) => <div className="">{row.getValue("created_by")}</div>,
  },
  {
    accessorKey: "creation_date",
    header: () => {
      return <div className="min-w-max">Creation Date</div>;
    },
    cell: ({ row }) => {
      const data: string = row.getValue("creation_date");
      return <div className="min-w-max">{data?.slice(0, 16)} </div>;
    },
  },
  {
    accessorKey: "last_updated_by",
    header: () => {
      return <div className="min-w-max">Last Updated By</div>;
    },
    cell: ({ row }) => {
      const data: string = row.getValue("last_updated_by");
      return <div>{data === null ? "null" : data}</div>;
    },
  },
  {
    accessorKey: "last_update_date",
    header: () => {
      return <div className="min-w-max">Last Updated Date</div>;
    },
    cell: ({ row }) => {
      const data: string = row.getValue("last_update_date");
      return <div className=" min-w-max">{data?.slice(0, 16)} </div>;
    },
  },
  {
    accessorKey: "ready_for_redbeat",
    header: () => {
      return <div className="min-w-max">Ready for Redbeat</div>;
    },
    cell: ({ row }) => {
      const data: string = row.getValue("ready_for_redbeat");
      return <div className=" min-w-max">{data} </div>;
    },
  },
  {
    accessorKey: "cancelled_yn",
    header: () => {
      return <div className="min-w-max text-center">Cancelled</div>;
    },
    cell: ({ row }) => {
      const data: string = row.getValue("cancelled_yn");
      return (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
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
