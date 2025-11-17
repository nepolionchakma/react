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
import { ChevronDown, FileEdit } from "lucide-react";
import { tailspin } from "ldrs";
tailspin.register();
import { Button } from "@/components/ui/button";
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
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { columns as getColumns } from "./Columns";
import {
  IPrivilegeAndRole,
  ITenantsTypes,
} from "@/types/interfaces/users.interface";
import Pagination5 from "@/components/Pagination/Pagination5";
import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { Input } from "@/components/ui/input";
import CustomTooltip from "@/components/Tooltip/Tooltip";
import ActionButtons from "@/components/ActionButtons/ActionButtons";
import Rows from "@/components/Rows/Rows";
import { convertToTitleCase } from "@/Utility/general";
import { useEffect, useState } from "react";
import { FLASK_URL, flaskApi, NODE_URL, nodeApi } from "@/Api/Api";
import { loadData } from "@/Utility/funtion";
import EditPrivilegeAndRole from "./EditPrivilegeAndRole";

const ManagePriviedgesAndRoles = () => {
  const { token } = useGlobalContext();
  const [data, setData] = useState<IPrivilegeAndRole[] | []>([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [expandRoles, setExpandRoles] = useState<string | null>(null);
  const [expandPrevilege, setExpandPrevilege] = useState<string | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [query, setQuery] = useState({ isEmpty: true, value: "" });
  const [limit, setLimit] = useState<number>(8);
  const [selectedItem, setSelectedItem] = useState<IPrivilegeAndRole | null>(
    null
  );
  const [tenants, setTenants] = useState<ITenantsTypes[]>([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [stateChange, setStateChange] = useState(1);

  const table = useReactTable({
    data,
    columns: getColumns(
      tenants,
      expandRoles,
      expandPrevilege,
      setExpandRoles,
      setExpandPrevilege
    ),
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

  const handleQuery = (e: string) => {
    if (e === "") {
      setQuery({ isEmpty: true, value: e });
      setPage(1);
    } else {
      setQuery({ isEmpty: false, value: e });
      setPage(1);
    }
  };

  /** get tentants */
  useEffect(() => {
    const tenantDataParams = {
      baseURL: FLASK_URL,
      url: `${flaskApi.DefTenants}`,
      accessToken: `${token.access_token}`,
    };

    const loadTenantData = async () => {
      const res = await loadData(tenantDataParams);
      if (res) {
        setTenants(res);
      }
    };
    loadTenantData();
  }, [token.access_token]);

  useEffect(() => {
    const previlegesAndRolesParams = {
      baseURL: NODE_URL,
      url: `${nodeApi.PrevilegesAndRoles}?page=${page}&limit=${limit}`,
      accessToken: `${token.access_token}`,
      setLoading: setIsLoading,
    };

    const loadPrevilegesAndRolesData = async () => {
      const res = await loadData(previlegesAndRolesParams);
      if (res) {
        setData(res.result);
        setTotalPage(res.totalPages);
      }
      table.toggleAllRowsSelected(false);
    };
    loadPrevilegesAndRolesData();
    setSelectedItem(null);
  }, [limit, page, token.access_token, table, stateChange]);

  const handleRowSelection = (rowSelection: IPrivilegeAndRole) => {
    setSelectedItem(rowSelection);
  };

  // const handleDelete = () => {
  //   deleteCombinedUser([selectedItem]);
  //   //table toggle empty
  //   table.getRowModel().rows.map((row) => row.toggleSelected(false));
  //   setSelectedItem({} as IUsersInfoTypes);
  // };

  const handleCloseModal = () => {
    setIsOpenModal(false);
  };
  return (
    <div className="px-3">
      {isOpenModal && selectedItem && (
        <CustomModal4 className="w-[770px] ">
          <EditPrivilegeAndRole
            selected={selectedItem}
            setStateChange={setStateChange}
            handleCloseModal={handleCloseModal}
          />
        </CustomModal4>
      )}
      {/* top icon and columns*/}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <ActionButtons>
            {/* Edit  */}
            <button disabled={!selectedItem?.user_id}>
              <CustomTooltip tooltipTitle="Edit">
                <FileEdit
                  className={`${
                    !selectedItem?.user_id
                      ? "text-slate-200 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  onClick={() => setIsOpenModal(true)}
                />
              </CustomTooltip>
            </button>
            {/* Delete 
            <Alert
              disabled={
                !selectedItem?.user_id ||
                combinedUser?.user_type?.toLocaleLowerCase() !== "system"
              } // disable condition
              tooltipTitle="Delete" // tooltip title
              actionName="delete" // Cancel/Reschedule
              onContinue={handleDelete} // function
            >
              <span>Username : {selectedItem?.user_name}</span>
            </Alert> */}
          </ActionButtons>

          {/* Search  */}
          <Input
            placeholder="Search Username"
            value={query.value}
            onChange={(e) => handleQuery(e.target.value)}
            className="w-[20rem] px-4 py-2"
          />
        </div>

        <div className="flex items-center gap-2">
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
        <div>
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
                        style={{
                          width: `${header.getSize()}px`,
                        }}
                        className="relative border border-slate-400 bg-slate-200 p-1 h-9"
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
                    colSpan={
                      getColumns(
                        tenants,
                        expandPrevilege,
                        expandRoles,
                        setExpandPrevilege,
                        setExpandRoles
                      ).length
                    }
                    className="h-24 text-center"
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
                        style={{
                          width: cell.column.getSize(),
                          minWidth: cell.column.columnDef.minSize,
                        }}
                        className={`border p-1 h-8 ${index === 0 && "w-6"}`}
                      >
                        {index === 0 ? (
                          <Checkbox
                            className=""
                            checked={row.getIsSelected()}
                            onCheckedChange={(value) => {
                              if (value) {
                                // Select only the current row (deselect others)
                                table.setRowSelection({ [row.id]: true });
                                handleRowSelection(row.original);
                              } else {
                                // Deselect current row
                                table.setRowSelection({});
                                handleRowSelection({} as IPrivilegeAndRole);
                              }
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
                    colSpan={
                      getColumns(
                        tenants,
                        expandPrevilege,
                        expandRoles,
                        setExpandPrevilege,
                        setExpandRoles
                      ).length
                    }
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
            {!selectedItem?.user_id ? 0 : 1} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
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

export default ManagePriviedgesAndRoles;
