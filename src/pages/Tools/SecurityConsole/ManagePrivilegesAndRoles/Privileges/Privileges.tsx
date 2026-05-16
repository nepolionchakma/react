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
import { getColumns } from "./Columns";
import { IPrivilege } from "@/types/interfaces/users.interface";
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
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { deleteData, loadData } from "@/Utility/funtion";
import { convertToTitleCase } from "@/Utility/general";
import { useEffect, useMemo, useState } from "react";
import ActionButtons from "@/components/ActionButtons/ActionButtons";
import CustomTooltip from "@/components/Tooltip/Tooltip";
import Alert from "@/components/Alert/Alert";
import Spinner from "@/components/Spinner/Spinner";
import SearchInput from "@/components/SearchInput/SearchInput";
import Modal from "./Modal";

interface Props {
  privilegesLimit: number;
  setPrivilegesLimit: React.Dispatch<React.SetStateAction<number>>;
  selectedPrivilegeRows: IPrivilege[];
  setSelectedPrivilegeRows: React.Dispatch<React.SetStateAction<IPrivilege[]>>;
}

const Privileges = ({
  privilegesLimit,
  setPrivilegesLimit,
  selectedPrivilegeRows,
  setSelectedPrivilegeRows,
}: Props) => {
  const { token, users, grantedPrivlegeIds } = useGlobalContext();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState<IPrivilege[] | []>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [action, setAction] = useState("");
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [reloadController, setReloadController] = useState(1);
  const [query, setQuery] = useState("");

  console.log(data);

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
        pageSize: privilegesLimit,
      },
    },
  });

  const hiddenColumns: string[] = [];

  useEffect(() => {
    table.getAllColumns().forEach((column) => {
      if (hiddenColumns.includes(column.id)) {
        column.toggleVisibility(false);
      }
    });
  }, [table]);

  useEffect(() => {
    const params = {
      baseURL: FLASK_URL,
      url: `${flaskApi.DefPrivileges}?page=${currentPage}&limit=${privilegesLimit}&privilege_name=${query}`,
      accessToken: `${token.access_token}`,
      setLoading: setIsLoading,
    };
    const loadPrivileges = async () => {
      const res = await loadData(params);
      console.log(res, "calling");
      if (res.result) {
        setData(res.result);
        setTotalPage(res.pages);
      } else {
        setTotalPage(1);
      }
      table.toggleAllRowsSelected(false);
    };

    const delayDebounce = setTimeout(() => {
      loadPrivileges();
      //   setSelectedItem(null);
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [
    token.access_token,
    reloadController,
    currentPage,
    privilegesLimit,
    token,
    table,
    query,
  ]);

  useEffect(() => {
    if (data?.length > 0) {
      if (selectedPrivilegeRows.length !== data.length) {
        setIsSelectAll(false);
      } else {
        setIsSelectAll(true);
      }
    }
    const ids = selectedPrivilegeRows?.map((item) => item.privilege_id);
    setSelectedIds(ids);
  }, [data.length, selectedPrivilegeRows]);

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
      setSelectedPrivilegeRows([]);
    } else {
      setIsSelectAll(true);
      setSelectedPrivilegeRows(data);
    }
  };

  const handleRowSelection = (rowSelection: IPrivilege) => {
    if (selectedIds.includes(rowSelection.privilege_id)) {
      const newSelected = selectedPrivilegeRows.filter(
        (row) => row.privilege_id !== rowSelection.privilege_id,
      );
      setSelectedPrivilegeRows(newSelected);
    } else {
      setSelectedPrivilegeRows((prev) => [...prev, rowSelection]);
    }
  };

  const handleDelete = async () => {
    const params = {
      url: flaskApi.DefPrivileges,
      baseURL: FLASK_URL,
      payload: {
        privilege_ids: selectedIds,
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
              <button disabled={selectedPrivilegeRows.length !== 1}>
                <CustomTooltip tooltipTitle="Edit">
                  <FileEdit
                    className={`${
                      selectedPrivilegeRows.length !== 1
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
                disabled={selectedPrivilegeRows.length === 0 || isDeleteLoading}
                actionName="delete"
                onContinue={handleDelete}
                tooltipTitle="Delete"
              >
                <>
                  {isDeleteLoading ? (
                    <Spinner size="40" color="black" />
                  ) : (
                    <span className="flex flex-col items-start">
                      {selectedPrivilegeRows.map((item, index) => (
                        <span key={item.privilege_id}>
                          {index + 1}. Privilege : {item.privilege_name}
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
            placeholder="Search Privilege"
            query={query}
            setQuery={setQuery}
            setPage={setCurrentPage}
          />
        </div>

        <div className="flex items-center gap-2">
          <Rows limit={privilegesLimit} setLimit={setPrivilegesLimit} />
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
                            row.original.privilege_id,
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
          {selectedPrivilegeRows?.length} row(s) selected.
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
        selectedItems={selectedPrivilegeRows}
        setState={setReloadController}
      />
    </>
  );
};

export default Privileges;
