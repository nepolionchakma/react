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
import { ChevronDown, FileEdit, PlusIcon } from "lucide-react";
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
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import columns from "./Columns";
import Pagination5 from "@/components/Pagination/Pagination5";
import { IExecutionMethodsTypes } from "@/types/interfaces/ARM.interface";
import { useARMContext } from "@/Context/ARMContext/ARMContext";
import ExecutionMethodEdit from "../ExecutionMethodEdit/ExecutionMethodEdit";
import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { toast } from "@/components/ui/use-toast";
import Alert from "@/components/Alert/Alert";

export function ManageExecutionMethodsTable() {
  const {
    totalPage,
    getManageExecutionMethodsLazyLoading,
    getSearchManageExecutionMethodsLazyLoading,
    deleteExecutionMethod,
    isLoading,
    setIsLoading,
    changeState,
  } = useARMContext();
  const { isOpenModal, setIsOpenModal } = useGlobalContext();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState<number>(8);
  const [query, setQuery] = React.useState({ isEmpty: true, value: "" });
  const [data, setData] = React.useState<IExecutionMethodsTypes[] | []>([]);

  const handleQuery = (e: string) => {
    if (e === "") {
      setQuery({ isEmpty: true, value: e });
      setPage(1);
    } else {
      setQuery({ isEmpty: false, value: e });
      setPage(1);
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        if (!query.isEmpty) {
          const res = await getSearchManageExecutionMethodsLazyLoading(
            page,
            limit,
            query.value
          );
          if (res) {
            setData(res);
          }
        } else {
          const res = await getManageExecutionMethodsLazyLoading(page, limit);
          if (res) {
            setData(res);
          }
          // else {
          //   setPage(page - 1);
          // }
        }
      } catch (error) {
        console.log(error);
      } finally {
        //table toggle false
        table.toggleAllRowsSelected(false);
        setSelected([]);
      }
    };
    setIsLoading(true);
    const delayDebounce = setTimeout(() => {
      fetchData();
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [changeState, page, limit, query]);

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
      pagination: {
        pageIndex: 0,
        pageSize: limit,
      },
    },
  });
  const handleOpenModal = (modelName: string) => {
    setIsOpenModal(modelName);
  };
  const handleCloseModal = () => {
    setIsOpenModal(""); // close modal
    // setSelected([]);
    //table toggle false
    // table.toggleAllRowsSelected(false);
  };
  // console.log(selected, "selected");
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

  const handleRow = (value: number) => {
    if (value < 1) {
      toast({
        title: "The value must getter than 0",
        variant: "destructive",
      });
      return;
    } else {
      setLimit(value);
      setPage(1);
    }
  };

  return (
    <div className="px-3">
      {isOpenModal === "create_execution_methods" ? (
        <CustomModal4 className="w-[770px]">
          <ExecutionMethodEdit
            action="Add"
            selected={selected}
            handleCloseModal={handleCloseModal}
          />
        </CustomModal4>
      ) : (
        isOpenModal === "edit_execution_methods" && (
          <CustomModal4 className="w-[770px]">
            <ExecutionMethodEdit
              action="Edit"
              selected={selected}
              handleCloseModal={handleCloseModal}
            />
          </CustomModal4>
        )
      )}
      {/* top icon and columns*/}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-2 items-center border p-2 rounded-md">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PlusIcon
                    className="cursor-pointer"
                    onClick={() => handleOpenModal("create_execution_methods")}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add</p>
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
                      onClick={() => handleOpenModal("edit_execution_methods")}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </button>
            <Alert
              disabled={selected.length === 0}
              tooltipTitle="Delete"
              actionName="delete"
              onContinue={() => handleDelete(selected)}
            >
              <span className="flex flex-col items-start">
                <span className="font-semibold block text-black">
                  Selected Execution Method Name
                  {selected.length > 1 ? "'s are" : " is"} :{" "}
                </span>
                {selected.map((row, i) => (
                  <span key={i} className="flex flex-col text-black">
                    {i + 1}. {row.execution_method}
                  </span>
                ))}
              </span>
            </Alert>
          </div>
          <Input
            placeholder="Search by Internal Execution Method"
            value={query.value}
            onChange={(e) => handleQuery(e.target.value)}
            className="w-[20rem] px-4 py-2"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-2 items-center ml-auto">
            <h3>Rows :</h3>
            <input
              type="number"
              placeholder="Rows"
              value={limit}
              min={1}
              // max={20}
              onChange={(e) => handleRow(Number(e.target.value))}
              className="w-14 border rounded p-2"
            />
          </div>
          {/* Columns */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="max-h-72 overflow-y-auto"
            >
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
                        className={`border border-slate-400 bg-slate-200 p-1 h-9 ${
                          header.id === "select" ? "w-6" : ""
                        }`}
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
                            checked={selected.includes(row.original)}
                            // onCheckedChange={(value) =>
                            //   row.toggleSelected(!!value)
                            // }
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
