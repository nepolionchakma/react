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
import Pagination5 from "@/components/Pagination/Pagination5";
import Spinner from "@/components/Spinner/Spinner";
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
import { useLocation } from "react-router-dom";
import columns from "./Columns";

import Rows from "@/components/Rows/Rows";
import CustomTooltip from "@/components/Tooltip/Tooltip";
import ActionButtons from "@/components/ActionButtons/ActionButtons";

const AccessPointsEntitleTable = () => {
  // Global Context and Location
  const location = useLocation();
  const { setIsOpenModal } = useGlobalContext();
  const {
    filteredData: data,
    isLoadingAccessPoints,
    selectedManageAccessEntitlements,
    fetchAccessPointsEntitlement,
    selectedAccessEntitlements,
    save2,

    setAccessPointStatus,
    page,
    setPage,
    totalPage,
    limit,
    isLoading,
    setLimit,
  } = useManageAccessEntitlementsContext();
  console.log(data, "data");
  // State Hooks
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  console.log(
    selectedManageAccessEntitlements,
    "manageaccess",
    selectedAccessEntitlements,
    "access"
  );

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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: 0,
        pageSize: limit,
      },
    },
  });

  // // Row selection handler
  // const handleRowSelected = (rowData: ICreateAccessPointsElementTypes) => {
  //   setSelectedAccessPoints((prev) => {
  //     if (prev.includes(rowData)) {
  //       return prev.filter((item) => item !== rowData);
  //     } else {
  //       return [...prev, rowData];
  //     }
  //   });
  // };

  // Effect: Fetch Data when relevant parameters change
  useEffect(() => {
    if (selectedAccessEntitlements.def_entitlement_id !== 0) {
      fetchAccessPointsEntitlement(selectedAccessEntitlements);
    }
  }, [
    location,
    save2,
    page,
    limit,
    isLoadingAccessPoints,
    selectedAccessEntitlements,
    fetchAccessPointsEntitlement,
  ]);

  // Effect: Manage Pagination Array based on selected state
  useEffect(() => {
    table.toggleAllRowsSelected(false); // Reset row selection
  }, [page, totalPage, selectedAccessEntitlements.def_entitlement_id]);

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
    <div className="px-3">
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
                setIsOpenModal("access_points");
                setPage(1);
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
                  setIsOpenModal("create_access_point");
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
          <Rows limit={limit} setLimit={setLimit} />

          {/* Dropdown for Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="border h-9 py-0 px-1 border-slate-400 bg-slate-200"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          {/* Table Body */}
          <TableBody>
            {isLoadingAccessPoints ||
            (isLoading &&
              selectedAccessEntitlements.def_entitlement_id !== 0) ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-[40vh] text-center"
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
                  className="h-[8.7rem] text-center"
                >
                  No results found. Select Entitlement ID and filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex justify-end p-1">
          {/* <div className="flex-1 text-sm text-gray-600">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div> */}
          <Pagination5
            currentPage={page}
            setCurrentPage={setPage}
            totalPageNumbers={totalPage as number}
          />
        </div>
      </div>
    </div>
  );
};

export default AccessPointsEntitleTable;
