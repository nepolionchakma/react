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
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId); // No need for 'as string' in JS
      const b = rowB.getValue(columnId);
      return String(a).localeCompare(String(b), undefined, {
        sensitivity: "base",
      });
    },
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="min-w-[20rem] cursor-pointer"
        >
          Email Addresses
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => {
      const emailAddresses = row.getValue("email_addresses");
      console.log(emailAddresses, "fsdfsd");
      const splitedEmailAddresses = Array.isArray(emailAddresses)
        ? emailAddresses.join(", ")
        : "";
      return <div className="lowercase">{splitedEmailAddresses}</div>;
    },
  },
  {
    accessorKey: "first_name",
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
          First Name
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize min-w-max">{row.getValue("first_name")}</div>
    ),
  },
  {
    accessorKey: "last_name",
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
          Last Name
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize min-w-[5rem]">{row.getValue("last_name")}</div>
    ),
  },
  {
    accessorKey: "job_title",
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
          Job Title
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize min-w-[18rem]">
        {row.getValue("job_title")}
      </div>
    ),
  },
];
export default columns;
