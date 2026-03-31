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
import { useEffect, useMemo, useState } from "react";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { deleteData, loadData } from "@/Utility/funtion";
import { Checkbox } from "@/components/ui/checkbox";
import ActionButtons from "@/components/ActionButtons/ActionButtons";
import CustomTooltip from "@/components/Tooltip/Tooltip";
import { ChevronDown, Edit, Plus } from "lucide-react";
// import Alert from "@/components/Alert/Alert";
import Rows from "@/components/Rows/Rows";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { convertToTitleCase } from "@/Utility/general";
// import Modal from "./Modal";
// import { Input } from "@/components/ui/input";
// import Spinner from "@/components/Spinner/Spinner";
import { IAPIEndpointRole } from "@/types/interfaces/apiEndpoints.interface";
import { IRole } from "@/types/interfaces/users.interface";
import { getColumns } from "./Columns";
import Modal from "./Modal";
import { Input } from "@/components/ui/input";
import Pagination5 from "@/components/Pagination/Pagination5";
import Alert from "@/components/Alert/Alert";
import Spinner from "@/components/Spinner/Spinner";

const ManageApiEndpointsRoles = () => {
  const { token, users } = useGlobalContext();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState<IAPIEndpointRole[] | []>([]);

  const [limit, setLimit] = useState<number>(8);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [action, setAction] = useState("");
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [reloadController, setReloadController] = useState(1);
  const [selectedEndPointRoles, setSelectedEndPointRoles] = useState<
    IAPIEndpointRole[]
  >([]);
  const [roles, setRoles] = useState<IRole[] | []>([]);
  const [query, setQuery] = useState({ isEmpty: true, value: "" });

  const columns = useMemo(() => getColumns(users), [users]);
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

  const hiddenColumns = [
    "created_by",
    "last_updated_by",
    "creation_date",
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
    const apiEndpointRolesParams = {
      baseURL: FLASK_URL,
      url: `${flaskApi.APIEndpointRoles}/by_endpoint?api_endpoint=${query.value}&page=${page}&limit=${limit}`,
      accessToken: `${token.access_token}`,
      setLoading: setIsLoading,
    };

    const loadAPIEndpointRoles = async () => {
      const res = await loadData(apiEndpointRolesParams);
      if (res.result) {
        setData(res.result);
        setTotalPage(res.pages);
      } else {
        setTotalPage(1);
      }
      table.toggleAllRowsSelected(false);
    };

    const delayDebounce = setTimeout(() => {
      loadAPIEndpointRoles();
      //   setSelectedItem(null);
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [token.access_token, table, reloadController, query.value, page, limit]);

  useEffect(() => {
    if (data?.length > 0) {
      if (selectedEndPointRoles.length !== data.length) {
        setIsSelectAll(false);
      } else {
        setIsSelectAll(true);
      }
    }
    const ids = selectedEndPointRoles?.map((item) => item.api_endpoint_id);
    setSelectedIds(ids);
  }, [data?.length, selectedEndPointRoles]);

  useEffect(() => {
    const fetchData = async () => {
      const roleParams = {
        baseURL: FLASK_URL,
        url: flaskApi.DefRoles,
        accessToken: token.access_token as string,
      };
      const res = await loadData(roleParams);
      if (res) {
        setRoles(res.result);
      }
    };

    fetchData();
  }, [token.access_token]);

  const handleRowSelection = (rowData: IAPIEndpointRole) => {
    setSelectedEndPointRoles((prev) => {
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
      setSelectedEndPointRoles([]);
    } else {
      setIsSelectAll(true);
      setSelectedEndPointRoles(data);
    }
  };

  const handleAddClick = () => {
    setAction("Add");
    setShowModal(true);
  };

  const handleEditClick = () => {
    setAction("Edit");
    setShowModal(true);
  };

  const handleQuery = (e: string) => {
    if (e === "") {
      setQuery({ isEmpty: true, value: e });
      setPage(1);
    } else {
      setQuery({ isEmpty: false, value: e });
      setPage(1);
    }
  };
  const handleDelete = async () => {
    const payload = selectedEndPointRoles?.map((item) => {
      item.assigned_roles?.map((role) => {
        (item.api_endpoint_id, role.role_id);
      });
    });
    const params = {
      url: flaskApi.APIEndpointRoles,
      baseURL: FLASK_URL,
      payload: {
        api_endpoint_role_data: payload,
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
    <div>
      {/* Modal */}
      {showModal && (
        <Modal
          setShowModal={setShowModal}
          action={action}
          selectedEndPointRoles={selectedEndPointRoles}
          setReloadController={setReloadController}
          roles={roles}
        />
      )}
      {/* Action Buttons */}
      <div className="flex items-center justify-between py-4 ">
        {/* create, edit, delete and search by name  */}
        <div className="flex gap-3">
          <ActionButtons>
            <CustomTooltip tooltipTitle="Add">
              <Plus onClick={handleAddClick} className=" cursor-pointer" />
            </CustomTooltip>
            <CustomTooltip tooltipTitle="Edit">
              <button disabled={selectedEndPointRoles?.length !== 1}>
                <Edit
                  onClick={handleEditClick}
                  className={`${
                    selectedEndPointRoles?.length === 1
                      ? "text-black cursor-pointer"
                      : "text-slate-200 cursor-not-allowed"
                  }`}
                />
              </button>
            </CustomTooltip>
            <Alert
              actionName="delete"
              disabled={selectedEndPointRoles.length === 0}
              onContinue={handleDelete} // Main delete function
              tooltipTitle="Delete"
            >
              <span className="flex flex-col items-start gap-1">
                {isDeleteLoading ? (
                  <span className="block">
                    <Spinner size="40" color="black" />
                  </span>
                ) : (
                  selectedEndPointRoles?.map((item, index) => (
                    <span key={item.api_endpoint_id}>
                      {index + 1}. {item.api_endpoint_id}
                    </span>
                  ))
                )}
              </span>
            </Alert>
          </ActionButtons>
          <Input
            placeholder="Search API Endpoint"
            value={query.value}
            onChange={(e) => handleQuery(e.target.value)}
            className="w-[20rem] px-4 py-2 "
          />
        </div>
        {/* Rows and Column */}
        <div className="flex items-center gap-2">
          <Rows limit={limit} setLimit={setLimit} />
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
                ?.map((column) => {
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
        <div>
          <Table
            style={{
              width: table.getTotalSize(),
              minWidth: "100%",
              // tableLayout: "fixed",
            }}
          >
            <TableHeader>
              {table.getHeaderGroups()?.map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers?.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        style={{
                          width: `${header.getSize()}px`,
                        }}
                        className="relative border border-slate-400 bg-slate-200 p-1 h-9"
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
                    colSpan={table.getAllColumns()?.length}
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
                table.getRowModel().rows?.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells()?.map((cell, index) => (
                      <TableCell
                        key={cell.id}
                        style={{
                          width: cell.column.getSize(),
                          minWidth: cell.column.columnDef.minSize,
                        }}
                        className={`border p-1 h-8 ${index === 0 && "w-6"}`}
                      >
                        {index === 0 ? (
                          <Checkbox
                            className=""
                            checked={selectedIds.includes(
                              row.original.api_endpoint_id,
                            )}
                            onCheckedChange={(value) => {
                              if (value) {
                                // Select only the current row (deselect others)
                                // table.setRowSelection({ [row.id]: true });
                                handleRowSelection(row.original);
                              } else {
                                // Deselect current row
                                // table.setRowSelection({});
                                handleRowSelection({} as IAPIEndpointRole);
                              }
                            }}
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
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllColumns()?.length}
                    className="h-[16rem] text-center"
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
            {selectedEndPointRoles?.length} row(s) selected.
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
};

export default ManageApiEndpointsRoles;
