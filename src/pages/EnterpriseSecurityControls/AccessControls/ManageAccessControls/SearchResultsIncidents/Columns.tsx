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
    size: 24,
    minSize: 24,
    maxSize: 24,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
  },
  {
    accessorKey: "control_name",
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
          Control Name{" "}
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize w-[15rem]">{row.getValue("control_name")}</div>
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
    accessorKey: "pending_results_count",
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
          Pending Results Count
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("pending_results_count")}</div>
    ),
  },
  {
    accessorKey: "control_type",
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
          Control Type
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("control_type")}</div>
    ),
  },
  {
    accessorKey: "priority",
    enableResizing: true,
    header: "Priority",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("priority")}</div>
    ),
  },
  {
    accessorKey: "datasources",
    enableResizing: true,
    header: () => <div className="w-[15rem]">Datasources</div>,
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("datasources")}</div>
    ),
  },
  {
    accessorKey: "control_last_run",
    enableResizing: true,
    header: () => <div className="min-w-max">Control Last Run</div>,
    cell: ({ row }) => {
      const data: Date = row.getValue("control_last_run");
      const date = new Date(data);
      const formattedDate = date.toLocaleString("en-US");
      return <div className="capitalize min-w-max">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "control_last_updated",
    enableResizing: true,
    header: () => <div className="min-w-max">Control Last Updated</div>,
    cell: ({ row }) => {
      const data: Date = row.getValue("control_last_updated");
      const date = new Date(data);
      const formattedDate = date.toLocaleString("en-US");
      return <div className="capitalize min-w-max">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "status",
    enableResizing: true,
    header: "Status",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("status")}</div>
    ),
  },
  {
    accessorKey: "state",
    enableResizing: true,
    header: "State",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("state")}</div>
    ),
  },
  {
    accessorKey: "result_investigator",
    enableResizing: true,
    header: () => <div className="min-w-max">Result Investigator</div>,
    cell: ({ row }) => (
      <div className="capitalize min-w-max">
        {row.getValue("result_investigator")}
      </div>
    ),
  },
  {
    accessorKey: "authorized_data",
    enableResizing: true,
    header: () => <div className="min-w-max">Authorized Data</div>,
    cell: ({ row }) => {
      const data: Date = row.getValue("authorized_data");
      const date = new Date(data);
      const formattedDate = date.toLocaleString("en-US");
      return <div className="capitalize min-w-max">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "revision",
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
          Revision
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("revision")}</div>
    ),
  },
  {
    accessorKey: "revision_date",
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
          Revision Date
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => {
      const data: Date = row.getValue("revision_date");
      const date = new Date(data);
      const formattedDate = date.toLocaleString("en-US");
      return <div className="capitalize min-w-max">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "created_date",
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
          Created Date
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => {
      const data: Date = row.getValue("created_date");
      const date = new Date(data);
      const formattedDate = date.toLocaleString("en-US");
      return <div className="capitalize min-w-max">{formattedDate}</div>;
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
];
export default columns;
