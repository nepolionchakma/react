import * as React from "react";
import {
  ColumnFiltersState,
  ColumnSizingState,
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
import columns from "./Columns";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { ITenantsTypes } from "@/types/interfaces/users.interface";
import Pagination5 from "@/components/Pagination/Pagination5";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, FileEdit, Plus } from "lucide-react";
import Rows from "@/components/Rows/Rows";
import { FLASK_URL } from "@/Api/Api";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { deleteData, loadData } from "@/Utility/funtion";
import { convertToTitleCase } from "@/Utility/general";
import Spinner from "@/components/Spinner/Spinner";
import Modal from "./Modal";
import ActionButtons from "@/components/ActionButtons/ActionButtons";
import CustomTooltip from "@/components/Tooltip/Tooltip";
import Alert from "@/components/Alert/Alert";

interface ITenantsDataProps {
  selectedTenancyRows: ITenantsTypes[];
  setSelectedTenancyRows: React.Dispatch<React.SetStateAction<ITenantsTypes[]>>;
  tenancyLimit: number;
  setTenancyLimit: React.Dispatch<React.SetStateAction<number>>;
}

export function TenancyDataTable({
  tenancyLimit,
  setTenancyLimit,
  selectedTenancyRows,
  setSelectedTenancyRows,
}: ITenantsDataProps) {
  const { token, combinedUser, grantedPrivlegeIds, grantedRoleIds } =
    useGlobalContext();
  const api = useAxiosPrivate();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [data, setData] = React.useState<ITenantsTypes[]>([]);
  const [isSelectAll, setIsSelectAll] = React.useState(false);
  const [openModal, setOpenModal] = React.useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = React.useState(false);
  const [action, setAction] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPage, setTotalPage] = React.useState<number>(1);
  const [reloadController, setReloadController] = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [colSizing, setColSizing] = React.useState<ColumnSizingState>({});

  React.useEffect(() => {
    if (data?.length > 0) {
      if (selectedTenancyRows.length !== data.length) {
        setIsSelectAll(false);
      } else {
        setIsSelectAll(true);
      }
    }
    const ids = selectedTenancyRows?.map((item) => item.tenant_id);
    setSelectedIds(ids);
  }, [data?.length, selectedTenancyRows]);

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
    onColumnSizingChange: setColSizing,
    columnResizeMode: "onChange",

    state: {
      sorting,
      columnSizing: colSizing,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: 0,
        pageSize: tenancyLimit,
      },
    },
  });

  const handleSelectAll = () => {
    if (isSelectAll) {
      setIsSelectAll(false);
      setSelectedTenancyRows([]);
    } else {
      setIsSelectAll(true);
      setSelectedTenancyRows(data);
    }
  };

  const handleRowSelection = (rowSelection: ITenantsTypes) => {
    if (selectedIds.includes(rowSelection.tenant_id)) {
      const newSelected = selectedTenancyRows.filter(
        (row) => row.tenant_id !== rowSelection.tenant_id,
      );
      setSelectedTenancyRows(newSelected);
    } else {
      setSelectedTenancyRows((prev) => [...prev, rowSelection]);
    }
  };

  React.useEffect(() => {
    const tenancyDataParams = {
      baseURL: FLASK_URL,
      url: `def_tenants/${currentPage}/${tenancyLimit}`,
      setLoading: setIsLoading,
      accessToken: `${token.access_token}`,
    };

    const fetch = async () => {
      const res = await loadData(tenancyDataParams);

      if (res.items) {
        setData(res.items);
        setTotalPage(res.pages);
      } else {
        setTotalPage(1);
      }

      setSelectedTenancyRows([]);
    };
    fetch();
  }, [
    api,
    currentPage,
    token.access_token,
    tenancyLimit,
    reloadController,
    setSelectedTenancyRows,
  ]);

  React.useEffect(() => {
    const tenancyDataParams = {
      baseURL: FLASK_URL,
      url: `/tenants/${combinedUser?.tenant_id}`,
      setLoading: setIsLoading,
      accessToken: `${token.access_token}`,
    };

    const fetchTenancy = async () => {
      const res = await loadData(tenancyDataParams);

      if (!grantedRoleIds.includes(3)) {
        setSelectedTenancyRows([res]);
      }
    };
    fetchTenancy();
  }, [
    combinedUser?.tenant_id,
    grantedRoleIds,
    setSelectedTenancyRows,
    token.access_token,
  ]);

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
      url: "/tenants/cascade_delete",
      baseURL: FLASK_URL,
      payload: {
        tenant_ids: selectedIds,
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
            {grantedPrivlegeIds?.includes(11102) &&
              grantedRoleIds.includes(3) && (
                <button>
                  <CustomTooltip tooltipTitle="Add">
                    <Plus className="cursor-pointer" onClick={handleAdd} />
                  </CustomTooltip>
                </button>
              )}
            {grantedPrivlegeIds?.includes(11103) && (
              <button disabled={selectedTenancyRows.length !== 1}>
                <CustomTooltip tooltipTitle="Edit">
                  <FileEdit
                    className={`${
                      selectedTenancyRows.length !== 1
                        ? "text-slate-200 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                    onClick={handleEdit}
                  />
                </CustomTooltip>
              </button>
            )}
            {grantedPrivlegeIds?.includes(11104) &&
              grantedRoleIds.includes(3) && (
                <Alert
                  disabled={selectedTenancyRows.length === 0 || isDeleteLoading}
                  actionName="delete"
                  onContinue={handleDelete}
                  tooltipTitle="Delete"
                >
                  <>
                    {isDeleteLoading ? (
                      <Spinner size="40" color="black" />
                    ) : (
                      <span className="flex flex-col items-start">
                        {selectedTenancyRows.map((item, index) => (
                          <span key={item.tenant_id}>
                            {index + 1}. Tenant Name : {item.tenant_name}
                          </span>
                        ))}
                      </span>
                    )}
                  </>
                </Alert>
              )}
          </ActionButtons>
        </div>

        <div className="flex items-center gap-2">
          <Rows limit={tenancyLimit} setLimit={setTenancyLimit} />
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
                          disabled={
                            !data?.length || !grantedRoleIds.includes(3)
                          }
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
                          disabled={!grantedRoleIds.includes(3)}
                          className="mt-1"
                          checked={selectedIds.includes(row.original.tenant_id)}
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
          {selectedTenancyRows?.length} row(s) selected.
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
        setAction={setAction}
        openModal={openModal}
        setOpenModal={setOpenModal}
        selectedItems={selectedTenancyRows}
        setState={setReloadController}
      />
    </>
  );
}
