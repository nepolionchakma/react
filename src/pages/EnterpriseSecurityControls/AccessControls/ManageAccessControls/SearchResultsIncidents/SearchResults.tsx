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
import { ring } from "ldrs";
import columns from "./Columns";
import { useControlsContext } from "@/Context/ManageAccessEntitlements/ManageControlsContext";
import { IControlsTypes } from "@/types/interfaces/manageControls.interface";
import Pagination5 from "@/components/Pagination/Pagination5";
import { toast } from "@/components/ui/use-toast";

const SearchResults = () => {
  const {
    setSelectedControl,
    // fetchControls,
    // controlsData: data,
  } = useControlsContext();
  // const { isLoading, stateChange } = useAACContext();
  const {
    getControls,
    getSearchControls,
    isLoading,
    setIsLoading,
    stateChange,
    totalPages,
  } = useControlsContext();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(8);
  const [data, setData] = React.useState<IControlsTypes[]>([]);
  const [query, setQuery] = React.useState({ isEmpty: true, value: "" });
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        if (!query.isEmpty) {
          const res = await getSearchControls(page, limit, query.value);
          if (res) {
            setData(res);
          }
        } else {
          const res = await getControls(page, limit);
          if (res) {
            setData(res);
          }
          // else {
          //   setPage(page - 1);
          // }
        }
      } catch (error) {
        console.log(error);
      } finally {
        //table toggle false
        table.toggleAllRowsSelected(false);
        // setSelected([]);
      }
    };
    setIsLoading(true);
    const delayDebounce = setTimeout(() => {
      fetchData();
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [page, limit, query]);

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
    if (stateChange) {
      getControls(page, limit);
      table.getRowModel().rows.map((row) => row.toggleSelected(false));
      setSelectedControl([]);
    }
  }, [stateChange]);
  // const data = manageAccessModels ? [...manageAccessModels] : [];
  ring.register();

  // form
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
  const handleRowSelection = (rowData: IControlsTypes) => {
    setSelectedControl((prevSelected) => {
      if (prevSelected.includes(rowData)) {
        // If the id is already selected, remove it
        return prevSelected.filter((selectedId) => selectedId !== rowData);
      } else {
        // If the id is not selected, add it
        return [...prevSelected, rowData];
      }
    });
  };

  // default hidden columns
  const hiddenColumns = [
    "pending_results_count",
    "priority",
    "datasources",
    "control_last_run",
    "control_last_updated",
    "state",
    "result_investigator",
    "authorized_data",
    "revision",
    "revision_date",
    "created_date",
    "created_by",
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
      setPage(1);
    }
  };
  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search Control Name"
            value={query.value}
            onChange={(e) => handleQuery(e.target.value)}
            className="w-[20rem] px-4 py-2"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-2 items-center ml-auto">
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
          </div>
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
                          checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() &&
                              "indeterminate")
                          }
                          onCheckedChange={(value) => {
                            // Toggle all page rows selected
                            table.toggleAllPageRowsSelected(!!value);

                            // Use a timeout to log the selected data
                            setTimeout(() => {
                              const selectedRows = table
                                .getSelectedRowModel()
                                .rows.map((row) => row.original);

                              setSelectedControl(selectedRows);
                            }, 0);
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
                      className="border py-0 p-1"
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.columnDef.minSize,
                      }}
                    >
                      {index === 0 ? (
                        <Checkbox
                          // className="m-1"
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
      {/* Start Pagination */}
      <div className="flex justify-between p-1">
        <div className="flex-1 text-sm text-gray-600">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <Pagination5
          currentPage={page}
          setCurrentPage={setPage}
          totalPageNumbers={totalPages as number}
        />
      </div>
    </div>
  );
};
export default SearchResults;
