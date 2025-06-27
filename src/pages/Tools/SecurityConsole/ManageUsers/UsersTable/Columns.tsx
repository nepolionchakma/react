import { IUsersInfoTypes } from "@/types/interfaces/users.interface";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
export const columns: ColumnDef<IUsersInfoTypes>[] = [
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
    accessorKey: "user_name",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as string;
      const b = rowB.getValue(columnId) as string;

      return a.localeCompare(b, undefined, { sensitivity: "base" });
    },
    // header: "Username",
    header: ({ column }) => {
      return (
        <div
          className="min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Username
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => <div>{row.getValue("user_name")}</div>,
  },

  {
    accessorKey: "email_addresses",
    header: () => {
      return (
        <div className="flex items-center min-w-[20rem]">Email Addresses</div>
      );
    },
    cell: ({ row }) => {
      const emailAddresses = row.getValue("email_addresses");
      const splitedEmailAddresses = Array.isArray(emailAddresses)
        ? emailAddresses.join(", ")
        : "";
      return <div className="lowercase">{splitedEmailAddresses}</div>;
    },
  },
  {
    accessorKey: "first_name",
    header: () => {
      return <div className="flex items-center min-w-max">First Name</div>;
    },
    cell: ({ row }) => (
      <div className="capitalize min-w-max">{row.getValue("first_name")}</div>
    ),
  },
  {
    accessorKey: "last_name",
    header: "Last Name",
    cell: ({ row }) => (
      <div className="capitalize min-w-[5rem]">{row.getValue("last_name")}</div>
    ),
  },
  {
    accessorKey: "job_title",
    header: "Job Title",
    cell: ({ row }) => (
      <div className="capitalize min-w-[18rem]">
        {row.getValue("job_title")}
      </div>
    ),
  },
];
export default columns;
