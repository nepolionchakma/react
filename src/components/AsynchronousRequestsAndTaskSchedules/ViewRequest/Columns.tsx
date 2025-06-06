import { IARMViewRequestsTypes } from "@/types/interfaces/ARM.interface";
// import { Checkbox } from "@radix-ui/react-checkbox";
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
  viewResult: string,
  setViewResult: (row: string) => void,
  clickedRowId: string,
  setClickedRowId: (row: string) => void
): ColumnDef<IARMViewRequestsTypes>[] => [
  // {
  //   id: "select",
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "request_id",
    header: () => {
      return <div className="min-w-max">Request Id</div>;
    },
    cell: ({ row }) => <div className="">{row.getValue("request_id")}</div>,
  },
  {
    accessorKey: "task_id",
    header: () => {
      return <div className="w-[20rem]">Task Id</div>;
    },
    cell: ({ row }) => (
      <div className="w-[20rem]">{row.getValue("task_id")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: () => {
      return <div>Status</div>;
    },
    cell: ({ row }) => {
      const data: string = row.getValue("status");
      return <div className="min-w-max capitalize">{data?.toLowerCase()}</div>;
    },
  },
  {
    accessorKey: "user_task_name",
    header: () => {
      return <div className="min-w-max">User Task Name</div>;
    },
    cell: ({ row }) => (
      <div className="w-[20rem]">{row.getValue("user_task_name")}</div>
    ),
  },
  {
    accessorKey: "task_name",
    header: () => {
      return <div className="min-w-max">Task Name</div>;
    },
    cell: ({ row }) => (
      <div className="w-[10rem]">{row.getValue("task_name")}</div>
    ),
  },
  {
    accessorKey: "executor",
    header: () => {
      return <div className="min-w-max">Executor</div>;
    },
    cell: ({ row }) => (
      <div className="min-w-max">{row.getValue("executor")}</div>
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
          <button
            disabled={
              !user_schedule_name || user_schedule_name === "" ? true : false
            }
            className="disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setExpandedRow(isExpanded ? null : row.id)}
          >
            {isExpanded ? (
              <CircleChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <CircleChevronRight className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <span className="capitalize">
            {user_schedule_name?.toLowerCase()}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "redbeat_schedule_name",
    header: () => {
      return <div className="w-[20rem]">Redbeat Schedule Name</div>;
    },
    cell: ({ row }) => (
      <div className="w-[20rem]">{row.getValue("redbeat_schedule_name")}</div>
    ),
  },
  // {
  //   accessorKey: "schedule",
  //   header: () => {
  //     return <div className="min-w-max">Schedule</div>;
  //   },
  //   cell: ({ row }) => {
  //     return (
  //       <div className="min-w-max">
  //         {JSON.stringify(row.getValue("schedule"))}
  //       </div>
  //     );
  //   },
  // },
  // {
  //   accessorKey: "schedule_type",
  //   header: () => {
  //     return <div className="min-w-max">Schedule Type</div>;
  //   },
  //   cell: ({ row }) => {
  //     const schedule_type = row.getValue("schedule_type");
  //     const result =
  //       schedule_type === null ? "null" : JSON.parse(schedule_type as string);
  //     return (
  //       <div className="min-w-max capitalize">{result?.toLowerCase()}</div>
  //     );
  //   },
  // },
  {
    accessorKey: "args",
    header: () => {
      return <div className="w-[30rem]">Args</div>;
    },

    cell: ({ row }) => {
      return (
        <div className="w-[30rem]">{JSON.stringify(row.getValue("args"))}</div>
      );
    },
  },
  {
    accessorKey: "kwargs",
    header: () => {
      return <div className="min-w-max">Kwargs</div>;
    },
    cell: ({ row }) => {
      return (
        <div className="min-w-max">
          {JSON.stringify(row.getValue("kwargs"))}
        </div>
      );
    },
  },
  {
    accessorKey: "parameters",
    header: () => {
      return <div className="min-w-max text-center">Parameters</div>;
    },
    cell: ({ row }) => {
      const length = Object.keys(row.getValue("parameters") ?? {}).length === 0;
      return (
        <div className="flex items-center justify-center gap-2">
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
    accessorKey: "result",
    header: () => {
      return <div className="min-w-max text-center">Result</div>;
    },
    cell: ({ row }) => {
      const length = Object.keys(row.getValue("result") ?? {}).length === 0;
      return (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={length}
            className="disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => {
              setViewResult(row.original.result);
              setClickedRowId(row.id);
            }}
          >
            {viewResult && clickedRowId === row.id ? (
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
    accessorKey: "timestamp",
    header: () => {
      return <div className="min-w-max">Timestamp</div>;
    },
    cell: ({ row }) => {
      const data: string = row.getValue("timestamp");

      const date = new Date(data);

      const convertDate = (isoDateString: Date) => {
        const date = new Date(isoDateString);
        const formattedDate = date.toLocaleString();
        return formattedDate;
      };
      return <div className="min-w-max">{convertDate(date)} </div>;
    },
  },
];
export default columns;
