// import * as React from "react";
import { tailspin } from "ldrs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import Alert from "@/components/Alert/Alert";

const ManageGlobalConditionsTable = () => {
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
    deleteLogicAndAttributeData,
  } = useAACContext();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState(8);
  // Shadcn Form
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [query, setQuery] = useState({ isEmpty: true, value: "" });
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 7, //default page size
  });
  const [willBeDelete, setWillBeDelete] = useState<
    IManageGlobalConditionLogicExtendTypes[]
  >([]);

  useEffect(() => {
    const selectedRowsData = table
      .getSelectedRowModel()
      .rows.map((row) => row.original as IManageGlobalConditionTypes);
    setSelectedManageGlobalConditionItem(selectedRowsData);
  }, [rowSelection, data]);

  useEffect(() => {
    if (data.length > 0) {
      if (selectedManageGlobalConditionItem.length !== data.length) {
        setIsSelectAll(false);
      } else {
        setIsSelectAll(true);
      }
    }
  }, [selectedManageGlobalConditionItem.length, data.length]);

  // const handleSelectAll = () => {
  //   if (isSelectAll) {
  //     setIsSelectAll(false);
  //     setSelectedManageGlobalConditionItem([]);
  //   } else {
  //     setIsSelectAll(true);
  //     setSelectedManageGlobalConditionItem(data);
  //   }
  // };
  const handleSelectAll = () => {
    // This now directly interacts with react-table's selection
    table.toggleAllRowsSelected(!table.getIsAllRowsSelected());
    setIsSelectAll(!isSelectAll);
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
      getSearchGlobalConditions(page, limit, debouncedQuery);
    } else {
      getlazyLoadingGlobalConditions(page, limit);
    }
    // table.getRowModel().rows.map((row) => row.toggleSelected(false));
    // setSelectedManageGlobalConditionItem([]);
  }, [page, limit, debouncedQuery, stateChange]);

  // loader
  tailspin.register();

  const columns: ColumnDef<IManageGlobalConditionTypes>[] = [
    {
      id: "select",
      cell: ({ row }) => {
        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select all"
            // className="pl-1 m-1"
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name{" "}
            <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("description")}</div>
      ),
    },
    {
      accessorKey: "datasource",
      header: "Datasource",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("datasource")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "*Status",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("status")}</div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    initialState: {
      pagination: {
        pageSize: limit,
      },
    },
  });

  const handleRow = (value: number) => {
    if (value < 1) {
      toast({
        title: "The value must be greater than 0",
        variant: "destructive",
      });
      return;
    } else {
      setLimit(value);
    }
  };

  // const handleRowSelection = (rowData: IManageGlobalConditionTypes) => {
  //   setSelectedManageGlobalConditionItem((prevSelected) => {
  //     if (prevSelected.includes(rowData)) {
  //       // If the id is already selected, remove it
  //       return prevSelected.filter(
  //         (selectedId) =>
  //           selectedId.def_global_condition_id !==
  //           rowData.def_global_condition_id
  //       );
  //     } else {
  //       // If the id is not selected, add it
  //       return [...prevSelected, rowData];
  //     }
  //   });
  // };

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
      // setWillBeDelete((prev) => [...prev, ...results]);
      setWillBeDelete(results);
    } catch (error) {
      console.log("Error Deleting Global model items", error);
    }
  };

  const handleDelete = async () => {
    await Promise.all(
      await willBeDelete.map(async (item) => {
        const res = await deleteLogicAndAttributeData(
          item.def_global_condition_logic_id,
          item.id
        );
        console.log(res, item);
      })
    );
    // for (const item of willBeDelete) {
    //   await deleteLogicAndAttributeData(
    //     item.manage_global_condition_logic_id,
    //     item.id
    //   );
    // }
    await deleteManageGlobalCondition(
      selectedManageGlobalConditionItem[0]?.def_global_condition_id
    );
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

  console.log(selectedManageGlobalConditionItem, "selected Item");

  return (
    <div className="px-3">
      {/* top icon and columns*/}
      <div className="flex gap-3 items-center py-2">
        <div className="flex gap-3">
          <div className="flex gap-3 items-center px-4 py-2 border rounded">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Plus
                    className="cursor-pointer"
                    onClick={() => {
                      setIsOpenManageGlobalConditionModal(true);
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  {selectedManageGlobalConditionItem.length === 1 ? (
                    <FileEdit
                      className="cursor-pointer"
                      onClick={handleEditClick}
                    />
                  ) : (
                    <FileEdit className="cursor-not-allowed text-slate-200" />
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit</p>
                </TooltipContent>
              </Tooltip>
              <Alert
                actionName="delete"
                disabled={selectedManageGlobalConditionItem.length === 0}
                onContinue={handleDelete}
                onClick={handleDeleteCalculate}
                tooltipTitle="Delete"
              >
                <span className="flex flex-col items-start gap-1">
                  {selectedManageGlobalConditionItem.map((globalItem) => (
                    <span
                      className="flex flex-col items-start"
                      key={globalItem.def_global_condition_id}
                    >
                      <span className="capitalize font-medium block">
                        Name : {globalItem.name}
                      </span>
                      <span>
                        {isLoading ? (
                          <span className="block">
                            <l-tailspin
                              size="40"
                              stroke="5"
                              speed="0.9"
                              color="black"
                            ></l-tailspin>
                          </span>
                        ) : (
                          <span>
                            {willBeDelete
                              .filter(
                                (wb) =>
                                  wb.def_global_condition_id ===
                                  globalItem.def_global_condition_id
                              )
                              .map((item, index) => (
                                <span
                                  key={index}
                                  className="capitalize flex items-center text-black"
                                >
                                  {index + 1}. Object - {item.object}, Attribute
                                  - {item.attribute}
                                </span>
                              ))}
                          </span>
                        )}
                      </span>
                    </span>
                  ))}
                </span>
              </Alert>
            </TooltipProvider>
          </div>
        </div>
        <Input
          placeholder="Search by Name"
          value={query.value}
          onChange={(e) => handleQuery(e.target.value)}
          className="w-[24rem] px-4 py-2"
        />
        <div className="flex gap-2 items-center ml-auto">
          <h3>Rows :</h3>
          <input
            type="number"
            placeholder="Rows"
            value={limit}
            min={1}
            onChange={(e) => handleRow(Number(e.target.value))}
            className="w-14 border rounded-md p-2"
          />
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
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
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
                      {/* Example: Checkbox for selecting all rows */}
                      {header.id === "select" && (
                        <Checkbox
                          checked={table.getIsAllRowsSelected()} // Use react-table's method
                          onCheckedChange={() => handleSelectAll()}
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
                  className="h-24 text-center"
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
                      className={`border p-1 h-8 ${
                        index === 0 ? "w-3" : "w-fit"
                      }`}
                    >
                      {index === 0 ? (
                        <Checkbox
                          className="mr-1"
                          checked={row.getIsSelected()} // Use react-table's selection state
                          onCheckedChange={(value) =>
                            row.toggleSelected(!!value)
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
                  className="h-24 text-center"
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
                  className="h-24 text-center"
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
export default ManageGlobalConditionsTable;
