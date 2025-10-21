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
import { IARMTaskParametersTypes } from "@/types/interfaces/ARM.interface";
import { useARMContext } from "@/Context/ARMContext/ARMContext";
import TaskParametersModal from "../TaskParametersModal/TaskParametersModal";
import { Input } from "@/components/ui/input";
import Alert from "@/components/Alert/Alert";
import CustomTooltip from "@/components/Tooltip/Tooltip";
import ActionButtons from "@/components/ActionButtons/ActionButtons";
import CustomModal4 from "@/components/CustomModal/CustomModal4";

export function TaskParametersTable() {
  const {
    selectedTask,
    selectedTaskParameters,
    setSelectedTaskParameters,
    getTaskParametersLazyLoading,
    deleteTaskParameters,
    changeState,
  } = useARMContext();
  const [data, setData] = React.useState<IARMTaskParametersTypes[] | []>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const { isOpenModal, setIsOpenModal } = useGlobalContext();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const handleRowSelection = (rowSelection: IARMTaskParametersTypes) => {
    setSelectedTaskParameters((prevSelected) => {
      if (prevSelected.includes(rowSelection)) {
        return prevSelected.filter((item) => item !== rowSelection);
      } else {
        return [...prevSelected, rowSelection];
      }
    });
  };

  const handleRowsSelection = (data: IARMTaskParametersTypes[]) => {
    setSelectedTaskParameters((prev) => {
      const allSelected = data.every((row) =>
        prev.some(
          (selectedRow) => selectedRow.def_param_id === row.def_param_id
        )
      );
      if (allSelected) {
        return [];
      } else {
        return data;
      }
    });
  };

  React.useEffect(() => {
    if (!selectedTask || !selectedTask.task_name) {
      return setData([]);
    }
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await getTaskParametersLazyLoading(selectedTask.task_name);

        if (res) setData(res);
      } catch (error) {
        setData([]);
        console.log(error, "err");
      } finally {
        setIsLoading(false);
        //table toggle false
        table.toggleAllRowsSelected(false);
        setSelectedTaskParameters([]);
      }
    };
    fetchData();
  }, [selectedTask?.def_task_id, changeState]);

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
    },
  });
  // default hidden columns
  const hiddenColumns = [
    "task_name",
    "created_by",
    "last_updated_by",
    "creation_date",
    "last_update_date",
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
  };

  const handleDeleteParameters = async () => {
    try {
      for (const element of selectedTaskParameters) {
        await deleteTaskParameters(element.task_name, element.def_param_id);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSelectedTaskParameters([]);
      table.toggleAllRowsSelected(false);
    }
  };

  return (
    <div className="px-3">
      {selectedTask?.user_task_name && isOpenModal === "add_task_params" ? (
        <CustomModal4 className="w-[60vw]">
          <TaskParametersModal
            task_name="Add Parameter"
            selected={selectedTaskParameters[0]}
            handleCloseModal={handleCloseModal}
          />
        </CustomModal4>
      ) : (
        selectedTask?.user_task_name &&
        isOpenModal === "update_task_params" && (
          <CustomModal4 className="w-[60vw]">
            <TaskParametersModal
              task_name="Edit Parameter"
              selected={selectedTaskParameters[0]}
              handleCloseModal={handleCloseModal}
            />
          </CustomModal4>
        )
      )}
      {/* top icon and columns*/}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <ActionButtons>
            <button disabled={!selectedTask?.def_task_id}>
              <CustomTooltip tooltipTitle="Add">
                <PlusIcon
                  className={`${
                    !selectedTask?.def_task_id
                      ? "text-slate-200 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  onClick={() => handleOpenModal("add_task_params")}
                />
              </CustomTooltip>
            </button>

            <button
              disabled={
                selectedTaskParameters.length > 1 ||
                selectedTaskParameters.length === 0 ||
                !selectedTask?.def_task_id
              }
            >
              <CustomTooltip tooltipTitle="Edit">
                <FileEdit
                  className={`${
                    selectedTaskParameters.length > 1 ||
                    selectedTaskParameters.length === 0
                      ? "text-slate-200 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  onClick={() => handleOpenModal("update_task_params")}
                />
              </CustomTooltip>
            </button>

            <Alert
              disabled={
                selectedTaskParameters.length === 0 ||
                !selectedTask?.def_task_id
              } // disable condition
              tooltipTitle="Delete" // tooltip title
              actionName="delete" // Cancel/Reschedule
              onContinue={handleDeleteParameters} // funtion
            >
              <span className="flex flex-col items-start gap-1">
                {selectedTaskParameters.map((item, i) => (
                  <span key={item.def_param_id}>
                    {i + 1}. Parameter Name : {item.parameter_name}
                  </span>
                ))}
              </span>
            </Alert>
          </ActionButtons>
          <Input
            placeholder="Search Parameter Name"
            value={
              (table.getColumn("parameter_name")?.getFilterValue() as string) ??
              ""
            }
            onChange={(event) =>
              table
                .getColumn("parameter_name")
                ?.setFilterValue(event.target.value)
            }
            className="w-[20rem] px-4 py-2"
          />
        </div>

        <div className="mx-auto">
          {selectedTask?.def_task_id && (
            <h3>
              <span className="font-semibold">
                {selectedTask?.user_task_name}
              </span>
            </h3>
          )}
        </div>

        <div className="flex items-center gap-2">
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
                        className={`relative border h-9 py-0 px-1 border-slate-400 bg-slate-200`}
                        style={{
                          width: `${header.getSize()}px`,
                          maxWidth: header.id === "select" ? "25px" : "",
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {header.id === "select" && (
                          <Checkbox
                            checked={
                              table.getIsAllPageRowsSelected() ||
                              (table.getIsSomePageRowsSelected() &&
                                "indeterminate")
                            }
                            onCheckedChange={(value) => {
                              table.toggleAllPageRowsSelected(!!value);
                              const selectedRows = table
                                .getSelectedRowModel()
                                .rows.map((row) => row.original);
                              console.log(selectedRows, "aaaaaaaa");
                              handleRowsSelection(data);
                            }}
                            aria-label="Select all"
                          />
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
                    className="h-[10rem] text-center"
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
                            className="mt-1"
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
              ) : isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-[10rem] text-center"
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
                    className="h-[10rem] text-center"
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
        </div>
      </div>
    </div>
  );
}
