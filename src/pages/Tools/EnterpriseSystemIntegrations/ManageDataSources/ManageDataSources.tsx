import * as React from "react";
import { tailspin } from "ldrs";

import { Button } from "@/components/ui/button";

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
import { ChevronDown, FileEdit, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import columns from "./Columns";
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
  IDataSourceConnectorProperties,
  IDataSourceTypes,
} from "@/types/interfaces/datasource.interface";
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
import { convertToTitleCase } from "@/Utility/general";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { loadData } from "@/Utility/funtion";
import Modal from "./Modal";

const ManageDataSources = () => {
  const { totalPage, deleteDataSource, getSearchDataSources, token } =
    useGlobalContext();
  const [data, setData] = React.useState<IDataSourceTypes[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [query, setQuery] = React.useState("");
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
  const [connectorProperties, setConnectorProperties] = React.useState<
    undefined | IDataSourceConnectorProperties
  >(undefined);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [isSelectAll, setIsSelectAll] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const results = await getSearchDataSources(page, limit, query);
        if (results) {
          setData(results);
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
    const fetchConnectorProperties = async () => {
      const loadParams = {
        baseURL: FLASK_URL,
        url: `${flaskApi.DatasourceConnectorProperties}?def_data_source_id=${selectedDataSourceItems[0].def_data_source_id}`,
        accessToken: token.access_token,
        setLoading: setIsLoading,
      };

      const res = await loadData(loadParams);
      setConnectorProperties(res.result[0]);
    };
    fetchConnectorProperties();
  }, [selectedDataSourceItems, token.access_token]);

  React.useEffect(() => {
    if (selectedDataSourceItems.length !== data.length || data.length === 0) {
      setIsSelectAll(false);
    } else {
      setIsSelectAll(true);
    }
    const ids = selectedDataSourceItems.map((data) => data.def_data_source_id);
    setSelectedIds(ids);
  }, [selectedDataSourceItems.length, data.length, selectedDataSourceItems]);

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
                    <Modal
                      action="add"
                      maxID={maxID}
                      setSave={setSave}
                      selected={selectedDataSourceItems}
                      setRowSelection={setRowSelection}
                      setSelectedDataSourceItems={setSelectedDataSourceItems}
                      connectorProperties={connectorProperties}
                    />
                  </div>
                  <AlertDialogFooter></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <AlertDialog>
                <AlertDialogTrigger
                  disabled={selectedDataSourceItems.length !== 1 || isLoading}
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
                    <Modal
                      action="update"
                      selected={selectedDataSourceItems}
                      editAble={true}
                      setSave={setSave}
                      setRowSelection={setRowSelection}
                      setSelectedDataSourceItems={setSelectedDataSourceItems}
                      connectorProperties={connectorProperties}
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
          setPage={setPage}
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
