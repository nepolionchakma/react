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
import { columns } from "./Columns";
import { useEffect, useMemo, useState } from "react";
import { IAPIEndpoint } from "@/types/interfaces/apiEndpoints.interface";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { deleteData, loadData } from "@/Utility/funtion";
import { Checkbox } from "@/components/ui/checkbox";
import ActionButtons from "@/components/ActionButtons/ActionButtons";
import CustomTooltip from "@/components/Tooltip/Tooltip";
import { ChevronDown, FileEdit, Plus } from "lucide-react";
import Alert from "@/components/Alert/Alert";
import Rows from "@/components/Rows/Rows";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { convertToTitleCase } from "@/Utility/general";
import Pagination5 from "@/components/Pagination/Pagination5";
// import Spinner from "@/components/Spinner/Spinner";
import Modal from "./Modal";
import Spinner from "@/components/Spinner/Spinner";
import { IPrivilege } from "@/types/interfaces/users.interface";
import SearchInput from "@/components/SearchInput/SearchInput";

const ManageApiEndpoints = () => {
  const { token, users, grantedPrivlegeIds } = useGlobalContext();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState<IAPIEndpoint[] | []>([]);
  const [limit, setLimit] = useState<number>(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");
  const [totalPage, setTotalPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedEndPoints, setSelectedEndPoints] = useState<IAPIEndpoint[]>(
    [],
  );
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [action, setAction] = useState("");
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [reloadController, setReloadController] = useState(1);
  const [privileges, setPrivileges] = useState<IPrivilege[]>([]);

  const table = useReactTable({
    data,
    columns: useMemo(() => columns(users), [users]),
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

  useEffect(() => {
    const apiEndpointsParams = {
      baseURL: FLASK_URL,
      url: `${flaskApi.APIEndpoints}?api_endpoint=${query}&page=${currentPage}&limit=${limit}`,
      accessToken: `${token.access_token}`,
      setLoading: setIsLoading,
    };

    const loadAPIEndpoints = async () => {
      const res = await loadData(apiEndpointsParams);

      if (res.result) {
        setData(res.result);
        setTotalPage(res.pages);
      } else {
        setTotalPage(1);
      }
      setSelectedEndPoints([]);
    };

    const delayDebounce = setTimeout(() => {
      loadAPIEndpoints();
      //   setSelectedItem(null);
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [limit, currentPage, token.access_token, table, reloadController, query]);

  useEffect(() => {
    const fetchData = async () => {
      const privilegesParams = {
        baseURL: FLASK_URL,
        url: flaskApi.DefPrivileges,
        accessToken: token.access_token as string,
      };
      const privilegesRes = await loadData(privilegesParams);

      if (privilegesRes) {
        setPrivileges(privilegesRes.result);
      }
    };

    fetchData();
  }, [token.access_token]);

  useEffect(() => {
    if (data?.length > 0) {
      if (selectedEndPoints.length !== data?.length) {
        setIsSelectAll(false);
      } else {
        setIsSelectAll(true);
      }
    }
    const ids = selectedEndPoints.map((item) => item.api_endpoint_id);
    setSelectedIds(ids);
  }, [data?.length, selectedEndPoints]);

  //   useEffect(() => {
  //     const selectedRow = table
  //       .getSelectedRowModel()
  //       .rows.map((row) => row.original as IAPIEndpoint);
  //     setSelectedEndPoints(selectedRow);
  //   }, [rowSelection, data, table]);

  const handleRowSelection = (rowData: IAPIEndpoint) => {
    setSelectedEndPoints((prev) => {
      const endpoint = prev.find(
        (item) => item.api_endpoint_id === rowData.api_endpoint_id,
      );

      if (endpoint) {
        const filtered = prev.filter(
          (item) => item.api_endpoint_id !== rowData.api_endpoint_id,
        );
        return filtered;
      } else {
        return [rowData, ...prev];
      }
    });
  };

  const handleSelectAll = () => {
    if (isSelectAll) {
      setIsSelectAll(false);
      setSelectedEndPoints([]);
    } else {
      setIsSelectAll(true);
      setSelectedEndPoints(data);
    }
  };

  const handleAdd = () => {
    setAction("add");
    setOpenModal(true);
  };
  const handleEdit = () => {
    setAction("edit");
    setOpenModal(true);
  };

  const handleDelete = async () => {
    const params = {
      url: flaskApi.APIEndpoints,
      baseURL: FLASK_URL,
      payload: {
        api_endpoint_ids: selectedIds,
      },
      accessToken: token.access_token,
      isToast: true,
      setLoading: setIsDeleteLoading,
    };

    const res = await deleteData(params);
    if (res.status === 200) {
      setReloadController((prev) => prev + 1);
    }
  };

  return (
    <>
      {/* Action Item */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <ActionButtons>
            {grantedPrivlegeIds?.includes(11102) && (
              <button>
                <CustomTooltip tooltipTitle="Add">
                  <Plus className="cursor-pointer" onClick={handleAdd} />
                </CustomTooltip>
              </button>
            )}
            {grantedPrivlegeIds?.includes(11103) && (
              <button disabled={selectedEndPoints.length !== 1}>
                <CustomTooltip tooltipTitle="Edit">
                  <FileEdit
                    className={`${
                      selectedEndPoints.length !== 1
                        ? "text-slate-200 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                    onClick={handleEdit}
                  />
                </CustomTooltip>
              </button>
            )}
            {grantedPrivlegeIds?.includes(11104) && (
              <Alert
                disabled={selectedEndPoints.length === 0 || isDeleteLoading}
                actionName="delete"
                onContinue={handleDelete}
                tooltipTitle="Delete"
              >
                <>
                  {isDeleteLoading ? (
                    <Spinner size="40" color="black" />
                  ) : (
                    <span className="flex flex-col items-start">
                      {selectedEndPoints.map((item, index) => (
                        <span key={item.api_endpoint_id}>
                          {index + 1}. API Endpoint : {item.api_endpoint}
                        </span>
                      ))}
                    </span>
                  )}
                </>
              </Alert>
            )}
          </ActionButtons>

          {/* Search  */}
          <SearchInput
            placeholder="Search API Endpoint"
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
                            header.getContext(),
                          )}
                      {header.id === "select" && (
                        <Checkbox
                          disabled={!data?.length}
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
                          checked={selectedIds.includes(
                            row.original.api_endpoint_id,
                          )}
                          onClick={() => handleRowSelection(row.original)}
                        />
                      ) : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
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
      </div>
      {/* Start Pagination */}
      <div className="flex justify-between p-1">
        <div className="flex-1 text-sm text-gray-600">
          {selectedEndPoints?.length} row(s) selected.
        </div>
        <Pagination5
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPageNumbers={totalPage}
        />
      </div>

      {/* Modal */}
      <Modal
        action={action}
        setOpenModal={setOpenModal}
        selectedItems={selectedEndPoints}
        setState={setReloadController}
        privileges={privileges}
        openModal={openModal}
      />
    </>
  );
};

export default ManageApiEndpoints;
