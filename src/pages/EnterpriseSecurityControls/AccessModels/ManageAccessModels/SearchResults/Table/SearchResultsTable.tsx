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
import { ChevronDown, Edit, Plus } from "lucide-react";
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
  IManageAccessModelLogicExtendTypes,
  IManageAccessModelsTypes,
} from "@/types/interfaces/ManageAccessEntitlements.interface";
import { useAACContext } from "@/Context/ManageAccessEntitlements/AdvanceAccessControlsContext";

import { ring } from "ldrs";
import AddModel from "../AddModel";
import EditModel from "../EditModel";
import columns from "./Columns";
import Pagination5 from "@/components/Pagination/Pagination5";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import Alert from "@/components/Alert/Alert";

const SearchResultsTable = () => {
  const {
    isLoading,
    selectedAccessModelItem,
    setSelectedAccessModelItem,
    stateChange,
    lazyLoadingDefAccessModels,
    getSearchAccessModels,
    manageAccessModels: data,
    deleteDefAccessModel,
    manageAccessModelLogicsDeleteCalculate,
    deleteManageModelLogicAndAttributeData,
    page,
    setPage,
    totalPage,
    limit,
    setLimit,
  } = useAACContext();

  const [isOpenAddModal, setIsOpenAddModal] = React.useState<boolean>(false);
  const [isOpenEditModal, setIsOpenEditModal] = React.useState<boolean>(false);
  const [willBeDelete, setWillBeDelete] = React.useState<
    IManageAccessModelLogicExtendTypes[]
  >([]);

  // form
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [query, setQuery] = React.useState({ isEmpty: true, value: "" });
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [isSelectAll, setIsSelectAll] = React.useState(false);
  // const [pagination, setPagination] = React.useState({
  //   pageIndex: 0, //initial page index
  //   pageSize: 5, //default page size
  // });

  React.useEffect(() => {
    const selectedRow = table
      .getSelectedRowModel()
      .rows.map((row) => row.original as IManageAccessModelsTypes);
    setSelectedAccessModelItem(selectedRow);
  }, [rowSelection, data]);

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
      pagination: {
        pageSize: limit,
      },
    },
  });

  React.useEffect(() => {
    const handleDebounce = setTimeout(() => {
      setDebouncedQuery(query.value);
    }, 1000);

    return () => {
      clearTimeout(handleDebounce);
    };
  }, [query]);

  React.useEffect(() => {
    if (data.length > 0) {
      if (selectedAccessModelItem.length !== data.length) {
        setIsSelectAll(false);
      } else {
        setIsSelectAll(true);
      }
    }
  }, [selectedAccessModelItem.length, data.length]);

  React.useEffect(() => {
    if (debouncedQuery) {
      getSearchAccessModels(page, limit, debouncedQuery);
    } else {
      lazyLoadingDefAccessModels(page, limit);
    }
  }, [page, limit, debouncedQuery, stateChange]);

  const handleSelectAll = () => {
    table.toggleAllRowsSelected(!table.getIsAllRowsSelected());
    setIsSelectAll(!isSelectAll);
    // if (isSelectAll) {
    //   setIsSelectAll(false);
    //   setSelectedAccessModelItem([]);
    // } else {
    //   setIsSelectAll(true);
    //   setSelectedAccessModelItem(data);
    // }
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

  // When query changes, reset page to 1
  React.useEffect(() => {
    if (!query.isEmpty) {
      setPage(1);
    }
  }, [query, setPage]);

  // React.useEffect(() => {
  //   fetchDefAccessModels();
  //   table.getRowModel().rows.map((row) => row.toggleSelected(false));
  //   setSelectedAccessModelItem([]);
  // }, [stateChange]);
  // const data = manageAccessModels ? [...manageAccessModels] : [];
  ring.register();

  // const handleRowSelection = (rowData: IManageAccessModelsTypes) => {
  //   setSelectedAccessModelItem((prevSelected) => {
  //     if (prevSelected.includes(rowData)) {
  //       // If the id is already selected, remove it
  //       return prevSelected.filter((selectedId) => selectedId !== rowData);
  //     } else {
  //       // If the id is not selected, add it
  //       return [...prevSelected, rowData];
  //     }
  //   });
  // };

  const handleDeleteCalculate = async () => {
    const results: IManageAccessModelLogicExtendTypes[] = [];

    try {
      const deletePromises = selectedAccessModelItem.map(async (item) => {
        if (item.def_access_model_id) {
          return await manageAccessModelLogicsDeleteCalculate(
            item?.def_access_model_id
          );
        }
      });

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
      console.error("Error deleting access model items:", error);
    }
  };

  const handleDelete = async () => {
    await Promise.all(
      await willBeDelete.map(async (item) => {
        await deleteManageModelLogicAndAttributeData(
          item.def_access_model_logic_id,
          item.id
        );
      })
    );
    await deleteDefAccessModel(selectedAccessModelItem);
    table.getRowModel().rows.map((row) => row.toggleSelected(false));
    setSelectedAccessModelItem([]);
    setWillBeDelete([]);
  };
  // default hidden columns
  const hiddenColumns = [
    "redbeat_schedule_name",
    "task_id",
    "args",
    "kwargs",
    "last_updated_date",
    "revision_date",
  ];

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
        title: "The value must be greater than 0",
        variant: "destructive",
      });
      return;
    } else {
      setLimit(value);
    }
  };

  return (
    <div className="w-full">
      {isOpenAddModal && (
        <AddModel items={data} setOpenAddModal={setIsOpenAddModal} />
      )}
      {isOpenEditModal && (
        <EditModel
          setOpenEditModal={setIsOpenEditModal}
          isOpenEditModal={isOpenEditModal}
        />
      )}

      <div className="flex items-center justify-between py-4 ">
        {/* create, edit, delete and search by name  */}
        <div className="flex items-center gap-2">
          <div className="flex gap-2 items-center mx-2 border p-1 rounded-md">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Plus
                    onClick={() => setIsOpenAddModal(true)}
                    className="hover:scale-110 duration-300 cursor-pointer"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Edit
                    onClick={() =>
                      selectedAccessModelItem.length === 1 &&
                      setIsOpenEditModal(true)
                    }
                    className={`hover:scale-110 duration-300 ${
                      selectedAccessModelItem.length === 1
                        ? "text-black cursor-pointer"
                        : "text-slate-200 cursor-not-allowed"
                    }`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit</p>
                </TooltipContent>
              </Tooltip>

              <Alert
                actionName="delete"
                disabled={selectedAccessModelItem.length === 0}
                onContinue={handleDelete} // Main delete function
                onClick={handleDeleteCalculate} // Delete calculate function
                tooltipTitle="Delete"
              >
                <>
                  {selectedAccessModelItem.map((modelItem) => (
                    <span key={modelItem.def_access_model_id}>
                      <span className="capitalize mt-3 font-medium block">
                        ACCESS_MODEL_NAME : {modelItem.model_name}
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
                                (item) =>
                                  item.def_access_model_id ===
                                  modelItem.def_access_model_id
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
                </>
              </Alert>
            </TooltipProvider>
          </div>
          <Input
            placeholder="Search by Model Name"
            value={query.value}
            onChange={(e) => handleQuery(e.target.value)}
            className="max-w-sm h-8"
          />
        </div>
        {/* Rows and Column */}
        <div className="flex items-center gap-2">
          <div className="flex gap-2 items-center ml-auto">
            <h3>Rows :</h3>
            <input
              type="number"
              placeholder="Rows"
              value={limit}
              min={1}
              onChange={(e) => handleRow(Number(e.target.value))}
              className="w-14 h-8 border rounded-lg p-2"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto h-8">
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
                          checked={table.getIsAllRowsSelected()}
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
                    <TableCell key={cell.id} className="border p-0 w-fit h-9">
                      {index === 0 ? (
                        <Checkbox
                          className="m-1"
                          checked={row.getIsSelected()}
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
      </div>
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
  );
};
export default SearchResultsTable;
