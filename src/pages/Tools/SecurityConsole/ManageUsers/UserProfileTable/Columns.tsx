import { IProfilesType } from "@/types/interfaces/users.interface";
import { ColumnDef } from "@tanstack/react-table";
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
    header: "Profile Type",
    cell: ({ row }) => (
      <div className="min-w-[20rem]">{row.getValue("profile_type")}</div>
    ),
  },
  {
    accessorKey: "profile_id",
    header: "Profile Id",
    cell: ({ row }) => (
      <div className="min-w-[35rem]">{row.getValue("profile_id")}</div>
    ),
  },
  {
    accessorKey: "primary_yn",
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
