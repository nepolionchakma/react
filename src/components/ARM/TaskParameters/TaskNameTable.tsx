import * as React from "react";
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IARMAsynchronousTasksTypes } from "@/types/interfaces/ARM.interface";
import { useARMContext } from "@/Context/ARMContext/ARMContext";
import Pagination5 from "@/components/Pagination/Pagination5";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export const columns: ColumnDef<IARMAsynchronousTasksTypes>[] = [
  {
    id: "select",
    cell: ({ row }) => (
      <Checkbox
        disabled
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "user_task_name",
    header: () => {
      return <div className="min-w-max">User Task Name</div>;
    },
    cell: ({ row }) => <div>{row.getValue("user_task_name")}</div>,
  },
  {
    accessorKey: "task_name",
    header: () => {
      return <div className="min-w-max">Task Name</div>;
    },
    cell: ({ row }) => <div>{row.getValue("task_name")}</div>,
  },
];

export function TaskNameTable() {
  const {
    totalPage,
    isLoading,
    setSelectedTask,
    getAsyncTasksLazyLoading,
    setSelectedTaskParameters,
    getSearchAsyncTasksLazyLoading,
  } = useARMContext();

  const [data, setData] = React.useState<IARMAsynchronousTasksTypes[] | []>([]);
  const [page, setPage] = React.useState<number>(1);
  const limit = 3;
  const [selectedRowId, setSelectedRowId] = React.useState<number>();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

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
  });

  const [query, setQuery] = React.useState({ isEmpty: true, value: "" });
  const handleQuery = (e: string) => {
    if (e === "") {
      setQuery({ isEmpty: true, value: e });
      setPage(1);
    } else {
      setQuery({ isEmpty: false, value: e });
      setPage(1);
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        if (!query.isEmpty) {
          const res = await getSearchAsyncTasksLazyLoading(
            page,
            limit,
            query.value
          );
          if (res) {
            setSelectedRowId("");
            setData(res);
          }
        } else {
          const res = await getAsyncTasksLazyLoading(page, limit);
          if (res) {
            setSelectedRowId("");
            setData(res);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    // Debounce only when query changes
    const delayDebounce = setTimeout(() => {
      fetchData();
      setSelectedTask(undefined);
      setSelectedTaskParameters([]);
      // uncheck checkbox
      table.getRowModel().rows.map((row) => row.toggleSelected(false));
    }, 1000);

    return () => clearTimeout(delayDebounce); // Cleanup timeout
  }, [query, page]);

  const handleRowSelection = (task: IARMAsynchronousTasksTypes) => {
    setSelectedTask((prev) => {
      if (prev?.def_task_id === task.def_task_id) {
        return undefined;
      } else {
        return task;
      }
    });
  };

  return (
    <div className="px-3">
      {/* top icon and columns*/}
      <div className="flex gap-3 items-center py-2">
        <Input
          placeholder="Filter User Task Name"
          value={query.value}
          onChange={(e) => handleQuery(e.target.value)}
          className="max-w-sm px-4 py-2"
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
                          <Checkbox disabled className="mr-1" />
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
                    className="h-[3rem] text-center"
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
                      <TableCell key={cell.id} className="border p-1 h-8 ">
                        {index === 0 ? (
                          <Checkbox
                            className=""
                            checked={row.original.def_task_id === selectedRowId}
                            onCheckedChange={(value) => {
                              console.log(value, row);
                              row.toggleSelected(!!value);
                            }}
                            onClick={() => {
                              setSelectedRowId((prev) => {
                                if (prev === row.original.def_task_id) {
                                  return undefined;
                                } else {
                                  return row.original.def_task_id;
                                }
                              });
                              handleRowSelection(row.original);
                            }}
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
