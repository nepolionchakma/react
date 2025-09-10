import ActionButtons from "@/components/ActionButtons/ActionButtons";
import Alert from "@/components/Alert/Alert";
import Rows from "@/components/Rows/Rows";
import SearchInput from "@/components/SearchInput/SearchInput";
import CustomTooltip from "@/components/Tooltip/Tooltip";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown, FileEdit, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { columns } from "./Columns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination5 from "@/components/Pagination/Pagination5";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { deleteData, loadData } from "@/Utility/funtion";
import { IManageControlEnvironments } from "@/types/interfaces/manageControlEnvironments.interface";
import AddControlEnvironment from "./AddControlEnvironment";
import { Checkbox } from "@/components/ui/checkbox";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";

const ManageControlEnvironments = () => {
  const { token } = useGlobalContext();
  const [controlEnvironments, setControlEnvironments] = useState<
    IManageControlEnvironments[]
  >([]);
  const [query, setQuery] = useState({ isEmpty: true, value: "" });
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState(8);
  const [totalPage, setTotalPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenAddModal, setIsOpenAddModal] = useState<boolean>(false);
  const [action, setAction] = useState("");
  const [selectedItems, setSelectedItems] = useState<
    IManageControlEnvironments[]
  >([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [selectedIds, setIsSelectedIds] = useState<number[]>([]);
  const [stateChange, setStateChange] = useState(1);

  const table = useReactTable({
    data: controlEnvironments,
    columns,
    columnResizeMode: "onChange",
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
  });

  // default hidden columns
  const hiddenColumns = useMemo(() => ["created_by", "last_updated_by"], []);

  useEffect(() => {
    const selectedRow = table
      .getSelectedRowModel()
      .rows.map((row) => row.original as IManageControlEnvironments);
    setSelectedItems(selectedRow);
  }, [rowSelection, table]);

  useEffect(() => {
    table.getAllColumns().forEach((column) => {
      if (hiddenColumns.includes(column.id)) {
        column.toggleVisibility(false);
      }
    });
  }, [table, hiddenColumns]);

  const fetchControlEnvironments = useCallback(async () => {
    const actionItemsParams = {
      baseURL: FLASK_URL,
      url: `${flaskApi.DefControlEnvironments}?name=${query.value}&page=${page}&limit=${limit}`,
      setLoading: setIsLoading,
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    };
    const res = await loadData(actionItemsParams);
    if (res) {
      setControlEnvironments(res.items);
      setTotalPage(res.pages);
      return res;
    }
  }, [token.access_token, limit, query.value, page]);

  useEffect(() => {
    fetchControlEnvironments();
  }, [fetchControlEnvironments, stateChange]);

  useEffect(() => {
    if (controlEnvironments.length > 0) {
      if (selectedItems.length !== controlEnvironments.length) {
        setIsSelectAll(false);
      } else {
        setIsSelectAll(true);
      }
    }
    const ids = selectedItems.map((item) => item.control_environment_id);
    setIsSelectedIds(ids);
  }, [controlEnvironments.length, selectedItems]);

  const handleSelectAll = () => {
    if (isSelectAll) {
      setIsSelectAll(false);
      setSelectedItems([]);
    } else {
      setIsSelectAll(true);
      setSelectedItems(controlEnvironments);
    }
  };

  const handleRowSelection = (rowData: IManageControlEnvironments) => {
    if (selectedIds.includes(rowData.control_environment_id)) {
      const filterItem = selectedItems.filter(
        (item) => item.control_environment_id !== rowData.control_environment_id
      );
      setSelectedItems(filterItem);
    } else {
      setSelectedItems((prev) => [...prev, rowData]);
    }
  };

  const handleDelete = async () => {
    const dataToDelete = {
      control_environment_ids: selectedItems.map(
        (item) => item.control_environment_id
      ),
    };
    const deleteDataParams = {
      baseURL: FLASK_URL,
      url: flaskApi.DefControlEnvironments,
      payload: dataToDelete,
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
      isToast: true,
    };

    const res = await deleteData(deleteDataParams);
    if (res.status === 200) {
      setSelectedItems([]);
      setStateChange((prev) => prev + Math.random());
    }
  };

  return (
    <div>
      {isOpenAddModal && (
        <AddControlEnvironment
          setOpenAddModal={setIsOpenAddModal}
          action={action}
          selectedItem={selectedItems[0]}
          setSelectedItem={setSelectedItems}
          setStateChange={setStateChange}
        />
      )}
      <div className="flex gap-3 items-center py-2">
        <ActionButtons>
          <CustomTooltip tooltipTitle="Add">
            <Plus
              className="cursor-pointer"
              onClick={() => {
                setIsOpenAddModal(true);
                setAction("Add");
              }}
            />
          </CustomTooltip>
          <CustomTooltip tooltipTitle="Edit">
            <FileEdit
              className={`${
                selectedItems.length === 1
                  ? "text-black cursor-pointer"
                  : "text-slate-200 cursor-not-allowed"
              }`}
              onClick={() => {
                setIsOpenAddModal(true);
                setAction("Edit");
              }}
            />
          </CustomTooltip>
          <Alert
            actionName="delete"
            disabled={selectedItems.length === 0}
            onContinue={() => handleDelete()}
            tooltipTitle="Delete"
          >
            <span className="flex flex-col items-start">
              {selectedItems.map((row, i) => (
                <span
                  key={row.control_environment_id}
                  className="flex flex-col text-black"
                >
                  {i + 1}. Control Environment Name: {row.name}
                </span>
              ))}
            </span>
          </Alert>
        </ActionButtons>
        <SearchInput
          query={query}
          setQuery={setQuery}
          setPage={setPage}
          placeholder="Search Name"
        />
        <div className="flex gap-2 items-center ml-auto">
          <Rows limit={limit} setLimit={setLimit} />
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
      <div className="rounded-md border">
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
                          // width: `${header.getSize()}px`,
                          // maxWidth: header.id === "select" ? "24px" : "",
                          width:
                            header.column.id === "select"
                              ? 24
                              : `${header.getSize()}px`,
                          minWidth:
                            header.column.id === "select"
                              ? 24
                              : header.column.columnDef.minSize,
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
                          width:
                            cell.column.id === "select"
                              ? 24
                              : cell.column.getSize(),
                          minWidth:
                            cell.column.id === "select"
                              ? 24
                              : cell.column.columnDef.minSize,
                        }}
                      >
                        {index === 0 ? (
                          <Checkbox
                            className="mt-1"
                            checked={selectedIds.includes(
                              row.original.control_environment_id
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

          {/* Pagination and Status */}
          <div className="flex justify-between p-1">
            <div className="flex-1 text-sm text-gray-600">
              {selectedIds.length} of {table.getFilteredRowModel().rows.length}{" "}
              row(s) selected.
            </div>
            <Pagination5
              currentPage={page}
              setCurrentPage={setPage}
              totalPageNumbers={totalPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default ManageControlEnvironments;
