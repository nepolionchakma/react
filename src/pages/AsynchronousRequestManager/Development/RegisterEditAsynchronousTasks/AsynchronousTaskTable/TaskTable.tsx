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
import { IARMAsynchronousTasksTypes } from "@/types/interfaces/ARM.interface";
import AsynchronousRegisterEditTaskModal from "../AsynchronousRegisterEditTaskModal/AsynchronousRegisterEditTaskModal";
import { useARMContext } from "@/Context/ARMContext/ARMContext";
import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { toast } from "@/components/ui/use-toast";
import Alert from "@/components/Alert/Alert";
import CustomTooltip from "@/components/Tooltip/Tooltip";

export function TaskTable() {
  const {
    totalPage,
    getAsyncTasksLazyLoading,
    getSearchAsyncTasksLazyLoading,
    cancelAsyncTasks,
    isLoading,
    setIsLoading,
    changeState,
  } = useARMContext();
  const { isOpenModal, setIsOpenModal } = useGlobalContext();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(8);
  const [query, setQuery] = React.useState({ isEmpty: true, value: "" });
  const [data, setData] = React.useState<IARMAsynchronousTasksTypes[] | []>([]);
  const handleQuery = (e: string) => {
    if (e === "") {
      setQuery({ isEmpty: true, value: e });
      setPage(1);
    } else {
      setQuery({ isEmpty: false, value: e });
    }
    setPage(1);
  };
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        if (!query.isEmpty) {
          const res = await getSearchAsyncTasksLazyLoading(
            page,
            limit,
            query.value
          );
          if (res) {
            setData(res);
          }
        } else {
          const res = await getAsyncTasksLazyLoading(page, limit);
          if (res) {
            setData(res);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
        //table toggle false
        table.toggleAllRowsSelected(false);
        setSelected(undefined);
      }
    };

    setIsLoading(true);
    // Debounce only when query changes
    const delayDebounce = setTimeout(() => {
      fetchData();
    }, 1000);

    return () => clearTimeout(delayDebounce); // Cleanup timeout
  }, [query, page, changeState, limit]); // Run on query and page change

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [selected, setSelected] = React.useState<
    IARMAsynchronousTasksTypes | undefined
  >(undefined);
  const handleRowSelection = (rowSelection: IARMAsynchronousTasksTypes) => {
    setSelected((prevSelected) => {
      if (prevSelected?.def_task_id === rowSelection.def_task_id) {
        return undefined;
      } else {
        return rowSelection;
      }
      // if (prevSelected.includes(rowSelection)) {
      //   return prevSelected.filter((item) => item !== rowSelection);
      // } else {
      //   return [...prevSelected, rowSelection];
      // }
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

  // default unselect
  const hiddenColumns = [
    "created_by",
    "last_updated_by",
    "creation_date",
    "last_update_date",
    // "cancelled_yn",
    "internal_execution_method",
    "task_name",
  ];

  React.useEffect(() => {
    table.getAllColumns().forEach((column) => {
      if (hiddenColumns.includes(column.id)) {
        column.toggleVisibility(false);
      }
    });
  }, [table]);

  const handleOpenModal = (modelName: string) => {
    setIsOpenModal(modelName);
  };

  const handleCloseModal = () => {
    setIsOpenModal(""); // close modal
    // setSelected(undefined);
    //table toggle false
    // table.toggleAllRowsSelected(false);
  };

  const handleCancel = async (selected: IARMAsynchronousTasksTypes) => {
    try {
      await cancelAsyncTasks(selected.task_name);
      // selected.forEach(async (task) => {
      //   await cancelAsyncTasks(task.task_name);
      // });
    } catch (error) {
      console.log(error);
    }
  };

  const handleRow = (value: number) => {
    if (value < 1) {
      toast({
        title: "The value must be greater than 0",
        variant: "destructive",
      });
      return;
    } else {
      setLimit(value);
      setPage(1);
    }
  };
  const inputRef = React.useRef(null);

  const handleClick = () => {
    if (inputRef.current) {
      (inputRef.current as HTMLInputElement).select();
    }
  };

  return (
    <div className="px-3">
      {isOpenModal === "register_task" ? (
        <CustomModal4 className="w-[770px]">
          <AsynchronousRegisterEditTaskModal
            task_name="Register"
            selected={selected!}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            handleCloseModal={handleCloseModal}
          />
        </CustomModal4>
      ) : (
        isOpenModal === "edit_task" && (
          <CustomModal4 className="w-[770px]">
            <AsynchronousRegisterEditTaskModal
              task_name="Edit"
              selected={selected!}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              handleCloseModal={handleCloseModal}
            />
          </CustomModal4>
        )
      )}
      {/* top icon and columns*/}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-2 items-center border p-2 rounded-md">
            {/* Add  */}
            <CustomTooltip tooltipTitle="Register">
              <PlusIcon
                className="cursor-pointer"
                onClick={() => handleOpenModal("register_task")}
              />
            </CustomTooltip>
            {/* Edit  */}
            <button disabled={!selected}>
              <CustomTooltip tooltipTitle="Edit">
                <FileEdit
                  className={`${
                    !selected
                      ? "text-slate-200 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  onClick={() => handleOpenModal("edit_task")}
                />
              </CustomTooltip>
            </button>
            {/* Delete  */}
            <Alert
              disabled={
                !selected || selected?.cancelled_yn.toLocaleLowerCase() === "y"
              }
              tooltipTitle="Cancel"
              actionName="cancel"
              onContinue={() => handleCancel(selected!)}
            >
              <span className="block text-center text-black">
                Task name - {selected?.task_name}
              </span>
            </Alert>
          </div>
          {/* Search  */}
          <Input
            placeholder="Search by User Task Name"
            value={query.value}
            ref={inputRef}
            onClick={handleClick}
            onChange={(e) => handleQuery(e.target.value)}
            className="w-[24rem] px-4 py-2"
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
              ref={inputRef}
              onClick={handleClick}
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
        <div className=" ">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className={`border border-slate-400 bg-slate-200 p-1 h-9 items-center ${
                          header.id === "select" && "w-6"
                        }`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
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
                            className="mr-1"
                            checked={row.getIsSelected()}
                            onCheckedChange={(value) => {
                              if (value) {
                                // Select only the current row (deselect others)
                                table.setRowSelection({ [row.id]: true });
                              } else {
                                // Deselect current row
                                table.setRowSelection({});
                              }
                            }}
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
            {/* {!selected?.def_task_id ? 0 : 1} of{" "} */}
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
