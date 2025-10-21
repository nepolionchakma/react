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
import Alert from "@/components/Alert/Alert";
import CustomTooltip from "@/components/Tooltip/Tooltip";
import ActionButtons from "@/components/ActionButtons/ActionButtons";
import Rows from "@/components/Rows/Rows";

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
    columnResizeMode: "onChange",
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
          <ActionButtons>
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
              <span>Task name: {selected?.task_name}</span>
            </Alert>
          </ActionButtons>
          {/* Search  */}
          <Input
            placeholder="Search User Task Name"
            value={query.value}
            onChange={(e) => handleQuery(e.target.value)}
            className="w-[20rem] px-4 py-2"
          />
        </div>
        <div className="flex items-center gap-2">
          <Rows limit={limit} setLimit={setLimit} />
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
        <div>
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
              ) : isLoading ? (
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
