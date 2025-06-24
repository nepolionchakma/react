import { IManageAccessEntitlementsTypes } from "@/types/interfaces/ManageAccessEntitlements.interface";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

const convertDate = (isoDateString: Date) => {
  const date = new Date(isoDateString);
  const formattedDate = date.toLocaleString();
  return formattedDate;
};

const columns: ColumnDef<IManageAccessEntitlementsTypes>[] = [
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
    accessorKey: "def_entitlement_id",
    enableResizing: true,
    header: " Entitlement ID",
    cell: ({ row }) => (
      <div className="capitalize min-w-max">
        {row.getValue("def_entitlement_id")}
      </div>
    ),
  },
  {
    accessorKey: "entitlement_name",
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
          Entitlement Name{""}
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize min-w-max">
        {row.getValue("entitlement_name")}
      </div>
    ),
  },
  {
    accessorKey: "description",
    enableResizing: true,
    header: "Description",
    cell: ({ row }) => (
      <div className="capitalize min-w-[20rem]">
        {row.getValue("description")}
      </div>
    ),
  },
  {
    accessorKey: "comments",
    enableResizing: true,
    header: "Comments",
    // header: "Datasource Name",
    cell: ({ row }) => (
      <div className="capitalize min-w-max">{row.getValue("comments")}</div>
    ),
  },
  {
    accessorKey: "status",
    enableResizing: true,
    header: "Status",
    cell: ({ row }) => (
      <div className="capitalize min-w-max">{row.getValue("status")}</div>
    ),
  },
  {
    accessorKey: "effective_date",
    enableResizing: true,
    header: "Effective Date",
    cell: ({ row }) => {
      const sliceDate = convertDate(row.getValue("effective_date"));
      return <div className="capitalize min-w-max">{sliceDate}</div>;
    },
  },
  {
    accessorKey: "revison",
    enableResizing: true,
    header: "Revison",
    cell: ({ row }) => (
      <div className="capitalize min-w-max">{row.getValue("revison")}</div>
    ),
  },
  {
    accessorKey: "revision_date",
    enableResizing: true,
    header: "Revision Date",
    cell: ({ row }) => {
      const sliceDate = convertDate(row.getValue("revision_date"));
      return <div className="capitalize min-w-max">{sliceDate}</div>;
    },
  },
  {
    accessorKey: "created_on",
    enableResizing: true,
    header: "Created On",
    cell: ({ row }) => {
      const sliceDate = convertDate(row.getValue("created_on"));
      return <div className="capitalize min-w-max">{sliceDate}</div>;
    },
  },
  {
    accessorKey: "created_by",
    enableResizing: true,
    header: "Created By",
    cell: ({ row }) => (
      <div className="capitalize min-w-max">{row.getValue("created_by")}</div>
    ),
  },
  {
    accessorKey: "last_updated_on",
    enableResizing: true,
    header: "Last Updated On",
    cell: ({ row }) => {
      const sliceDate = convertDate(row.getValue("last_updated_on"));
      return <div className="capitalize min-w-max">{sliceDate}</div>;
    },
  },
  {
    accessorKey: "last_updated_by",
    enableResizing: true,
    header: "Last Updated By",
    cell: ({ row }) => (
      <div className="capitalize min-w-max">
        {row.getValue("last_updated_by")}
      </div>
    ),
  },
];
export default columns;
