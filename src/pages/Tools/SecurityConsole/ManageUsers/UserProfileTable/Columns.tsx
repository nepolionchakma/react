import { IProfilesType } from "@/types/interfaces/users.interface";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
export const columns: ColumnDef<IProfilesType>[] = [
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
    accessorKey: "profile_type",
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
          Profile Type
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="min-w-[20rem]">{row.getValue("profile_type")}</div>
    ),
  },
  {
    accessorKey: "profile_id",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as number;
      const b = rowB.getValue(columnId) as number;

      return a - b;
    },
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="min-w-max cursor-pointer"
        >
          Profile Id
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="min-w-[35rem]">{row.getValue("profile_id")}</div>
    ),
  },
  {
    accessorKey: "primary_yn",
    enableResizing: true,
    header: () => {
      return <div className="text-center min-w-[10rem]">Primary</div>;
    },
    cell: ({ row }) => {
      const primary: string = row.getValue("primary_yn");
      return (
        <div className="text-center">
          <input
            type="checkbox"
            checked={primary === "Y"}
            readOnly
            className="accent-black"
          />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
export default columns;
