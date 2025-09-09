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
import { loadData } from "@/Utility/funtion";
import { IManageControlEnvironments } from "@/types/interfaces/manageControlEnvironments.interface";

const ManageControlEnvironments = () => {
  const [controlEnvironments, setControlEnvironments] = useState<
    IManageControlEnvironments[]
  >([]);
  const [query, setQuery] = useState({ isEmpty: true, value: "" });
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState(8);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
    table.getAllColumns().forEach((column) => {
      if (hiddenColumns.includes(column.id)) {
        column.toggleVisibility(false);
      }
    });
  }, [table, hiddenColumns]);

  const fetchControlEnvironments = useCallback(async () => {
    const actionItemsParams = {
      baseURL: FLASK_URL,
      url: `${flaskApi.DefControlEnvironments}`,
      setLoading: setIsLoading,
    };
    const res = await loadData(actionItemsParams);
    if (res) {
      setControlEnvironments(res);
      return res;
    }
  }, []);

  useEffect(() => {
    fetchControlEnvironments();
  }, [fetchControlEnvironments]);

  const handleEditClick = () => {
    console.log("clicked edit");
  };

  return (
    <div>
      <div className="flex gap-3 items-center py-2">
        <ActionButtons>
          <CustomTooltip tooltipTitle="Add">
            <Plus
              className="cursor-pointer"
              onClick={() => {
                console.log("Clicked");
              }}
            />
          </CustomTooltip>
          <CustomTooltip tooltipTitle="Edit">
            <FileEdit className="cursor-pointer" onClick={handleEditClick} />
          </CustomTooltip>
          <Alert
            actionName="delete"
            disabled={true}
            onContinue={() => console.log("continue")}
            onClick={() => console.log("clicked")}
            tooltipTitle="Delete"
          >
            <span className="flex flex-col items-start gap-1">
              1. Delete item
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
                    {row.getVisibleCells().map((cell) => (
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
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
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
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <Pagination5
              currentPage={page}
              setCurrentPage={setPage}
              totalPageNumbers={1}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default ManageControlEnvironments;
