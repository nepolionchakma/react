import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { ChevronDown, CircleOff, FileEdit } from "lucide-react";

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
import { columns as getColumns } from "./Columns";
import Pagination5 from "@/components/Pagination/Pagination5";
import { IAsynchronousRequestsAndTaskSchedulesTypes } from "@/types/interfaces/ARM.interface";
import { toast } from "@/components/ui/use-toast";
import { useARMContext } from "@/Context/ARMContext/ARMContext";
import ScheduleATaskComponent from "../TaskRequest/ScheduleATask";
import CustomModal2 from "@/components/CustomModal/CustomModal2";
import PopUp from "./PopUp/PopUp";

export function ViewEditScheduledTasksTable() {
  const {
    totalPage,
    getAsynchronousRequestsAndTaskSchedules,
    getSearchAsynchronousRequestsAndTaskSchedules,
    isLoading,
    setIsLoading,
    cancelScheduledTask,
    changeState,
    setChangeState,
  } = useARMContext();
  const [data, setData] = React.useState<
    IAsynchronousRequestsAndTaskSchedulesTypes[] | []
  >([]);
  const [expandedRow, setExpandedRow] = React.useState<string | null>(null);
  const [viewParameters, setViewParameters] = React.useState("");
  const [clickedRowId, setClickedRowId] = React.useState("");
  const [limit, setLimit] = React.useState<number>(8);
  const [page, setPage] = React.useState<number>(1);
  const [query, setQuery] = React.useState({ isEmpty: true, value: "" });
  const { isOpenModal, setIsOpenModal } = useGlobalContext();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [selected, setSelected] = React.useState<
    IAsynchronousRequestsAndTaskSchedulesTypes[]
  >([]);

  const handleQuery = (e: string) => {
    if (e === "") {
      console.log(e === "");
      setQuery({ isEmpty: true, value: e });
    } else {
      setQuery({ isEmpty: false, value: e });
    }
  };
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (!query.isEmpty) {
          const results = await getSearchAsynchronousRequestsAndTaskSchedules(
            page,
            limit,
            query.value
          );
          if (results) {
            setData(results);
          }
        } else {
          const res = await getAsynchronousRequestsAndTaskSchedules(
            page,
            limit
          );
          if (res) {
            setData(res);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce only when query changes
    const delayDebounce = setTimeout(() => {
      fetchData();
    }, 1000);

    return () => clearTimeout(delayDebounce); // Cleanup timeout
  }, [changeState, query, page, limit]);

  // React.useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       setIsLoading(true);
  //       const res = await getAsynchronousRequestsAndTaskSchedules(page, limit);

  //       if (res) {
  //         setData(res);
  //         setExpandedRow(null);
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   fetchData();
  // }, [changeState, page, limit]);

  const handleRowSelection = (
    rowSelection: IAsynchronousRequestsAndTaskSchedulesTypes
  ) => {
    setSelected((prevSelected) => {
      if (prevSelected.includes(rowSelection)) {
        return prevSelected.filter((item) => item !== rowSelection);
      } else {
        return [...prevSelected, rowSelection];
      }
    });
  };
  const handleCancelSchedule = async () => {
    setIsLoading(true);
    try {
      await cancelScheduledTask(selected);

      //table toggle empty
      table.getRowModel().rows.map((row) => row.toggleSelected(false));
      setSelected([]);
    } catch (error) {
      toast({
        description: `Error : ${error}`,
      });
    } finally {
      setChangeState(Math.random() + 23 * 3000);
      setIsLoading(false);
    }
  };
  const table = useReactTable({
    data,
    columns: getColumns(
      expandedRow,
      setExpandedRow,
      viewParameters,
      setViewParameters,
      clickedRowId,
      setClickedRowId
    ),
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
      pagination: {
        pageSize: limit,
      },
    },
  });
  // default hidden columns
  const hiddenColumns = [
    "redbeat_schedule_name",
    "kwargs",
    "args",
    "created_by",
    "creation_date",
    "last_updated_by",
    "last_update_date",
    "ready_for_redbeat",
    "schedule_type",
    "schedule",
  ];

  React.useEffect(() => {
    table.getAllColumns().forEach((column) => {
      if (hiddenColumns.includes(column.id)) {
        column.toggleVisibility(false);
      }
    });
  }, [table]);

  React.useEffect(() => {
    table.setPageSize(limit);
  }, [limit, table]);

  React.useEffect(() => {
    table.toggleAllPageRowsSelected(false);
    setSelected([]);
  }, [page]);

  const handleOpenModal = (modelName: string) => {
    setIsOpenModal(modelName);
  };
  const handleCloseModal = () => {
    setIsOpenModal(""); // close modal
    setSelected([]);
    //table toggle false
    table.toggleAllRowsSelected(false);
  };

  return (
    <div className="px-3">
      {isOpenModal === "edit_task_schedule" && (
        <CustomModal2>
          <ScheduleATaskComponent
            action="Edit Scheduled Task"
            selected={selected[0]}
            user_schedule_name="run_script"
            handleCloseModal={handleCloseModal}
          />
        </CustomModal2>
      )}
      {viewParameters && (
        <PopUp
          action="Parameters"
          data={viewParameters}
          setData={setViewParameters}
        />
      )}
      {/* top icon and columns*/}
      <div className="flex gap-3 items-center py-2">
        <div className="flex gap-3">
          <div className="flex gap-3 items-center px-4 py-2 border rounded">
            <div className="flex gap-3">
              <button disabled={selected.length > 1 || selected.length === 0}>
                {" "}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <FileEdit
                        className={`${
                          selected.length > 1 || selected.length === 0
                            ? "text-slate-200 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                        onClick={() => handleOpenModal("edit_task_schedule")}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit Schedule Task</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </button>
              {/* delete  */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button disabled={selected.length === 0}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <CircleOff
                            className={`${
                              selected.length === 0
                                ? "cursor-not-allowed text-slate-200"
                                : "cursor-pointer"
                            }`}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Cancel Schedule Task</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel scheduled task?</AlertDialogTitle>
                    <AlertDialogDescription>
                      <>Selected User Task Schedule:</>
                      <br />
                      <br />
                      {selected
                        .filter(
                          (item) => item.cancelled_yn.toLowerCase() !== "y"
                        )
                        .map((item, index) => (
                          <span
                            key={item.def_task_sche_id}
                            className="block text-black"
                          >
                            {index + 1}. User schedule name :{" "}
                            {item.user_schedule_name}
                          </span>
                        ))}
                      <br />
                      This action cannot be undone. This will permanently cancel
                      your scheduled task.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelSchedule}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
        <Input
          placeholder="Filter by task Name"
          value={query.value}
          onChange={(e) => handleQuery(e.target.value)}
          className="max-w-sm px-4 py-2"
        />
        <div className="flex gap-2 items-center ml-auto">
          <h3>Rows :</h3>
          <input
            type="number"
            placeholder="Rows"
            value={limit}
            min={1}
            max={20}
            onChange={(e) => setLimit(Number(e.target.value))}
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
        <div className="max-h-[68vh] overflow-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className={`border border-slate-400 bg-slate-200 p-1 h-9`}
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
                                setSelected(
                                  selectedRows.filter(
                                    (item) =>
                                      item.cancelled_yn.toLowerCase() !== "y"
                                  )
                                );
                              }, 0);
                            }}
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
                    colSpan={getColumns.length}
                    className="h-[25rem] text-center"
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
                table.getRowModel().rows.map((row) => {
                  const isExpanded = expandedRow === row.id;
                  return (
                    <React.Fragment key={row.id}>
                      <TableRow
                        data-state={row.getIsSelected() && "selected"}
                        // aria-disabled={row.original.user_schedule_name === "ad-hoc"}
                      >
                        {row.getVisibleCells().map((cell, index) => (
                          <TableCell key={cell.id} className={`border p-1 h-8`}>
                            {index === 0 ? (
                              <Checkbox
                                disabled={
                                  row.original.cancelled_yn.toLowerCase() ===
                                  "y"
                                }
                                checked={row.getIsSelected()}
                                onCheckedChange={(value) => {
                                  row.toggleSelected(!!value);
                                }}
                                onClick={() => handleRowSelection(row.original)}
                                className="mr-1"
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
                      {isExpanded && (
                        <TableRow className="bg-slate-100">
                          <TableCell
                            colSpan={row.getVisibleCells().length}
                            className="p-1"
                          >
                            <div className="flex gap-10 justify-between p-3 text-sm text-gray-700 w-[20rem] mx-auto">
                              {/* Schedule Type */}
                              <div>
                                <strong>Schedule Type:</strong>
                                <div className="">
                                  {row.original.schedule_type &&
                                    Object.entries(
                                      row.original.schedule_type
                                    ).map(([key, value]) => (
                                      <span className="capitalize " key={key}>
                                        {value.toLowerCase().replace(/_/g, " ")}
                                      </span>
                                    ))}
                                </div>
                              </div>
                              {/* Schedule */}
                              <div>
                                <strong>Schedule:</strong>
                                <div className="flex gap-1">
                                  {row.original.schedule &&
                                    Object.entries(row.original.schedule).map(
                                      ([key, value]) => {
                                        return (
                                          <span
                                            className="capitalize flex flex-col"
                                            key={key}
                                          >
                                            {typeof value !== "object" ? (
                                              <span className="capitalize">
                                                {typeof value === "string"
                                                  ? value.toLowerCase()
                                                  : value}
                                              </span>
                                            ) : (
                                              value?.map((item: string) => (
                                                <span key={item}>
                                                  {item.toLowerCase()}
                                                </span>
                                              ))
                                            )}
                                          </span>
                                        );
                                      }
                                    )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={getColumns.length}
                    className="h-[25rem] text-center"
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
