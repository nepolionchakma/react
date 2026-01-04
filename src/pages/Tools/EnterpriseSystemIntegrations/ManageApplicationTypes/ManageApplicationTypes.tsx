import { FLASK_URL, flaskApi } from "@/Api/Api";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { IApplicationType } from "@/types/interfaces/datasource.interface";
import { deleteData, loadData } from "@/Utility/funtion";
import { useEffect, useState } from "react";
import CustomTooltip from "@/components/Tooltip/Tooltip";
import ActionButtons from "@/components/ActionButtons/ActionButtons";
import Rows from "@/components/Rows/Rows";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import columns from "./Columns";
import { ChevronDown, FileEdit, Plus } from "lucide-react";
import { convertToTitleCase } from "@/Utility/general";
import { Button } from "@/components/ui/button";
import Alert from "@/components/Alert/Alert";
import Pagination5 from "@/components/Pagination/Pagination5";
import Modal from "./Modal";
import SearchInput from "@/components/SearchInput/SearchInput";
import Spinner from "@/components/Spinner/Spinner";

const ManageApplicationTypes = () => {
  const { token } = useGlobalContext();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState<number>(8);
  const [selectedItems, setSelectedItems] = useState<IApplicationType[]>([]);
  const [data, setData] = useState<IApplicationType[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [state, setState] = useState(1);

  useEffect(() => {
    const fetchApplicationType = async () => {
      const loadParams = {
        baseURL: FLASK_URL,
        url: `${flaskApi.ApplicationTypes}?page=${currentPage}&limit=${limit}&application_type=${query}`,
        accessToken: token.access_token,
        setLoading: setLoading,
      };

      const res = await loadData(loadParams);
      setData(res.result);
      setTotalPages(res.pages);
    };
    const delayDebounce = setTimeout(() => {
      fetchApplicationType();
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [token.access_token, currentPage, query, limit, state]);

  useEffect(() => {
    if (selectedItems.length !== data.length || data.length === 0) {
      setIsSelectAll(false);
    } else {
      setIsSelectAll(true);
    }
  }, [selectedItems.length, data.length]);

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

  const handleRowSelection = (rowData: IApplicationType) => {
    setSelectedItems((prevSelected) => {
      if (prevSelected.includes(rowData)) {
        // If the id is already selected, remove it
        return prevSelected.filter((selectedId) => selectedId !== rowData);
      } else {
        // If the id is not selected, add it
        return [...prevSelected, rowData];
      }
    });
  };

  const handleAdd = () => {
    setAction("add");
    setOpenModal(true);
  };
  const handleEdit = () => {
    setAction("edit");
    setOpenModal(true);
  };

  const handleSelectAll = () => {
    if (isSelectAll) {
      setIsSelectAll(false);
      setSelectedItems([]);
    } else {
      setIsSelectAll(true);
      setSelectedItems(data);
    }
  };

  const handleDelete = async () => {
    const payload = {
      def_application_type_ids: selectedItems.map(
        (item) => item.def_application_type_id
      ),
    };

    const deleteParams = {
      url: flaskApi.ApplicationTypes,
      baseURL: FLASK_URL,
      payload: payload,
      accessToken: token.access_token,
      isToast: true,
    };

    const res = await deleteData(deleteParams);
    if (res.status === 200) {
      setState((prev) => prev + 1);
      setSelectedItems([]);
    }
  };

  // default hidden columns
  const hiddenColumns = [
    "created_by",
    "creation_date",
    "last_updated_by",
    "last_update_date",
  ];
  useEffect(() => {
    table.getAllColumns().forEach((column) => {
      if (hiddenColumns.includes(column.id)) {
        column.toggleVisibility(false);
      }
    });
  }, [table]);
  return (
    <>
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <ActionButtons>
            {/* Edit  */}
            <button>
              <CustomTooltip tooltipTitle="Add">
                <Plus className="cursor-pointer" onClick={handleAdd} />
              </CustomTooltip>
            </button>
            <button disabled={selectedItems.length !== 1}>
              <CustomTooltip tooltipTitle="Edit">
                <FileEdit
                  className={`${
                    selectedItems.length !== 1
                      ? "text-slate-200 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  onClick={handleEdit}
                />
              </CustomTooltip>
            </button>
            <Alert
              disabled={selectedItems.length === 0}
              actionName="delete"
              onContinue={handleDelete}
              tooltipTitle="Delete"
            >
              <>
                <span className="flex flex-col items-start">
                  {selectedItems.map((item, index) => (
                    <span key={item.def_application_type_id}>
                      {index + 1}. Application Type : {item.application_type}
                    </span>
                  ))}
                </span>
              </>
            </Alert>
          </ActionButtons>

          {/* Search  */}
          <SearchInput
            placeholder="Search Application Type"
            query={query}
            setQuery={setQuery}
            setPage={setCurrentPage}
          />
        </div>

        <div className="flex items-center gap-2">
          <Rows limit={limit} setLimit={setLimit} />
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
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-[16rem] text-center"
                >
                  <Spinner size="40" color="black" />
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
                          checked={selectedItems.includes(row.original)}
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
            ) : loading ? (
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
      </div>
      {/* Start Pagination */}
      <div className="flex justify-between p-1">
        <div className="flex-1 text-sm text-gray-600">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <Pagination5
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPageNumbers={totalPages as number}
        />
      </div>

      {/* Modal */}
      <Modal
        action={action}
        setAction={setAction}
        openModal={openModal}
        setOpenModal={setOpenModal}
        selectedItems={selectedItems}
        setState={setState}
      />
    </>
  );
};

export default ManageApplicationTypes;
