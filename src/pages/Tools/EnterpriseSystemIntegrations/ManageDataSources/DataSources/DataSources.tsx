import * as React from "react";
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
import Alert from "@/components/Alert/Alert";
import Rows from "@/components/Rows/Rows";
import SearchInput from "@/components/SearchInput/SearchInput";
import { convertToTitleCase } from "@/Utility/general";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { deleteData, loadData } from "@/Utility/funtion";
import Modal from "./Modal";
import Spinner from "@/components/Spinner/Spinner";
import ActionButtons from "@/components/ActionButtons/ActionButtons";
import CustomTooltip from "@/components/Tooltip/Tooltip";

interface Props {
  dataSourceLimit: number;
  setDataSourceLimit: React.Dispatch<React.SetStateAction<number>>;
  setDataSourceName: React.Dispatch<React.SetStateAction<string>>;
}

const DataSources = ({
  dataSourceLimit,
  setDataSourceLimit,
  setDataSourceName,
}: Props) => {
  const { token } = useGlobalContext();
  const [data, setData] = React.useState<IDataSourceTypes[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [query, setQuery] = React.useState("");
  const [save, setSave] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [totalPage, setTotalPage] = React.useState<number>(1);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [openModal, setOpenModal] = React.useState(false);
  const [action, setAction] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const [rowSelection, setRowSelection] = React.useState({});
  const [disableEdit, setDisaleEdit] = React.useState(false);

  const [selectedDataSourceItem, setSelectedDataSourceItem] = React.useState<
    IDataSourceTypes | undefined
  >(undefined);
  const [connectorProperties, setConnectorProperties] = React.useState<
    undefined | IDataSourceConnectorProperties
  >(undefined);

  React.useEffect(() => {
    const fetchData = async () => {
      const response = await loadData({
        baseURL: FLASK_URL,
        url: `${flaskApi.DefDataSources}?datasource_name=${query}&page=${currentPage}&limit=${dataSourceLimit}`,
        accessToken: token.access_token,
        setLoading: setIsLoading,
      });

      if (response) {
        setData(response.result);
        setTotalPage(response.pages);
        setCurrentPage(response.page);
      }
    };

    // Debounce only when query changes
    const delayDebounce = setTimeout(() => {
      fetchData();
    }, 1000);

    return () => clearTimeout(delayDebounce); // Cleanup timeout
  }, [query, save, dataSourceLimit, currentPage, token.access_token]);

  React.useEffect(() => {
    const fetchConnectorProperties = async () => {
      const loadParams = {
        baseURL: FLASK_URL,
        url: `${flaskApi.DatasourceConnectorProperties}?def_data_source_id=${selectedDataSourceItem?.def_data_source_id}`,
        accessToken: token.access_token,
        setLoading: setDisaleEdit,
      };

      const res = await loadData(loadParams);
      setConnectorProperties(res.result[0]);
    };
    fetchConnectorProperties();
  }, [selectedDataSourceItem, token.access_token]);

  const handleRowSelection = (rowData: IDataSourceTypes) => {
    setSelectedDataSourceItem(rowData);
    setDataSourceName(rowData.datasource_name);
  };

  const handleAdd = () => {
    setAction("add");
    setOpenModal(true);
  };
  const handleEdit = () => {
    setAction("edit");
    setOpenModal(true);
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
        pageSize: dataSourceLimit,
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
    const res = await deleteData({
      baseURL: FLASK_URL,
      url: `${flaskApi.DefDataSources}?def_data_source_id=${selectedDataSourceItem?.def_data_source_id}`,
      accessToken: token.access_token,
      isToast: true,
      setLoading: setIsLoading,
    });

    if (res.status === 200) {
      setSave((prevSave) => prevSave + 1);
    }
  };

  return (
    <div className="w-full">
      {/* top icon and columns*/}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <ActionButtons>
            {/* Edit  */}
            <button>
              <CustomTooltip tooltipTitle="Add">
                <Plus className="cursor-pointer" onClick={handleAdd} />
              </CustomTooltip>
            </button>
            <button disabled={!selectedDataSourceItem && disableEdit}>
              <CustomTooltip tooltipTitle="Edit">
                <FileEdit
                  className={`${
                    !selectedDataSourceItem
                      ? "text-slate-200 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  onClick={handleEdit}
                />
              </CustomTooltip>
            </button>
            <Alert
              disabled={!selectedDataSourceItem}
              actionName="delete"
              onContinue={handleDelete}
              tooltipTitle="Delete"
            >
              <>
                <span>
                  Data Source Name : {selectedDataSourceItem?.datasource_name}
                </span>
              </>
            </Alert>
          </ActionButtons>

          {/* Search  */}
          <SearchInput
            placeholder="Search Data Source Name"
            query={query}
            setQuery={setQuery}
            setPage={setCurrentPage}
          />
        </div>

        <div className="flex items-center gap-2">
          <Rows limit={dataSourceLimit} setLimit={setDataSourceLimit} />
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
                          checked={
                            selectedDataSourceItem?.def_data_source_id ===
                            row.original.def_data_source_id
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

      <Modal
        action={action}
        setAction={setAction}
        setOpenModal={setOpenModal}
        openModal={openModal}
        setSave={setSave}
        selectedDataSourceItem={selectedDataSourceItem}
        setSelectedDataSourceItem={setSelectedDataSourceItem}
        connectorProperties={connectorProperties}
      />
      {/* Start Pagination */}
    </div>
  );
};
export default DataSources;
