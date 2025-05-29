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
import { ChevronDown, FileEdit, PlusIcon, Trash } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import columns from "./Columns";
import Pagination5 from "@/components/Pagination/Pagination5";
import { IExecutionMethodsTypes } from "@/types/interfaces/ARM.interface";
import { useARMContext } from "@/Context/ARMContext/ARMContext";
import ExecutionMethodEdit from "../ExecutionMethodEdit/ExecutionMethodEdit";
import CustomModal4 from "@/components/CustomModal/CustomModal4";

export function ManageExecutionMethodsTable() {
  const {
    totalPage,
    getManageExecutionMethodsLazyLoading,
    deleteExecutionMethod,
    isLoading,
    setIsLoading,
    changeState,
  } = useARMContext();
  const { isOpenModal, setIsOpenModal } = useGlobalContext();
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<IExecutionMethodsTypes[] | []>([]);
  const limit = 8;

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getManageExecutionMethodsLazyLoading(page, limit);
        if (res) {
          setData(res);
        } else {
          setPage(page - 1);
        }
        table.toggleAllRowsSelected(false);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [changeState, page]);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [selected, setSelected] = React.useState<IExecutionMethodsTypes[]>([]);
  const handleRowSelection = (rowSelection: IExecutionMethodsTypes) => {
    setSelected((prevSelected) => {
      if (prevSelected.includes(rowSelection)) {
        return prevSelected.filter((item) => item !== rowSelection);
      } else {
        return [...prevSelected, rowSelection];
      }
    });
  };

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
    initialState: {
      columnVisibility: {
        id: false,
      },
      pagination: {
        pageSize: limit,
      },
    },
  });
  const handleOpenModal = (modelName: string) => {
    setIsOpenModal(modelName);
  };
  const handleCloseModal = () => {
    setIsOpenModal(""); // close modal
    setSelected([]);
    //table toggle false
    table.toggleAllRowsSelected(false);
  };

  // default unselect
  const hiddenColumns = [
    "created_by",
    "last_updated_by",
    "creation_date",
    "last_update_date",
    "cancelled_yn",
  ];
  const handleDelete = async (selected: IExecutionMethodsTypes[]) => {
    console.log(selected, "selected");
    try {
      selected.forEach(async (method) => {
        await deleteExecutionMethod(method.internal_execution_method);
      });
    } catch (error) {
      console.log(error);
    }
  };
  React.useEffect(() => {
    table.getAllColumns().forEach((column) => {
      if (hiddenColumns.includes(column.id)) {
        column.toggleVisibility(false);
      }
    });
  }, [table]);
  React.useEffect(() => {
    //table toggle false
    table.toggleAllRowsSelected(false);
    setSelected([]);
  }, [page]);

  return (
    <div className="px-3">
      {isOpenModal === "create_execution_methods" ? (
        <CustomModal4 className="w-[770px]">
          <ExecutionMethodEdit
            action="Create Execution Method"
            selected={selected}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            handleCloseModal={handleCloseModal}
          />
        </CustomModal4>
      ) : (
        isOpenModal === "edit_execution_methods" && (
          <CustomModal4 className="w-[770px]">
            <ExecutionMethodEdit
              action="Edit Execution Method"
              selected={selected}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              handleCloseModal={handleCloseModal}
            />
          </CustomModal4>
        )
      )}
      {/* top icon and columns*/}
      <div className="flex gap-3 items-center py-2">
        <div className="flex gap-3">
          <div className="flex gap-3 items-center px-4 py-2 border rounded">
            <div className="flex gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PlusIcon
                      className="cursor-pointer"
                      onClick={() =>
                        handleOpenModal("create_execution_methods")
                      }
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create Execution Method</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <button disabled={selected.length > 1 || selected.length === 0}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <FileEdit
                        className={`${
                          selected.length > 1 || selected.length === 0
                            ? "text-slate-200 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                        onClick={() =>
                          handleOpenModal("edit_execution_methods")
                        }
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit Execution Method</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Trash
                            className={`${
                              selected.length === 0
                                ? "text-slate-200 cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete Execution Method</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(selected)}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
        <Input
          placeholder="Filter By Execution Method"
          value={
            (table.getColumn("execution_method")?.getFilterValue() as string) ??
            ""
          }
          onChange={(event) =>
            table
              .getColumn("execution_method")
              ?.setFilterValue(event.target.value)
          }
          className="max-w-sm px-4 py-2"
        />
        {/* Columns */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
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
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Table */}
      <div className="rounded-md border">
        <div
        // className="h-[23rem]"
        >
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="border border-slate-400 bg-slate-200 p-1 h-9"
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
                              setTimeout(() => {
                                const selectedRows = table
                                  .getSelectedRowModel()
                                  .rows.map((row) => row.original);
                                setSelected(selectedRows);
                              }, 0);
                            }}
                            className="mr-1"
                            aria-label="Select all"
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
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell, index) => (
                      <TableCell key={cell.id} className="border p-1 h-8">
                        {index === 0 ? (
                          <Checkbox
                            className=""
                            checked={row.getIsSelected()}
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
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
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
}
