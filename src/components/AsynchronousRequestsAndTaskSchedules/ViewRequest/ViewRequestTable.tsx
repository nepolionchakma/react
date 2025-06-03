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
import { ChevronDown } from "lucide-react";
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
import { columns as getColumns } from "./Columns";
import Pagination5 from "@/components/Pagination/Pagination5";
import { IARMViewRequestsTypes } from "@/types/interfaces/ARM.interface";
import { useARMContext } from "@/Context/ARMContext/ARMContext";
import PopUp from "./PopUp/PopUp";

export function ViewRequestTable() {
  const {
    totalPage,
    getViewRequests,
    getSearchViewRequests,
    isLoading,
    setIsLoading,
  } = useARMContext();
  const [data, setData] = React.useState<IARMViewRequestsTypes[] | []>([]);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(8);
  const [query, setQuery] = React.useState({ isEmpty: true, value: "" });
  const [expandedRow, setExpandedRow] = React.useState<string | null>(null);
  const [viewParameters, setViewParameters] = React.useState("");
  const [viewResult, setViewResult] = React.useState("");
  const [clickedRowId, setClickedRowId] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

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
  }, [query]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        if (!query.isEmpty) {
          const res = await getSearchViewRequests(page, limit, query.value);
          if (res) {
            setData(res);
            setExpandedRow(null);
          }
        } else {
          const res = await getViewRequests(page, limit);
          if (res) {
            setData(res);
            setExpandedRow(null);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    setIsLoading(true);
    // Debounce only when query changes
    const delayDebounce = setTimeout(() => {
      fetchData();
      table.toggleAllPageRowsSelected(false);
      setRowSelection({});
    }, 1000);

    return () => clearTimeout(delayDebounce); // Cleanup timeout
  }, [query, page, limit]); // Run on query and page change

  const table = useReactTable({
    data,
    columns: getColumns(
      expandedRow,
      setExpandedRow,
      viewParameters,
      setViewParameters,
      viewResult,
      setViewResult,
      clickedRowId,
      setClickedRowId
    ),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: limit,
      },
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Hide default columns
  const hiddenColumns = [
    "redbeat_schedule_name",
    "task_id",
    "args",
    "kwargs",
    "task_name",
    "executor",
    "schedule",
    "schedule_type",
    // "timestamp",
  ];

  React.useEffect(() => {
    table.setPageSize(limit);
  }, [limit, table]);

  React.useEffect(() => {
    table.getAllColumns().forEach((column) => {
      if (hiddenColumns.includes(column.id)) {
        column.toggleVisibility(false);
      }
    });
  }, [table]);

  return (
    <div className="px-3">
      {(viewParameters || viewResult) && (
        <PopUp
          action={viewParameters ? "Parameters" : "Result"}
          data={viewParameters ? viewParameters : viewResult}
          setData={viewParameters ? setViewParameters : setViewResult}
        />
      )}

      {/* Filter + Column Controls */}
      <div className="flex gap-3 items-center py-2">
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
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table Section */}
      <div>
        <div className="max-h-[68vh] overflow-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="border border-slate-400 bg-slate-200 p-1 h-9"
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
                          onCheckedChange={(value) =>
                            table.toggleAllPageRowsSelected(!!value)
                          }
                          className="mr-1"
                          aria-label="Select all"
                        />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={table.getVisibleFlatColumns().length}
                    className="h-[25rem] text-center mx-auto"
                  >
                    <l-tailspin
                      size="40"
                      stroke="5"
                      speed="0.9"
                      color="black"
                    ></l-tailspin>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => {
                  const isExpanded = expandedRow === row.id;
                  // console.log(row.original, "row");
                  return (
                    <React.Fragment key={row.id}>
                      <TableRow data-state={row.getIsSelected() && "selected"}>
                        {row.getVisibleCells().map((cell, index) => (
                          <TableCell key={cell.id} className="border p-1 h-8">
                            {index === 0 ? (
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={row.getIsSelected()}
                                  onCheckedChange={(value) =>
                                    row.toggleSelected(!!value)
                                  }
                                />
                              </div>
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
                                <div className="flex ">
                                  {row.original.schedule_type ? (
                                    <span className="capitalize">
                                      {JSON.parse(
                                        row.original.schedule_type
                                      ).toLowerCase()}
                                    </span>
                                  ) : (
                                    "Null"
                                  )}
                                </div>
                              </div>
                              {/* Schedule */}
                              <div>
                                <strong>Schedule:</strong>
                                <div className="flex gap-1">
                                  {row.original.schedule &&
                                    Object.entries(row.original.schedule).map(
                                      ([key, value]) => (
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
                                      )
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
}
