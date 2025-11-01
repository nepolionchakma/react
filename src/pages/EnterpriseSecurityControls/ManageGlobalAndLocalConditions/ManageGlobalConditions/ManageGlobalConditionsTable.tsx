// import * as React from "react";
import { tailspin } from "ldrs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  ColumnDef,
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
import {
  ArrowUpDown,
  ChevronDown,
  FileEdit,
  Plus,
  // Trash,
} from "lucide-react";

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
  IManageGlobalConditionLogicExtendTypes,
  IManageGlobalConditionTypes,
} from "@/types/interfaces/ManageAccessEntitlements.interface";

import { useAACContext } from "@/Context/ManageAccessEntitlements/AdvanceAccessControlsContext";
import { useEffect, useState } from "react";
import Pagination5 from "@/components/Pagination/Pagination5";
import Alert from "@/components/Alert/Alert";
import ActionButtons from "@/components/ActionButtons/ActionButtons";
import CustomTooltip from "@/components/Tooltip/Tooltip";
import Rows from "@/components/Rows/Rows";
import { convertToTitleCase } from "@/Utility/general";

interface Props {
  globalLimit: number;
  setGlobalLimit: React.Dispatch<React.SetStateAction<number>>;
  selectedGlobalIds: number[];
  setSelecteGlobalIds: React.Dispatch<React.SetStateAction<number[]>>;
}

const ManageGlobalConditionsTable = ({
  globalLimit,
  setGlobalLimit,
  selectedGlobalIds,
  setSelecteGlobalIds,
}: Props) => {
  const {
    isLoading,
    stateChange,
    setIsEditModalOpen,
    setIsOpenManageGlobalConditionModal,
    totalPage,
    getlazyLoadingGlobalConditions,
    getSearchGlobalConditions,
    manageGlobalConditions: data,
    selectedManageGlobalConditionItem,
    setSelectedManageGlobalConditionItem,

    fetchManageGlobalConditionLogics,
    setManageGlobalConditionTopicData,
    manageGlobalConditionDeleteCalculate,
    deleteManageGlobalCondition,
    deleteGlobalLogicAndAttributeData,
    fetchDataSource,
  } = useAACContext();
  const [page, setPage] = useState<number>(1);

  // Shadcn Form
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [query, setQuery] = useState({ isEmpty: true, value: "" });
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSelectAll, setIsSelectAll] = useState(false);

  const [willBeDelete, setWillBeDelete] = useState<
    IManageGlobalConditionLogicExtendTypes[]
  >([]);

  useEffect(() => {
    fetchDataSource();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      if (selectedManageGlobalConditionItem?.length !== data.length) {
        setIsSelectAll(false);
      } else {
        setIsSelectAll(true);
      }
    }
    const ids = selectedManageGlobalConditionItem.map(
      (item) => item.def_global_condition_id
    );
    setSelecteGlobalIds(ids);
  }, [
    selectedManageGlobalConditionItem?.length,
    data.length,
    selectedManageGlobalConditionItem,
    setSelecteGlobalIds,
  ]);

  const handleSelectAll = () => {
    if (isSelectAll) {
      setIsSelectAll(false);
      setSelectedManageGlobalConditionItem([]);
    } else {
      setIsSelectAll(true);
      setSelectedManageGlobalConditionItem(data);
    }
  };

  const handleRowSelection = (rowData: IManageGlobalConditionTypes) => {
    if (selectedGlobalIds.includes(rowData.def_global_condition_id)) {
      const filterItem = selectedManageGlobalConditionItem.filter(
        (item) =>
          item.def_global_condition_id !== rowData.def_global_condition_id
      );
      setSelectedManageGlobalConditionItem(filterItem);
    } else {
      setSelectedManageGlobalConditionItem((prev) => [...prev, rowData]);
    }
  };

  const handleQuery = (e: string) => {
    if (e === "") {
      setQuery({ isEmpty: true, value: e });
      setPage(1);
    } else {
      setQuery({ isEmpty: false, value: e });
      setPage(1);
    }
  };

  useEffect(() => {
    const handleDebounce = setTimeout(() => {
      setDebouncedQuery(query.value);
    }, 1000);

    return () => {
      clearTimeout(handleDebounce);
    };
  }, [query]);

  // When query changes, reset page to 1
  useEffect(() => {
    if (!query.isEmpty) {
      setPage(1);
    }
  }, [query, setPage]);

  useEffect(() => {
    if (debouncedQuery) {
      getSearchGlobalConditions(page, globalLimit, debouncedQuery);
    } else {
      getlazyLoadingGlobalConditions(page, globalLimit);
    }
  }, [page, globalLimit, debouncedQuery, stateChange]);

  // loader
  tailspin.register();

  const columns: ColumnDef<IManageGlobalConditionTypes>[] = [
    {
      id: "select",
      size: 24,
      minSize: 24,
      maxSize: 24,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
    },
    {
      accessorKey: "name",
      enableResizing: true,
      sortingFn: (rowA, rowB, columnId) => {
        const a = rowA.getValue(columnId) as string;
        const b = rowB.getValue(columnId) as string;

        return a.localeCompare(b, undefined, { sensitivity: "base" });
      },
      header: ({ column }) => {
        return (
          <div
            className="flex items-center min-w-max"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name{" "}
            <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize min-w-max">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "description",
      enableResizing: true,
      sortingFn: (rowA, rowB, columnId) => {
        const a = rowA.getValue(columnId) as string;
        const b = rowB.getValue(columnId) as string;

        return a.localeCompare(b, undefined, { sensitivity: "base" });
      },
      header: ({ column }) => {
        return (
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="min-w-[30rem] cursor-pointer"
          >
            Description
            <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
          </div>
        );
      },

      cell: ({ row }) => (
        <div className="capitalize min-w-[30rem]">
          {row.getValue("description")}
        </div>
      ),
    },
    {
      accessorKey: "datasource",
      enableResizing: true,
      sortingFn: (rowA, rowB, columnId) => {
        const a = rowA.getValue(columnId) as string;
        const b = rowB.getValue(columnId) as string;

        return a.localeCompare(b, undefined, { sensitivity: "base" });
      },
      header: ({ column }) => {
        return (
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="min-w-max cursor-pointer"
          >
            Datasource
            <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
          </div>
        );
      },

      cell: ({ row }) => (
        <div className="capitalize min-w-max">{row.getValue("datasource")}</div>
      ),
    },
    {
      accessorKey: "status",
      enableResizing: true,
      sortingFn: (rowA, rowB, columnId) => {
        const a = rowA.getValue(columnId) as string;
        const b = rowB.getValue(columnId) as string;

        return a.localeCompare(b, undefined, { sensitivity: "base" });
      },
      header: ({ column }) => {
        return (
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="min-w-max cursor-pointer"
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
          </div>
        );
      },

      cell: ({ row }) => (
        <div className="capitalize min-w-max">{row.getValue("status")}</div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => String(row.def_global_condition_id),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: 0,
        pageSize: globalLimit,
      },
    },
  });

  // handle delete Calculate
  const handleDeleteCalculate = async () => {
    const results: IManageGlobalConditionLogicExtendTypes[] = [];
    try {
      const deletePromises = selectedManageGlobalConditionItem.map(
        async (item) => {
          if (item.def_global_condition_id) {
            return await manageGlobalConditionDeleteCalculate(
              item.def_global_condition_id
            );
          }
        }
      );

      const responses = await Promise.all(deletePromises);
      responses.forEach((res) => {
        if (Array.isArray(res)) {
          results.push(...res);
        } else if (res !== undefined && res !== null) {
          results.push(res);
        }
      });

      setWillBeDelete((prev) => [...prev, ...results]);
    } catch (error) {
      console.log("Error Deleting Global model items", error);
    }
  };

  const handleDelete = async () => {
    await Promise.all(
      await willBeDelete.map(async (item) => {
        const res = await deleteGlobalLogicAndAttributeData(
          item.def_global_condition_logic_id,
          item.id
        );
        console.log(res, item);
      })
    );
    await deleteManageGlobalCondition(selectedManageGlobalConditionItem);
    table.getRowModel().rows.map((row) => row.toggleSelected(false));
    setSelectedManageGlobalConditionItem([]);
    setWillBeDelete([]);
  };

  const handleEditClick = async () => {
    setIsEditModalOpen(true);
    const fetchData = await fetchManageGlobalConditionLogics(
      selectedManageGlobalConditionItem[0].def_global_condition_id
    );
    setManageGlobalConditionTopicData(fetchData ?? []);
  };

  return (
    <div className="px-3">
      {/* top icon and columns*/}
      <div className="flex gap-3 items-center py-2">
        <ActionButtons>
          <CustomTooltip tooltipTitle="Add">
            <Plus
              className="cursor-pointer"
              onClick={() => {
                setIsOpenManageGlobalConditionModal(true);
              }}
            />
          </CustomTooltip>
          <CustomTooltip tooltipTitle="Edit">
            {selectedManageGlobalConditionItem.length === 1 ? (
              <FileEdit className="cursor-pointer" onClick={handleEditClick} />
            ) : (
              <FileEdit className="cursor-not-allowed text-slate-200" />
            )}
          </CustomTooltip>
          <Alert
            actionName="delete"
            disabled={selectedManageGlobalConditionItem.length === 0}
            onContinue={handleDelete}
            onClick={handleDeleteCalculate}
            tooltipTitle="Delete"
          >
            <span className="flex flex-col items-start gap-1">
              {isLoading ? (
                <span className="w-full h-[10rem] flex items-center justify-center ">
                  <l-tailspin
                    size="40"
                    stroke="5"
                    speed="0.9"
                    color="black"
                  ></l-tailspin>
                </span>
              ) : (
                selectedManageGlobalConditionItem.map((globalItem) => (
                  <span
                    className="flex flex-col items-start"
                    key={globalItem.def_global_condition_id}
                  >
                    <span className="font-medium">
                      Name : {globalItem.name}
                    </span>
                    <span>
                      {willBeDelete
                        .filter(
                          (wb) =>
                            wb.def_global_condition_id ===
                            globalItem.def_global_condition_id
                        )
                        .map((item, index) => (
                          <span key={index} className="flex items-center">
                            {index + 1}. Object - {item.object}, Attribute -{" "}
                            {item.attribute}
                          </span>
                        ))}
                    </span>
                  </span>
                ))
              )}
            </span>
          </Alert>
        </ActionButtons>
        <Input
          placeholder="Search Name"
          value={query.value}
          onChange={(e) => handleQuery(e.target.value)}
          className="w-[24rem] px-4 py-2"
        />
        <div className="flex gap-2 items-center ml-auto">
          <Rows limit={globalLimit} setLimit={setGlobalLimit} />
          {/* Columns */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="max-h-72 overflow-y-auto scrollbar-thin"
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
                      {convertToTitleCase(column.id)}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Table */}
      <div className="rounded-md border">
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
                      {header.id === "select" && (
                        <Checkbox
                          checked={isSelectAll}
                          onClick={handleSelectAll}
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
                          className="mt-1"
                          checked={selectedGlobalIds.includes(
                            row.original.def_global_condition_id
                          )} // Use react-table's selection state
                          onCheckedChange={() =>
                            handleRowSelection(row.original)
                          }
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

        {/* Pagination and Status */}
        <div className="flex justify-between p-1">
          <div className="flex-1 text-sm text-gray-600">
            {selectedGlobalIds.length} of{" "}
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
export default ManageGlobalConditionsTable;
