import * as React from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useManageAccessEntitlementsContext } from "@/Context/ManageAccessEntitlements/ManageAccessEntitlementsContext";
import columns from "./Columns";
import RelationAccessPoint from "./RelationAccessPoint";
import Spinner from "@/components/Spinner/Spinner";

const AccessPointsEditModal = () => {
  const {
    selectedAccessEntitlements: selected,
    filteredData: data,
    fetchAccessPointsEntitlement,
    isLoadingAccessPoints,
    isLoading,
    setSelectedAccessEntitlementElements,
  } = useManageAccessEntitlementsContext();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

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
  const handleSelectItem = (accessPointIds: number) => {
    //set number of selected rows
    setSelectedAccessEntitlementElements((prev) => {
      if (prev.find((item) => item === accessPointIds)) {
        return prev.filter((item) => item !== accessPointIds);
      } else {
        return [...prev, accessPointIds];
      }
    });
  };
  const tableRow = () => {
    table.toggleAllPageRowsSelected(false);
  };
  React.useEffect(() => {
    fetchAccessPointsEntitlement(selected);

    //table toggle false
    table.toggleAllRowsSelected(false);
    //set number of selected rows
    setSelectedAccessEntitlementElements([]);
  }, [isLoadingAccessPoints, data.length]);

  return (
    <div className="">
      <div className="w-full">
        <div className="mb-4">
          <RelationAccessPoint tableRow={tableRow} />
        </div>
        <div className="rounded-md">
          <div className="max-h-[13rem] overflow-auto">
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
                          className="relative border border-slate-400 bg-slate-200 p-1 h-9"
                          style={{
                            width: `${header.getSize()}px`,
                            maxWidth: header.id === "select" ? 7 : "",
                          }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          {/* Example: Checkbox for selecting all rows */}
                          {header.id === "select" && (
                            <Checkbox
                              checked={
                                table.getIsAllPageRowsSelected() ||
                                (table.getIsSomePageRowsSelected() &&
                                  "indeterminate")
                              }
                              onCheckedChange={(value) => {
                                // Toggle all page rows selected
                                table.toggleAllPageRowsSelected(!!value);

                                // Use a timeout to log the selected data
                                setTimeout(() => {
                                  const selectedRows = table
                                    .getSelectedRowModel()
                                    .rows.map((row) => row.original);

                                  const ids = selectedRows.map(
                                    (row) => row?.def_access_point_id
                                  );
                                  setSelectedAccessEntitlementElements(
                                    ids as number[]
                                  );
                                }, 0);
                              }}
                              className=""
                              aria-label="Select all"
                            />
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
                {isLoadingAccessPoints ||
                (isLoading && selected.def_entitlement_id !== 0) ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-[9rem] text-center"
                    >
                      <Spinner color="black" size="40" />
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() ? "selected" : undefined}
                    >
                      {row.getVisibleCells().map((cell, index) => (
                        <TableCell
                          key={cell.id}
                          className="border p-1 h-8"
                          style={{
                            width: cell.column.getSize(),
                            minWidth: cell.column.columnDef.minSize,
                          }}
                        >
                          {index === 0 ? (
                            <Checkbox
                              className=""
                              checked={row.getIsSelected() || false}
                              onCheckedChange={(value) => {
                                row.toggleSelected(!!value);
                              }}
                              onClick={() =>
                                handleSelectItem(
                                  row.original.def_access_point_id as number
                                )
                              }
                              aria-label="Select row"
                            />
                          ) : (
                            flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results found. Select Entitlement ID and filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex-1 text-sm text-gray-600 mt-4">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
        </div>
      </div>
    </div>
  );
};
export default AccessPointsEditModal;
