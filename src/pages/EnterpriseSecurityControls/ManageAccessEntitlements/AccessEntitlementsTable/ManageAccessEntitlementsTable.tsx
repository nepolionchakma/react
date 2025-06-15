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

import Spinner from "@/components/Spinner/Spinner";
import Pagination5 from "@/components/Pagination/Pagination5";
import columns from "./Columns";
import {
  IFetchAccessPointsElementTypes,
  IManageAccessEntitlementsTypes,
} from "@/types/interfaces/ManageAccessEntitlements.interface";
import { useManageAccessEntitlementsContext } from "@/Context/ManageAccessEntitlements/ManageAccessEntitlementsContext";
import { toast } from "@/components/ui/use-toast";
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
    setLimit,
    selectedAccessEntitlements,
    setSelectedAccessEntitlements,
    setFilteredData,
    fetchAccessPointsEntitlement,
    deleteAccessPointsElement,
    deleteManageAccessEntitlement,
    fetchManageAccessEntitlements,
    setEditManageAccessEntitlement,
    setMangeAccessEntitlementAction,
    setSelectedManageAccessEntitlements,
    fetchAccessPointsEntitlementForDelete,
  } = useManageAccessEntitlementsContext();

  // State Management
  const [data, setData] = React.useState<IManageAccessEntitlementsTypes[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [page, setPage] = React.useState<number>(1);
  const [accessEntitlementsLimit, setAceessEntitlementsLimit] =
    React.useState(4);
  const [totalPage, setTotalPage] = React.useState<number | undefined>(1);

  // Shadcn Form State
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Delete States
  const [deleteAccessPointsElements, setDeleteAccessPointsElements] =
    React.useState<IFetchAccessPointsElementTypes[]>([]);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

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
      last_updated_by: "",
      created_by: "",
    });
    setFilteredData([]);
    setSelectedManageAccessEntitlements({} as IManageAccessEntitlementsTypes);
    table.getRowModel().rows.map((row) => row.toggleSelected(false));
  }, [page]);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const result = await fetchManageAccessEntitlements(
          page,
          accessEntitlementsLimit
        );
        setTotalPage(result?.totalPages);
        // setCurrentPage(result?.currentPage ?? 1);
        setData(result?.results ?? []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [save, page, accessEntitlementsLimit]);

  // Fetch Access Points
  React.useEffect(() => {
    if (selectedAccessEntitlements.def_entitlement_id !== 0) {
      fetchAccessPointsEntitlement(selectedAccessEntitlements);
      setSelectedManageAccessEntitlements(selectedAccessEntitlements);
      setLimit(5);
    } else {
      setSelectedManageAccessEntitlements({} as IManageAccessEntitlementsTypes);
      fetchAccessPointsEntitlement({} as IManageAccessEntitlementsTypes);
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
        last_updated_by: "",
        created_by: "",
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

  // Delete items generate Handler
  const handleGenerateAccessPointsDelete = async () => {
    try {
      setDeleteLoading(true);
      const result = await fetchAccessPointsEntitlementForDelete(
        selectedAccessEntitlements
      );

      setDeleteAccessPointsElements(result);
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDelete = async () => {
    await deleteManageAccessEntitlement(
      selectedAccessEntitlements.def_entitlement_id
    );

    if (deleteAccessPointsElements) {
      for (const item of deleteAccessPointsElements!) {
        await deleteAccessPointsElement(item.def_access_point_id);
      }
    }

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
      last_updated_by: "",
      created_by: "",
    });
    setDeleteAccessPointsElements([]);
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
                    setFilteredData([]);
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
                      last_updated_by: "",
                      created_by: "",
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
                    className="cursor-pointer hover:scale-110 duration-300"
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
              onClick={handleGenerateAccessPointsDelete}
              tooltipTitle="Delete"
            >
              <span className="flex flex-col gap-1">
                {deleteLoading ? (
                  <span className="h-10 w-10 mx-auto p-2">
                    <l-tailspin
                      size="30"
                      stroke="5"
                      speed="0.9"
                      color="black"
                    />
                  </span>
                ) : (
                  <span className="flex flex-col items-start gap-1">
                    <span className="text-black">
                      Entitlement Name:
                      {` ${selectedAccessEntitlements.entitlement_name}`}
                    </span>

                    <span>
                      {deleteAccessPointsElements && (
                        <span>
                          {deleteAccessPointsElements.map((item, index) => (
                            <span
                              key={item.def_access_point_id}
                              className="flex gap-1 text-black"
                            >
                              {index + 1}. {item.element_name}
                            </span>
                          ))}
                        </span>
                      )}
                    </span>
                  </span>
                )}
                {isLoading && <span>loading</span>}
              </span>
            </Alert>
          </ActionButtons>
        </div>

        <div className="flex gap-2">
          <Rows
            limit={accessEntitlementsLimit}
            setLimit={setAceessEntitlementsLimit}
          />

          {/* Columns */}
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
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-[20vh] text-center"
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
                    <TableCell key={cell.id} className="border py-0 px-1 h-7">
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
                  className="h-[8.7rem] text-center"
                >
                  No results found. Select Entitlement ID and filter.
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
            currentPage={page}
            setCurrentPage={setPage}
            totalPageNumbers={totalPage as number}
          />
        </div>
      </div>
    </div>
  );
};

export default ManageAccessEntitlementsTable;
