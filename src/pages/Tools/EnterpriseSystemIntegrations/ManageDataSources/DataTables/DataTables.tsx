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
import { ArrowUpDown, ChevronDown } from "lucide-react";
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
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import Rows from "@/components/Rows/Rows";
import { convertToTitleCase, toTitleCase } from "@/Utility/general";
import { FLASK_URL } from "@/Api/Api";
import { loadData } from "@/Utility/funtion";
import Spinner from "@/components/Spinner/Spinner";
import { useEffect, useMemo, useState } from "react";
import Pagination5 from "@/components/Pagination/Pagination5";

interface Props {
  dataTableLimit: number;
  setDataTableLimit: React.Dispatch<React.SetStateAction<number>>;
  dataSourceName: string;
  selectedSchema: string;
  selectedTable: string;
  schemas: string[];
  setSelectedSchema: React.Dispatch<React.SetStateAction<string>>;
  isSchemaLoaded: boolean;
  tables: string[];
  setSelectedTable: React.Dispatch<React.SetStateAction<string>>;
}

type DynamicRow = Record<string, unknown>;

const DataTables = ({
  dataSourceName,
  dataTableLimit,
  setDataTableLimit,
  selectedSchema,
  selectedTable,
  schemas,
  setSelectedSchema,
  isSchemaLoaded,
  tables,
  setSelectedTable,
}: Props) => {
  const { token } = useGlobalContext();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState<DynamicRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  //   const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  //   const [selectedDataTable, setSelectedDataTable] = useState<
  //     IDataTable | undefined
  //   >(undefined);
  const [totalPage, setTotalPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      const response = await loadData({
        baseURL: FLASK_URL,
        url: `table/data?table_name=${selectedTable}&datasource_name=${dataSourceName}&schema=${selectedSchema}&page=${currentPage}&per_page=${dataTableLimit}`,
        accessToken: token.access_token,
        setLoading: setIsLoading,
      });

      if (response) {
        setData(response.result);
        setTotalPage(response.pages);
      }
    };

    fetchData();
  }, [
    dataSourceName,
    selectedTable,
    selectedSchema,
    token.access_token,
    currentPage,
    dataTableLimit,
  ]);

  function generateColumns(data?: Record<string, unknown>[]): ColumnDef<any>[] {
    if (!Array.isArray(data) || data.length === 0) return [];

    const firstRow = data[0];
    if (!firstRow || typeof firstRow !== "object") return [];

    return Object.keys(firstRow).map((key) => ({
      accessorKey: key,

      header: ({ column }) => (
        <div
          className="cursor-pointer capitalize"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {key.replace(/_/g, " ")}
          <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
        </div>
      ),

      cell: ({ row }) => {
        const value = row.getValue(key);

        if (key.toLowerCase().includes("date") && value) {
          return new Date(value as string).toLocaleString();
        }

        return (
          <div className="truncate max-w-[20rem]">
            {value !== null && value !== undefined ? String(value) : "-"}
          </div>
        );
      },

      enableSorting: true,
      enableResizing: true,
    }));
  }

  //   const handleRowSelection = (rowData: IDataTable) => {
  //     setSelectedDataTable(rowData);
  //     //   setDataSourceName(rowData.datasource_name);
  //   };

  const columns = useMemo(() => generateColumns(data), [data]);

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
        pageSize: dataTableLimit,
      },
    },
  });

  useEffect(() => {
    setColumnVisibility({});
  }, [selectedSchema, selectedTable]);

  return (
    <div className="w-full">
      {/* top icon and columns*/}
      <div className="flex items-center justify-between py-2">
        <div className="flex gap-3 items-center">
          <div className="flex gap-3 items-center">
            <label>Schema: </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"outline"} disabled={!isSchemaLoaded}>
                  {selectedSchema ? toTitleCase(selectedSchema) : "Schemas"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="max-h-72 overflow-y-auto scrollbar-thin"
              >
                {schemas?.map((s) => (
                  <DropdownMenuCheckboxItem
                    key={s}
                    className="capitalize"
                    checked={s === selectedSchema}
                    onClick={() => setSelectedSchema(s)}
                  >
                    {convertToTitleCase(s)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-3">
            <label>Table: </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"outline"} disabled={!tables}>
                  {selectedTable ? toTitleCase(selectedTable) : "Tables"}{" "}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="max-h-72 overflow-y-auto scrollbar-thin"
              >
                {tables?.map((t) => (
                  <DropdownMenuCheckboxItem
                    key={t}
                    className="capitalize"
                    checked={t === selectedSchema}
                    onClick={() => setSelectedTable(t)}
                  >
                    {convertToTitleCase(t)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Rows limit={dataTableLimit} setLimit={setDataTableLimit} />
          {/* Columns */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"} className="ml-auto">
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
                  <Spinner color="black" size="40" />
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
                        width: cell.column.getSize(),
                        minWidth: cell.column.columnDef.minSize,
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
                  <Spinner size="40" color="black" />
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

        <div className="flex justify-end p-1">
          <Pagination5
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPageNumbers={totalPage as number}
          />
        </div>
      </div>
    </div>
  );
};

export default DataTables;
