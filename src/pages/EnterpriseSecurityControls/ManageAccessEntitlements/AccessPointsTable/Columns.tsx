import { IDataSourceTypes } from "@/types/interfaces/datasource.interface";
import { IFetchAccessPointsElementTypes } from "@/types/interfaces/ManageAccessEntitlements.interface";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Check, X } from "lucide-react";

const columns: ColumnDef<IFetchAccessPointsElementTypes>[] = [
  {
    accessorKey: "element_name",
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
          Element Name
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="capitalize min-w-max">
          {row.getValue("element_name")}
        </div>
      );
    },
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
    accessorKey: "dataSource",
    enableResizing: true,
    header: "Data Source",
    cell: ({ row }) => {
      const dataSource: IDataSourceTypes = row.getValue("dataSource");
      return (
        <div className="capitalize min-w-max">
          {dataSource?.datasource_name}
        </div>
      );
    },
  },
  {
    accessorKey: "platform",
    enableResizing: true,
    header: "Platform",
    cell: ({ row }) => (
      <div className="capitalize min-w-max">{row.getValue("platform")}</div>
    ),
  },
  {
    accessorKey: "element_type",
    enableResizing: true,
    header: "Element Type",
    cell: ({ row }) => (
      <div className="capitalize min-w-max">{row.getValue("element_type")}</div>
    ),
  },
  {
    accessorKey: "access_control",
    header: "Access Control",
    cell: ({ row }) => (
      <div className="capitalize min-w-max">
        {row.getValue("access_control") === "true" ? <Check /> : <X />}
      </div>
    ),
  },
  {
    accessorKey: "change_control",
    header: "Change Control",
    cell: ({ row }) => (
      <div className="capitalize min-w-max">
        {row.getValue("change_control")}
      </div>
    ),
  },
  {
    accessorKey: "audit",
    header: "Audit",
    cell: ({ row }) => (
      <div className="capitalize min-w-max">{row.getValue("audit")}</div>
    ),
  },
];
export default columns;
