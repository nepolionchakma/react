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
import { ChevronDown, FileEdit } from "lucide-react";
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
import Alert from "@/components/Alert/Alert";
import ActionButtons from "@/components/ActionButtons/ActionButtons";
import CustomTooltip from "@/components/Tooltip/Tooltip";
import Rows from "@/components/Rows/Rows";

export function ViewEditScheduledTasksTable() {
  const {
    totalPage,
    getAsynchronousRequestsAndTaskSchedules,
    getSearchAsynchronousRequestsAndTaskSchedules,
    isLoading,
    setIsLoading,
    cancelScheduledTask,
    rescheduleTask,
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
    IAsynchronousRequestsAndTaskSchedulesTypes | undefined
  >(undefined);
  // const [selected, setSelected] = React.useState<
  //   IAsynchronousRequestsAndTaskSchedulesTypes[]
  // >([]);

  const handleQuery = (e: string) => {
    if (e === "") {
      console.log(e === "");
      setQuery({ isEmpty: true, value: e });
    } else {
      setQuery({ isEmpty: false, value: e });
    }
  };

  // When query changes, reset page to 1
  React.useEffect(() => {
    if (!query.isEmpty) {
      setPage(1);
    }
  }, [query]);

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

    setIsLoading(true);

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
      if (prevSelected?.def_task_sche_id === rowSelection.def_task_sche_id) {
        return undefined;
      } else {
        return rowSelection;
      }
    });
    // setSelected((prevSelected) => {
    //   if (prevSelected.includes(rowSelection)) {
    //     return prevSelected.filter((item) => item !== rowSelection);
    //   } else {
    //     return [...prevSelected, rowSelection];
    //   }
    // });
  };
  const handleCancelOrRechedule = async () => {
    setIsLoading(true);
    try {
      selected && selected.cancelled_yn === "Y"
        ? await rescheduleTask(selected)
        : await cancelScheduledTask(selected!);

      //table toggle empty
      table.getRowModel().rows.map((row) => row.toggleSelected(false));
      setSelected(undefined);
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
    setSelected(undefined);
  }, [page]);

  const handleOpenModal = (modelName: string) => {
    setIsOpenModal(modelName);
  };
  const handleCloseModal = () => {
    setIsOpenModal("");
  };

  return (
    <div className="px-3">
      {isOpenModal === "edit_task_schedule" && (
        <CustomModal2>
          <ScheduleATaskComponent
            action="Edit Scheduled Task"
            selected={selected}
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
      <div className="flex items-center justify-between py-2">
        <div className="flex gap-3">
          <ActionButtons>
            <CustomTooltip tooltipTitle="Edit">
              <FileEdit
                className={`${
                  !selected
                    ? // selected.length > 1 || selected.length === 0
                      "text-slate-200 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                onClick={() => handleOpenModal("edit_task_schedule")}
              />
            </CustomTooltip>
            <Alert
              disabled={!selected}
              actionName={
                selected?.cancelled_yn.toLowerCase() === "y"
                  ? "reschedule"
                  : "cancel"
              }
              tooltipTitle={
                selected?.cancelled_yn.toLowerCase() === "y"
                  ? "Reschedule"
                  : "Cancel"
              }
              onContinue={handleCancelOrRechedule}
            >
              <span className="flex flex-col items-start">
                <span className="block text-black">
                  Schedule name : {selected?.user_schedule_name}
                </span>
              </span>
            </Alert>
          </ActionButtons>
          <Input
            placeholder="Search by Task Name"
            value={query.value}
            onChange={(e) => handleQuery(e.target.value)}
            className="w-[24rem] px-4 py-2"
          />
        </div>
        <div className="flex gap-2">
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
                                // disabled={
                                //   row.original.cancelled_yn.toLowerCase() ===
                                //   "y"
                                // }
                                checked={
                                  row.original.def_task_sche_id ===
                                  selected?.def_task_sche_id
                                }
                                // onCheckedChange={(value) => {
                                //   ro;
                                //   // row.toggleSelected(!!value);
                                // }}
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
            {selected ? `1` : `0`} of {table.getFilteredRowModel().rows.length}{" "}
            row(s) selected.
            {/* {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected. */}
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
