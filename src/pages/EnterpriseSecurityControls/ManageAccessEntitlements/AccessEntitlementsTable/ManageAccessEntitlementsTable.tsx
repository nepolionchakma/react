import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

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

import { ChevronDown, FileEdit, Plus } from "lucide-react";
import {
  ColumnFiltersState,
  SortingState,
  flexRender,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import Pagination5 from "@/components/Pagination/Pagination5";
import columns from "./Columns";
import { IManageAccessEntitlementsTypes } from "@/types/interfaces/ManageAccessEntitlements.interface";
import { useManageAccessEntitlementsContext } from "@/Context/ManageAccessEntitlements/ManageAccessEntitlementsContext";
import Alert from "@/components/Alert/Alert";
import CustomTooltip from "@/components/Tooltip/Tooltip";
import Rows from "@/components/Rows/Rows";
import ActionButtons from "@/components/ActionButtons/ActionButtons";

// Main Component
const ManageAccessEntitlementsTable = () => {
  // Context Hooks
  const {
    save,
    setTable,
    isLoading,
    selectedAccessEntitlements,
    setSelectedAccessEntitlements,
    setAccessPointsData,
    fetchAccessPointsByEntitlementId,
    deleteManageAccessEntitlement,
    fetchManageAccessEntitlements,
    setEditManageAccessEntitlement,
    setMangeAccessEntitlementAction,
    setSelectedManageAccessEntitlements,
    accessEntitlementsPage,
    setAccessEntitlementsPage,
    accessEntitlementsLimit,
    setAccessEntitlementsLimit,
    // accessPointsData,
  } = useManageAccessEntitlementsContext();

  // State Management
  const [data, setData] = React.useState<IManageAccessEntitlementsTypes[]>([]);

  const [totalPage, setTotalPage] = React.useState<number | undefined>(1);

  // Shadcn Form State
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  React.useEffect(() => {
    setSelectedAccessEntitlements({
      def_entitlement_id: 0,
      entitlement_name: "string",
      description: "",
      comments: "",
      status: "",
      effective_date: "",
      revison: 0,
      revision_date: "",
      created_on: "",
      last_updated_on: "",
      last_updated_by: 0,
      created_by: 0,
    });
    setAccessPointsData([]);
    setSelectedManageAccessEntitlements({} as IManageAccessEntitlementsTypes);
    table.getRowModel().rows.map((row) => row.toggleSelected(false));
  }, [accessEntitlementsPage]);

  React.useEffect(() => {
    (async () => {
      const result = await fetchManageAccessEntitlements();
      setTotalPage(result.pages);
      // setCurrentPage(result?.currentPage ?? 1);
      setData(result.items);
    })();
  }, [accessEntitlementsPage, accessEntitlementsLimit, save]);

  // Fetch Access Points
  React.useEffect(() => {
    if (selectedAccessEntitlements.def_entitlement_id !== 0) {
      fetchAccessPointsByEntitlementId(
        selectedAccessEntitlements.def_entitlement_id
      );
      setSelectedManageAccessEntitlements(selectedAccessEntitlements);
    } else {
      setSelectedManageAccessEntitlements({} as IManageAccessEntitlementsTypes);
      fetchAccessPointsByEntitlementId(0);
    }
  }, [selectedAccessEntitlements.def_entitlement_id]);

  // Row Selection
  const handleRowSelection = (rowData: IManageAccessEntitlementsTypes) => {
    if (
      selectedAccessEntitlements.def_entitlement_id ===
      rowData.def_entitlement_id
    ) {
      setSelectedAccessEntitlements({
        def_entitlement_id: 0,
        entitlement_name: "",
        description: "",
        comments: "",
        status: "",
        effective_date: "",
        revison: 0,
        revision_date: "",
        created_on: "",
        last_updated_on: "",
        last_updated_by: 0,
        created_by: 0,
      });
    } else {
      setSelectedAccessEntitlements(rowData);
    }
  };

  // Table Setup
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
        pageSize: accessEntitlementsLimit,
      },
    },
  });

  const handleDelete = async () => {
    await deleteManageAccessEntitlement(
      selectedAccessEntitlements.def_entitlement_id
    );

    table.getRowModel().rows.forEach((row) => row.toggleSelected(false));
    setSelectedAccessEntitlements({
      def_entitlement_id: 0,
      entitlement_name: "",
      description: "",
      comments: "",
      status: "",
      effective_date: "",
      revison: 0,
      revision_date: "",
      created_on: "",
      last_updated_on: "",
      last_updated_by: 0,
      created_by: 0,
    });
  };

  // default hidden columns
  const hiddenColumns = [
    "comments",
    "effective_date",
    "revison",
    "revision_date",
    "created_on",
    "created_by",
    "last_updated_on",
    "last_updated_by",
  ];

  React.useEffect(() => {
    table.getAllColumns().forEach((column) => {
      if (hiddenColumns.includes(column.id)) {
        column.toggleVisibility(false);
      }
    });
  }, [table]);

  // Table Rendering
  return (
    <div className="px-3">
      {/* Top Actions */}
      <div className="flex gap-3 justify-between items-center py-2">
        <div className="flex gap-3 items-center">
          <ActionButtons>
            <CustomTooltip tooltipTitle="Add">
              <span>
                <Plus
                  className="cursor-pointer"
                  onClick={() => {
                    setEditManageAccessEntitlement(true);
                    setSelectedManageAccessEntitlements(
                      {} as IManageAccessEntitlementsTypes
                    );
                    setAccessPointsData([]);
                    setSelectedAccessEntitlements({
                      def_entitlement_id: 0,
                      entitlement_name: "",
                      description: "",
                      comments: "",
                      status: "",
                      effective_date: "",
                      revison: 0,
                      revision_date: "",
                      created_on: "",
                      last_updated_on: "",
                      last_updated_by: 0,
                      created_by: 0,
                    });
                    table
                      .getRowModel()
                      .rows.forEach((row) => row.toggleSelected(false));
                    setMangeAccessEntitlementAction("add");
                  }}
                />
              </span>
            </CustomTooltip>

            {selectedAccessEntitlements.def_entitlement_id !== 0 ? (
              <CustomTooltip tooltipTitle="Edit">
                <span>
                  <FileEdit
                    className="cursor-pointer"
                    onClick={() => {
                      setEditManageAccessEntitlement(true);
                      setSelectedManageAccessEntitlements(
                        selectedAccessEntitlements
                      );
                      setMangeAccessEntitlementAction("edit");
                      setTable(table);
                    }}
                  />
                </span>
              </CustomTooltip>
            ) : (
              <CustomTooltip tooltipTitle="Edit">
                <span>
                  <FileEdit className="cursor-not-allowed text-slate-200" />
                </span>
              </CustomTooltip>
            )}

            <Alert
              disabled={selectedAccessEntitlements.def_entitlement_id === 0}
              actionName="delete"
              onContinue={handleDelete}
              tooltipTitle="Delete"
            >
              <span className="flex flex-col gap-1">
                <span className="flex flex-col items-start gap-1">
                  <span>
                    Entitlement Name:
                    {` ${selectedAccessEntitlements.entitlement_name}`}
                  </span>

                  <span>
                    {/* {accessPointsData && (
                      <span>
                        {accessPointsData.map((item, index) => (
                          <span
                            key={item.def_access_point_id}
                            className="flex gap-1"
                          >
                            {index + 1}. {item.access_point_name}
                          </span>
                        ))}
                      </span>
                    )} */}
                  </span>
                </span>
              </span>
            </Alert>
          </ActionButtons>
        </div>

        <div className="flex gap-2 items-center ml-auto">
          <Rows
            limit={accessEntitlementsLimit}
            setLimit={setAccessEntitlementsLimit}
          />

          {/* Columns */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="max-h-[70vh] overflow-auto scrollbar-thin"
            >
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
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
                      {/* {header.id === "select" && (
                               <Checkbox
                                 className="m-1"
                                 checked={isSelectAll}
                                 onClick={handleSelectAll}
                                 aria-label="Select all"
                               />
                             )} */}
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
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-[6.5rem] text-center"
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
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      key={cell.id}
                      className="border py-0 px-1"
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.columnDef.minSize,
                      }}
                    >
                      {index === 0 ? (
                        <Checkbox
                          className="m-1"
                          checked={
                            selectedAccessEntitlements.def_entitlement_id ===
                            row.original.def_entitlement_id
                          }
                          onClick={() => handleRowSelection(row.original)}
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
                  className="h-[6.5rem] text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex justify-between p-1">
          <div className="flex-1 text-sm text-gray-600">
            {selectedAccessEntitlements.def_entitlement_id !== 0 ? 1 : 0} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <Pagination5
            currentPage={accessEntitlementsPage}
            setCurrentPage={setAccessEntitlementsPage}
            totalPageNumbers={totalPage as number}
          />
        </div>
      </div>
    </div>
  );
};

export default ManageAccessEntitlementsTable;
