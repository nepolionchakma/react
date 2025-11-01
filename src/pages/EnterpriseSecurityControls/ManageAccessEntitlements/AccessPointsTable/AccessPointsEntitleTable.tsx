import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
// import Pagination5 from "@/components/Pagination/Pagination5";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";

import { useManageAccessEntitlementsContext } from "@/Context/ManageAccessEntitlements/ManageAccessEntitlementsContext";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import columns from "./Columns";

// import Rows from "@/components/Rows/Rows";
import CustomTooltip from "@/components/Tooltip/Tooltip";
import ActionButtons from "@/components/ActionButtons/ActionButtons";
import { convertToTitleCase } from "@/Utility/general";

const AccessPointsEntitleTable = () => {
  const { setIsOpenModal } = useGlobalContext();
  const {
    isLoadingAccessPoints,
    selectedManageAccessEntitlements,
    selectedAccessEntitlements,
    setAccessPointStatus,
    accessPointsData: data,
  } = useManageAccessEntitlementsContext();

  // State Hooks
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Table Initialization
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    columnResizeMode: "onChange",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: 0,
        pageSize: data.length,
      },
    },
  });

  useEffect(() => {
    table.toggleAllRowsSelected(false); // Reset row selection
  }, [selectedAccessEntitlements.def_entitlement_id, table]);

  // default hidden columns
  const hiddenColumns = [
    "element_type",
    "access_control",
    "change_control",
    "audit",
  ];

  useEffect(() => {
    table.getAllColumns().forEach((column) => {
      if (hiddenColumns.includes(column.id)) {
        column.toggleVisibility(false);
      }
    });
  }, [table]);

  // Table Rendering
  return (
    <div className="px-3 ">
      {/* Header Section */}
      <div className="flex items-center justify-between py-2">
        <div className="flex gap-2">
          {/* Access Points Button */}
          <ActionButtons>
            <h3
              className={
                !selectedManageAccessEntitlements?.def_entitlement_id ||
                selectedAccessEntitlements?.def_entitlement_id !==
                  selectedManageAccessEntitlements?.def_entitlement_id ||
                selectedAccessEntitlements.def_entitlement_id === 0
                  ? "cursor-not-allowed text-slate-200"
                  : "cursor-pointer text-black"
              }
              onClick={() => {
                selectedManageAccessEntitlements?.def_entitlement_id !==
                  selectedAccessEntitlements.def_entitlement_id ||
                selectedManageAccessEntitlements.def_entitlement_id === 0
                  ? null
                  : setIsOpenModal("access_points");
                // setPage(1);
              }}
            >
              Access Points
            </h3>
          </ActionButtons>

          {/* Create Access Point Button */}
          <ActionButtons>
            <CustomTooltip tooltipTitle="Add">
              <Plus
                className={
                  selectedManageAccessEntitlements?.def_entitlement_id !==
                    selectedAccessEntitlements.def_entitlement_id ||
                  selectedManageAccessEntitlements.def_entitlement_id === 0
                    ? "cursor-not-allowed text-slate-200"
                    : "cursor-pointer text-black"
                }
                onClick={() => {
                  selectedManageAccessEntitlements?.def_entitlement_id !==
                    selectedAccessEntitlements.def_entitlement_id ||
                  selectedManageAccessEntitlements.def_entitlement_id === 0
                    ? null
                    : setIsOpenModal("create_access_point");
                  setAccessPointStatus("create");
                }}
              />
            </CustomTooltip>
          </ActionButtons>
        </div>

        {/* Entitlement Name */}
        <div>
          {selectedManageAccessEntitlements?.def_entitlement_id ===
            selectedAccessEntitlements?.def_entitlement_id && (
            <h3 className="font-bold capitalize">
              {selectedManageAccessEntitlements?.entitlement_name}
            </h3>
          )}
        </div>
        <div className="flex gap-2">
          {/**Rows */}
          {/* <Rows limit={limit} setLimit={setLimit} /> */}

          {/* Dropdown for Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="max-h-72 overflow-y-auto scrollbar-thin"
            >
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {convertToTitleCase(column.id)}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-md border">
        <Table
          style={{
            width: table.getTotalSize(),
            minWidth: "100%",
            // tableLayout: "fixed",
          }}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="relative border h-9 py-0 px-1 border-slate-400 bg-slate-200"
                      style={{
                        width: `${header.getSize()}px`,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}

                      {header.id !== "select" && (
                        <div
                          {...{
                            onDoubleClick: () => header.column.resetSize(),
                            onMouseDown: header.getResizeHandler(),
                            onTouchStart: header.getResizeHandler(),
                            className: `absolute top-0 right-0 cursor-col-resize w-px h-full hover:w-2`,
                            style: {
                              userSelect: "none",
                              touchAction: "none",
                            },
                          }}
                        />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoadingAccessPoints ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-[16rem] text-center"
                >
                  <l-tailspin
                    size="40"
                    stroke="5"
                    speed="0.9"
                    color="black"
                  ></l-tailspin>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="border py-0 px-1 h-7">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-[16rem] text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="p-1">
        <p className="text-sm text-gray-600">
          Total Row(s): {table.getFilteredRowModel().rows.length}
        </p>
      </div>
    </div>
  );
};

export default AccessPointsEntitleTable;
