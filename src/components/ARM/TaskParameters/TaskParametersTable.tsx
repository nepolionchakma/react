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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      // pagination: {
      //   pageIndex: 0,
      //   pageSize: limit,
      // },
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
    // setSelectedTaskParameters([]);
    //table toggle false
    // table.toggleAllRowsSelected(false);
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
        <CustomModal4 className="w-[770px]">
          <TaskParametersModal
            task_name="Add Parameter"
            selected={selectedTaskParameters[0]}
            handleCloseModal={handleCloseModal}
          />
        </CustomModal4>
      ) : (
        selectedTask?.user_task_name &&
        isOpenModal === "update_task_params" && (
          <CustomModal4 className="w-[770px]">
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
            placeholder="Search by Parameter Name"
            value={
              (table.getColumn("parameter_name")?.getFilterValue() as string) ??
              ""
            }
            onChange={(event) =>
              table
                .getColumn("parameter_name")
                ?.setFilterValue(event.target.value)
            }
            className="w-[24rem] px-4 py-2"
          />
        </div>

        <div className="mx-auto">
          {selectedTask?.def_task_id && (
            <h3>
              Selected:{" "}
              <span className="font-semibold">
                {selectedTask?.user_task_name}
              </span>
            </h3>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* <div className="flex gap-2 items-center ml-auto">
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
          </div> */}
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
                          header.id === "select" && "w-3"
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
                              const selectedRows = table
                                .getSelectedRowModel()
                                .rows.map((row) => row.original);
                              console.log(selectedRows, "aaaaaaaa");
                              handleRowsSelection(data);
                              // setSelected(selectedRows);
                            }}
                            className="mr-1 mt-1"
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
                    className="h-[7rem] text-center"
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
          {/* <Pagination5
            currentPage={page}
            setCurrentPage={setPage}
            totalPageNumbers={totalPage2 as number}
          /> */}
        </div>
      </div>
    </div>
  );
}
