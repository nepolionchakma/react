import * as React from "react";
import { tailspin } from "ldrs";

import { Button } from "@/components/ui/button";

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
import { ArrowUpDown, ChevronDown, FileEdit, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
import DataSourceDataAdd from "@/components/DataSourceDataAdd/DataSourceDataAdd";
import { IDataSourceTypes } from "@/types/interfaces/datasource.interface";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import Pagination5 from "@/components/Pagination/Pagination5";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Alert from "@/components/Alert/Alert";
import Rows from "@/components/Rows/Rows";
import SearchInput from "@/components/SearchInput/SearchInput";

const ManageDataSources = () => {
  const {
    fetchDataSources,
    totalPage,
    deleteDataSource,
    getSearchDataSources,
  } = useGlobalContext();
  const [data, setData] = React.useState<IDataSourceTypes[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [query, setQuery] = React.useState({ isEmpty: true, value: "" });
  const [save, setSave] = React.useState<number>(0);
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(8);
  // loader
  tailspin.register();
  // Shadcn Form
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const [rowSelection, setRowSelection] = React.useState({});

  const [selectedDataSourceItems, setSelectedDataSourceItems] = React.useState<
    IDataSourceTypes[]
  >([]);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [isSelectAll, setIsSelectAll] = React.useState(false);

  // When query changes, reset page to 1
  React.useEffect(() => {
    if (!query.isEmpty) {
      setPage(1);
    }
  }, [query]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (!query.isEmpty) {
          const results = await getSearchDataSources(page, limit, query.value);
          if (results) {
            setData(results);
          }
        } else {
          const res = await fetchDataSources(page, limit);
          if (res) {
            setData(res);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    setIsLoading(true);
    // Debounce only when query changes
    const delayDebounce = setTimeout(() => {
      fetchData();
    }, 1000);

    return () => clearTimeout(delayDebounce); // Cleanup timeout
  }, [query, page, save, limit]);

  React.useEffect(() => {
    if (selectedDataSourceItems.length !== data.length || data.length === 0) {
      setIsSelectAll(false);
    } else {
      setIsSelectAll(true);
    }
    const ids = selectedDataSourceItems.map((data) => data.def_data_source_id);
    setSelectedIds(ids);
  }, [selectedDataSourceItems.length, data.length]);

  // select row

  const handleSelectAll = () => {
    if (isSelectAll) {
      setIsSelectAll(false);
      setSelectedDataSourceItems([]);
    } else {
      setIsSelectAll(true);
      setSelectedDataSourceItems(data);
    }
  };

  const handleRowSelection = (rowData: IDataSourceTypes) => {
    if (selectedIds.includes(rowData.def_data_source_id)) {
      const selectedData = selectedDataSourceItems.filter(
        (data) => data.def_data_source_id !== rowData.def_data_source_id
      );
      setSelectedDataSourceItems(selectedData);
    } else {
      setSelectedDataSourceItems((prev) => [...prev, rowData]);
    }
  };

  const columns: ColumnDef<IDataSourceTypes>[] = [
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
      accessorKey: "datasource_name",
      enableResizing: true,
      sortingFn: (rowA, rowB, columnId) => {
        const a = rowA.getValue(columnId) as string;
        const b = rowB.getValue(columnId) as string;

        return a.localeCompare(b, undefined, { sensitivity: "base" });
      },
      header: ({ column }) => {
        return (
          <div
            className="min-w-max"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Datasource Name{" "}
            <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
          </div>
        );
      },

      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("datasource_name")}</div>
      ),
    },
    {
      accessorKey: "description",
      sortingFn: (rowA, rowB, columnId) => {
        const a = rowA.getValue(columnId) as string;
        const b = rowB.getValue(columnId) as string;

        return a.localeCompare(b, undefined, { sensitivity: "base" });
      },
      header: ({ column }) => {
        return (
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="min-w-[20rem] cursor-pointer"
          >
            Description
            <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
          </div>
        );
      },

      enableResizing: true,
      cell: ({ row }) => (
        <div className="capitalize min-w-[20rem]">
          {row.getValue("description")}
        </div>
      ),
    },
    {
      accessorKey: "application_type",
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
            Application Type
            <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
          </div>
        );
      },

      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("application_type")}</div>
      ),
    },
    {
      accessorKey: "application_type_version",
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
            Application Type Version
            <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue("application_type_version")}
        </div>
      ),
    },
    {
      accessorKey: "last_access_synchronization_date",
      enableResizing: true,
      sortingFn: (rowA, rowB, columnId) => {
        const a = new Date(rowA.getValue(columnId));
        const b = new Date(rowB.getValue(columnId));
        return a.getTime() - b.getTime();
      },
      header: ({ column }) => {
        return (
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="min-w-max cursor-pointer"
          >
            Last Access Synchronization Date
            <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
          </div>
        );
      },
      cell: ({ row }) => {
        const date = new Date(
          row.getValue("last_access_synchronization_date")
        ).toLocaleString();

        return <div className="capitalize">{date}</div>;
      },
    },
    {
      accessorKey: "last_access_synchronization_status",
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
            Last Access Synchronization Status
            <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue("last_access_synchronization_status")}
        </div>
      ),
    },
    {
      accessorKey: "last_transaction_synchronization_date",
      enableResizing: true,
      sortingFn: (rowA, rowB, columnId) => {
        const a = new Date(rowA.getValue(columnId));
        const b = new Date(rowB.getValue(columnId));
        return a.getTime() - b.getTime();
      },
      header: ({ column }) => {
        return (
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="min-w-max cursor-pointer"
          >
            Last Transaction Synchronization Date
            <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
          </div>
        );
      },
      cell: ({ row }) => {
        const date = new Date(
          row.getValue("last_transaction_synchronization_date")
        ).toLocaleString();

        return <div className="capitalize">{date}</div>;
      },
    },
    {
      accessorKey: "last_transaction_synchronization_status",
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
            Last Transaction Synchronization Status
            <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue("last_transaction_synchronization_status")}
        </div>
      ),
    },
    {
      accessorKey: "default_datasource",
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
            Default Datasource
            <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("default_datasource")}</div>
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

  // Hide default columns
  const hiddenColumns = [
    "last_access_synchronization_status",
    "last_transaction_synchronization_status",
    "last_transaction_synchronization_date",
    "default_datasource",
  ];

  React.useEffect(() => {
    table.getAllColumns().forEach((column) => {
      if (hiddenColumns.includes(column.id)) {
        column.toggleVisibility(false);
      }
    });
  }, [table]);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      setRowSelection({});
      setSelectedDataSourceItems([]);
      // Iterate through the selected IDs and delete them one by one
      for (const data of selectedDataSourceItems) {
        await deleteDataSource(data.def_data_source_id);
      }
      // Update the `save` state to trigger data re-fetching
      setSave((prevSave) => prevSave + 1);
    } catch (error) {
      console.error("Error deleting data sources:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const maxID =
    data.length > 0
      ? Math.max(...data.map((item) => item.def_data_source_id))
      : 0;

  return (
    <div className="w-full">
      {/* top icon and columns*/}
      <div className="flex gap-3 items-center py-2">
        <div className="flex gap-3">
          <div className="flex gap-3 px-4 py-2 border rounded">
            <TooltipProvider>
              <AlertDialog>
                <AlertDialogTrigger>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Plus className="cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add</p>
                    </TooltipContent>
                  </Tooltip>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-slate-300">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Add Datasource</AlertDialogTitle>
                    <AlertDialogDescription></AlertDialogDescription>
                  </AlertDialogHeader>
                  <div>
                    <DataSourceDataAdd
                      props="add"
                      maxID={maxID}
                      setSave={setSave}
                      selected={selectedDataSourceItems}
                      setRowSelection={setRowSelection}
                      setSelectedDataSourceItems={setSelectedDataSourceItems}
                    />
                  </div>
                  <AlertDialogFooter></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <AlertDialog>
                <AlertDialogTrigger
                  disabled={selectedDataSourceItems.length !== 1}
                  className={`${
                    selectedDataSourceItems.length !== 1 &&
                    "text-slate-200 cursor-not-allowed"
                  }`}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <FileEdit
                        className={`${
                          selectedDataSourceItems.length === 1
                            ? "cursor-pointer"
                            : "cursor-not-allowed"
                        }`}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit</p>
                    </TooltipContent>
                  </Tooltip>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-slate-300">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Edit Datasource</AlertDialogTitle>
                    <AlertDialogDescription></AlertDialogDescription>
                  </AlertDialogHeader>
                  <div>
                    <DataSourceDataAdd
                      props="update"
                      selected={selectedDataSourceItems}
                      editAble={true}
                      setSave={setSave}
                      setRowSelection={setRowSelection}
                      setSelectedDataSourceItems={setSelectedDataSourceItems}
                    />
                  </div>
                </AlertDialogContent>
              </AlertDialog>
              <Alert
                actionName="delete"
                disabled={selectedDataSourceItems.length < 1}
                onContinue={handleDelete}
                tooltipTitle="Delete"
              >
                <>
                  <span className="flex flex-col items-start">
                    {selectedDataSourceItems.map((row, i) => (
                      <span
                        key={row.def_data_source_id}
                        className="flex flex-col text-black"
                      >
                        {i + 1}. Datasource Name: {row.datasource_name}
                      </span>
                    ))}
                  </span>
                </>
              </Alert>
            </TooltipProvider>
          </div>
        </div>
        <SearchInput
          placeholder="Search Datasource Name"
          query={query}
          setQuery={setQuery}
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
                          checked={selectedIds.includes(
                            row.original.def_data_source_id
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
      {/* Start Pagination */}
    </div>
  );
};
export default ManageDataSources;
