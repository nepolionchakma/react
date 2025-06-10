import { Checkbox } from "@/components/ui/checkbox";
import { IManageAccessEntitlementsTypes } from "@/types/interfaces/ManageAccessEntitlements.interface";
import { ColumnDef } from "@tanstack/react-table";

const convertDate = (isoDateString: Date) => {
  const date = new Date(isoDateString);
  const formattedDate = date.toLocaleString();
  return formattedDate;
};

const columns: ColumnDef<IManageAccessEntitlementsTypes>[] = [
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
    accessorKey: "def_entitlement_id",
    header: ({ column }) => {
      return (
        <div
          className="min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Entitlement ID
        </div>
      );
    },

    cell: ({ row }) => (
      <div className="capitalize min-w-max">
        {row.getValue("def_entitlement_id")}
      </div>
    ),
  },
  {
    accessorKey: "entitlement_name",
    header: ({ column }) => {
      return (
        <div
          className="min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          * Entitlement Name
        </div>
      );
    },
    // header: "Datasource Name",
    cell: ({ row }) => (
      <div className="capitalize min-w-max">
        {row.getValue("entitlement_name")}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => {
      return (
        <div
          className="min-w-[30rem]"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Description
        </div>
      );
    },
    // header: "Datasource Name",
    cell: ({ row }) => (
      <div className="capitalize min-w-max">{row.getValue("description")}</div>
    ),
  },
  {
    accessorKey: "comments",
    header: ({ column }) => {
      return (
        <div
          className="min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Comments
        </div>
      );
    },
    // header: "Datasource Name",
    cell: ({ row }) => (
      <div className="capitalize min-w-max">{row.getValue("comments")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <div
          className="min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
        </div>
      );
    },
    // header: "Datasource Name",
    cell: ({ row }) => (
      <div className="capitalize min-w-max">{row.getValue("status")}</div>
    ),
  },
  {
    accessorKey: "effective_date",
    header: ({ column }) => {
      return (
        <div
          className="min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Effective Date
        </div>
      );
    },
    cell: ({ row }) => {
      const sliceDate = convertDate(row.getValue("effective_date"));
      return <div className="capitalize min-w-max">{sliceDate}</div>;
    },
  },
  {
    accessorKey: "revison",
    header: ({ column }) => {
      return (
        <div
          className="min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Revison
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize min-w-max">{row.getValue("revison")}</div>
    ),
  },
  {
    accessorKey: "revision_date",
    header: ({ column }) => {
      return (
        <div
          className="min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Revision Date
        </div>
      );
    },
    cell: ({ row }) => {
      const sliceDate = convertDate(row.getValue("revision_date"));
      return <div className="capitalize min-w-max">{sliceDate}</div>;
    },
  },
  {
    accessorKey: "created_on",
    header: ({ column }) => {
      return (
        <div
          className="min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created On
        </div>
      );
    },
    cell: ({ row }) => {
      const sliceDate = convertDate(row.getValue("created_on"));
      return <div className="capitalize min-w-max">{sliceDate}</div>;
    },
  },
  {
    accessorKey: "created_by",
    header: ({ column }) => {
      return (
        <div
          className="min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created By
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize min-w-max">{row.getValue("created_by")}</div>
    ),
  },
  {
    accessorKey: "last_updated_on",
    header: ({ column }) => {
      return (
        <div
          className="min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Updated On
        </div>
      );
    },
    cell: ({ row }) => {
      const sliceDate = convertDate(row.getValue("last_updated_on"));
      return <div className="capitalize min-w-max">{sliceDate}</div>;
    },
  },
  {
    accessorKey: "last_updated_by",
    header: ({ column }) => {
      return (
        <div
          className="min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Updated By
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize min-w-max">
        {row.getValue("last_updated_by")}
      </div>
    ),
  },
];
export default columns;
