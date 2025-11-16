import {
  IPrivilege,
  IPrivilegeAndRole,
  IRole,
  ITenantsTypes,
} from "@/types/interfaces/users.interface";
import { tenantNames } from "@/Utility/general";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  CircleChevronDown,
  CircleChevronRight,
} from "lucide-react";
export const columns = (
  tenants: ITenantsTypes[],
  expandRoles: string | null,
  expandPrevilege: string | null,
  setExpandRoles: (row: string | null) => void,
  setExpandPrevilege: (row: string | null) => void
): ColumnDef<IPrivilegeAndRole>[] => [
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
    accessorKey: "user_id",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as number;
      const b = rowB.getValue(columnId) as number;

      return a - b;
    },
    // header: "Username",
    header: ({ column }) => {
      return (
        <div
          className="min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User Id
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },

    cell: ({ row }) => <div>{row.getValue("user_id")}</div>,
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

    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("user_name")}</div>
    ),
  },

  {
    accessorKey: "tenant_id",
    accessorFn: (row) => tenantNames(row.tenant_id, tenants),
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
          Tenant Name
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="capitalize min-w-max]">{row.getValue("tenant_id")}</div>
      );
    },
  },
  {
    accessorKey: "granted_roles",
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
          Roles
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => {
      const isExpanded = expandRoles === row.id;
      const granted_roles: IRole[] = row.getValue("granted_roles");
      return (
        <div className="flex items-center gap-2 min-w-max">
          <button
            disabled={granted_roles.length <= 1}
            className="disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setExpandRoles(isExpanded ? null : row.id)}
          >
            {isExpanded ? (
              <CircleChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <CircleChevronRight className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <div className="capitalize">
            {isExpanded ? (
              /* Show all roles, each on new line */
              granted_roles.map((item, i) => (
                <div key={i}>{item.role_name}</div>
              ))
            ) : (
              /* Collapsed view */
              <span>{granted_roles[0]?.role_name}</span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "granted_privileges",
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
          Privileges
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      );
    },
    cell: ({ row }) => {
      const isExpanded = expandPrevilege === row.id;
      const granted_privileges: IPrivilege[] =
        row.getValue("granted_privileges");
      return (
        <div className="flex items-center gap-2 min-w-max">
          <button
            disabled={granted_privileges.length <= 1}
            className="disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setExpandPrevilege(isExpanded ? null : row.id)}
          >
            {isExpanded ? (
              <CircleChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <CircleChevronRight className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <div className="capitalize">
            {isExpanded ? (
              /* show all privileges on new lines */
              granted_privileges.map((item, i) => (
                <div key={i}>{item.privilege_name}</div>
              ))
            ) : (
              /* collapsed view */
              <span>{granted_privileges[0]?.privilege_name}</span>
            )}
          </div>
        </div>
      );
    },
  },
];
export default columns;
