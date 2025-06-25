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
import Alert from "@/components/Alert/Alert";
import ActionButtons from "@/components/ActionButtons/ActionButtons";
import CustomTooltip from "@/components/Tooltip/Tooltip";
import Rows from "@/components/Rows/Rows";

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
  const [selectedIds, setIsSelectedIds] = React.useState<number[]>([]);

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
    const ids = selectedAccessModelItem.map((item) => item.def_access_model_id);
    setIsSelectedIds(ids);
  }, [selectedAccessModelItem.length, data.length]);

  React.useEffect(() => {
    if (debouncedQuery) {
      getSearchAccessModels(page, limit, debouncedQuery);
    } else {
      lazyLoadingDefAccessModels(page, limit);
    }
  }, [page, limit, debouncedQuery, stateChange]);

  const handleSelectAll = () => {
    if (isSelectAll) {
      setIsSelectAll(false);
      setSelectedAccessModelItem([]);
    } else {
      setIsSelectAll(true);
      setSelectedAccessModelItem(data);
    }
  };

  const handleRowSelection = (rowData: IManageAccessModelsTypes) => {
    if (selectedIds.includes(rowData.def_access_model_id)) {
      const filterItem = selectedAccessModelItem.filter(
        (item) => item.def_access_model_id !== rowData.def_access_model_id
      );
      setSelectedAccessModelItem(filterItem);
    } else {
      setSelectedAccessModelItem((prev) => [...prev, rowData]);
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

  // When query changes, reset page to 1
  React.useEffect(() => {
    if (!query.isEmpty) {
      setPage(1);
    }
  }, [query, setPage]);

  ring.register();

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
        <div className="flex gap-3">
          <ActionButtons>
            <CustomTooltip tooltipTitle="Add">
              <Plus
                onClick={() => setIsOpenAddModal(true)}
                className=" cursor-pointer"
              />
            </CustomTooltip>
            <CustomTooltip tooltipTitle="Edit">
              <Edit
                onClick={() =>
                  selectedAccessModelItem.length === 1 &&
                  setIsOpenEditModal(true)
                }
                className={`${
                  selectedAccessModelItem.length === 1
                    ? "text-black cursor-pointer"
                    : "text-slate-200 cursor-not-allowed"
                }`}
              />
            </CustomTooltip>
            <Alert
              actionName="delete"
              disabled={selectedAccessModelItem.length === 0}
              onContinue={handleDelete} // Main delete function
              onClick={handleDeleteCalculate} // Delete calculate function
              tooltipTitle="Delete"
            >
              <span className="flex flex-col items-start gap-1">
                {selectedAccessModelItem.map((modelItem) => (
                  <span key={modelItem.def_access_model_id}>
                    Access Model Name : {modelItem.model_name}
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
                        <span className="flex flex-col items-start">
                          {willBeDelete
                            .filter(
                              (item) =>
                                item.def_access_model_id ===
                                modelItem.def_access_model_id
                            )
                            .map((item, index) => (
                              <span key={index}>
                                {index + 1}. Object - {item.object}, Attribute -{" "}
                                {item.attribute}
                              </span>
                            ))}
                        </span>
                      )}
                    </span>
                  </span>
                ))}
              </span>
            </Alert>
          </ActionButtons>
          <Input
            placeholder="Search Model Name"
            value={query.value}
            onChange={(e) => handleQuery(e.target.value)}
            className="w-[24rem] px-4 py-2 "
          />
        </div>
        {/* Rows and Column */}
        <div className="flex items-center gap-2">
          <Rows limit={limit} setLimit={setLimit} />
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
                          className="m-1"
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
                          className="m-1"
                          checked={selectedIds.includes(
                            row.original.def_access_model_id
                          )}
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
      {/* Pagination and Status */}
      <div className="flex justify-between p-1">
        <div className="flex-1 text-sm text-gray-600">
          {selectedIds.length} of {table.getFilteredRowModel().rows.length}{" "}
          row(s) selected.
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
