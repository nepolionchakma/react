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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ChevronDown, Dot, FileEdit, Plus, Trash } from "lucide-react";
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

// Types for Delete
interface IDeleteAccessPointsElementTypes {
  entitlement_name: string;
  result: IFetchAccessPointsElementTypes[] | undefined;
}

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
    React.useState<IDeleteAccessPointsElementTypes[]>([]);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  React.useEffect(() => {
    setSelectedAccessEntitlements([]);
    setFilteredData([]);
    setSelectedManageAccessEntitlements({} as IManageAccessEntitlementsTypes);
    table.getRowModel().rows.map((row) => row.toggleSelected(false));
  }, [page]);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const limit = 3;
      try {
        const result = await fetchManageAccessEntitlements(page, limit);
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
  }, [save, page]);

  // Fetch Access Points
  React.useEffect(() => {
    if (selectedAccessEntitlements.length === 1) {
      fetchAccessPointsEntitlement(selectedAccessEntitlements[0]);
      setSelectedManageAccessEntitlements(selectedAccessEntitlements[0]);
      setLimit(5);
    } else {
      setSelectedManageAccessEntitlements({} as IManageAccessEntitlementsTypes);
      fetchAccessPointsEntitlement({} as IManageAccessEntitlementsTypes);
    }
  }, [selectedAccessEntitlements.length]);

  // Row Selection
  const handleRowSelection = (rowData: IManageAccessEntitlementsTypes) => {
    setSelectedAccessEntitlements((prev) => {
      if (prev.includes(rowData)) {
        return prev.filter((item) => item !== rowData);
      } else {
        return [...prev, rowData];
      }
    });
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
    },
  });

  // Delete items generate Handler
  const handleGenerateAccessPointsDelete = async () => {
    try {
      setDeleteLoading(true);
      for (const element of selectedAccessEntitlements) {
        const result = await fetchAccessPointsEntitlementForDelete(element);
        setDeleteAccessPointsElements((prev) => [
          ...prev,
          { entitlement_name: element.entitlement_name, result },
        ]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDelete = async () => {
    for (const element of selectedAccessEntitlements) {
      await deleteManageAccessEntitlement(element.def_entitlement_id);
    }
    for (const element of deleteAccessPointsElements) {
      for (const item of element.result!) {
        await deleteAccessPointsElement(item.access_point_id);
      }
    }
    table.getRowModel().rows.forEach((row) => row.toggleSelected(false));
    setSelectedAccessEntitlements([]);
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
      <div className="flex gap-3 items-center py-2">
        <div className="flex gap-3">
          <div className="flex gap-3 px-4 py-2 border rounded">
            <h3>Actions</h3>
            <h3>View</h3>
          </div>
          <div className="flex gap-3 items-center px-4 py-2 border rounded">
            <Plus
              className="cursor-pointer hover:scale-110 duration-300 "
              onClick={() => {
                setEditManageAccessEntitlement(true);
                setSelectedManageAccessEntitlements(
                  {} as IManageAccessEntitlementsTypes
                );
                setFilteredData([]);
                setSelectedAccessEntitlements([]);
                table
                  .getRowModel()
                  .rows.forEach((row) => row.toggleSelected(false));
                setMangeAccessEntitlementAction("add");
              }}
            />
            {selectedAccessEntitlements.length === 1 ? (
              <FileEdit
                className="cursor-pointer hover:scale-110 duration-300"
                onClick={() => {
                  setEditManageAccessEntitlement(true);
                  setSelectedManageAccessEntitlements(
                    selectedAccessEntitlements[0]
                  );
                  setMangeAccessEntitlementAction("edit");
                  setTable(table);
                }}
              />
            ) : (
              <FileEdit className="cursor-not-allowed text-slate-200" />
            )}
            <div className="flex items-center">
              <AlertDialog>
                <AlertDialogTrigger
                  disabled={selectedAccessEntitlements.length === 0}
                >
                  <Trash
                    className={`hover:scale-110 duration-300 ${
                      selectedAccessEntitlements.length > 0
                        ? " cursor-pointer"
                        : "text-slate-200 cursor-not-allowed"
                    }`}
                    onClick={handleGenerateAccessPointsDelete}
                  />
                </AlertDialogTrigger>
                <AlertDialogContent className="max-h-[80%] overflow-y-auto">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="overflow-y-auto text-black">
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
                          deleteAccessPointsElements.map((item, i) => (
                            <span key={item.entitlement_name}>
                              <span className="font-bold">
                                {i + 1}. {item.entitlement_name}
                              </span>
                              <span>
                                {item.result?.map((item) => (
                                  <span
                                    key={item.access_point_id}
                                    className="flex gap-1"
                                  >
                                    <Dot /> {item.element_name}
                                  </span>
                                ))}
                              </span>
                            </span>
                          ))
                        )}
                        {isLoading && <span>loading</span>}
                      </span>
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      onClick={() => setDeleteAccessPointsElements([])}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
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
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
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

                    {/* Checkbox for selecting all rows */}
                    {header.id === "select" && (
                      <Checkbox
                        className="m-1"
                        checked={
                          table.getIsAllPageRowsSelected() ||
                          (table.getIsSomePageRowsSelected() && "indeterminate")
                        }
                        onCheckedChange={(value) => {
                          table.toggleAllPageRowsSelected(!!value);
                          setTimeout(() => {
                            const selectedRows = table
                              .getSelectedRowModel()
                              .rows.map((row) => row.original);
                            setSelectedAccessEntitlements(selectedRows);
                          }, 0);
                        }}
                        aria-label="Select all"
                      />
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
                  className="h-[8.8rem] text-center"
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
                          checked={row.getIsSelected() || false}
                          onCheckedChange={(value) =>
                            row.toggleSelected(!!value)
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
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
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
