import { IARMAsynchronousTasksTypes } from "@/types/interfaces/ARM.interface";
import { Checkbox } from "@radix-ui/react-checkbox";
import { ColumnDef } from "@tanstack/react-table";
export const columns: ColumnDef<IARMAsynchronousTasksTypes>[] = [
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
    cell: ({ row }) => (
      <div className="min-w-max">{row.getValue("user_task_name")}</div>
    ),
  },
  {
    accessorKey: "task_name",
    header: () => {
      return <div className="min-w-max">Task Name</div>;
    },
    cell: ({ row }) => <div>{row.getValue("task_name")}</div>,
  },
  {
    accessorKey: "execution_method",
    header: () => {
      return <div className="min-w-max">Execution Method</div>;
    },
    cell: ({ row }) => (
      <div className="">{row.getValue("execution_method")}</div>
    ),
  },
  {
    accessorKey: "internal_execution_method",
    header: () => {
      return <div className="min-w-max">Internal Execution Method</div>;
    },
    cell: ({ row }) => (
      <div className="">{row.getValue("internal_execution_method")}</div>
    ),
  },
  {
    accessorKey: "script_name",
    header: () => {
      return <div className="w-[15rem]">Script Name</div>;
    },
    cell: ({ row }) => <div className="">{row.getValue("script_name")}</div>,
  },
  {
    accessorKey: "description",
    header: () => {
      return <div className="min-w-max">Description</div>;
    },
    cell: ({ row }) => (
      <div className="w-[25rem]">{row.getValue("description")}</div>
    ),
  },
  {
    accessorKey: "srs",
    header: () => {
      return <div className="">SRS</div>;
    },
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
    header: () => {
      return <div className="">SF</div>;
    },
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
    header: () => {
      return <div className="min-w-max">Created By</div>;
    },
    cell: ({ row }) => <div className="">{row.getValue("created_by")}</div>,
  },
  {
    accessorKey: "last_updated_by",
    header: () => {
      return <div className="min-w-max">Last Updated By</div>;
    },
    cell: ({ row }) => {
      const data: string = row.getValue("last_updated_by");
      return <div className="">{data ? data : "null"}</div>;
    },
  },
  {
    accessorKey: "creation_date",
    header: () => {
      return <div className="min-w-max">Creation Date</div>;
    },
    cell: ({ row }) => {
      // const convertDate = (isoDateString: Date) => {
      //   const date = new Date(isoDateString);
      //   const formattedDate = date.toLocaleString();
      //   return formattedDate;
      // };
      const data: Date = row.getValue("creation_date");
      const date = new Date(data);
      const formattedDate = date.toLocaleString("en-US");
      return <div className="min-w-max">{formattedDate} </div>;
    },
  },
  {
    accessorKey: "last_update_date",
    header: () => {
      return <div className="min-w-max">Last Updated Date</div>;
    },
    cell: ({ row }) => {
      // const convertDate = (isoDateString: Date) => {
      //   const date = new Date(isoDateString);
      //   const formattedDate = date.toLocaleString();
      //   return formattedDate;
      // };
      const data: Date = row.getValue("last_update_date");
      const date = new Date(data);
      const formattedDate = date.toLocaleString("en-US");
      return <div className=" min-w-max">{formattedDate} </div>;
    },
  },
  {
    accessorKey: "cancelled_yn",
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
