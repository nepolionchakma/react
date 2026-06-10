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
import SearchInput from "@/components/SearchInput/SearchInput";
import { ITaskGroup } from "@/types/interfaces/ARM.interface";

const ManageTaskGroups = () => {
  const { token, users, grantedPrivlegeIds } = useGlobalContext();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState<ITaskGroup[] | []>([]);
  const [limit, setLimit] = useState<number>(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");
  const [totalPage, setTotalPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedTaskGroups, setSelectedTaskGroups] = useState<ITaskGroup[]>(
    [],
  );
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [action, setAction] = useState("");
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [reloadController, setReloadController] = useState(1);

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

  const hiddenColumns = [""];

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
      url: `${flaskApi.TaskGroups}?group_name=${query}&page=${currentPage}&limit=${limit}`,
      accessToken: `${token.access_token}`,
      setLoading: setIsLoading,
    };

    const loadTaskGroups = async () => {
      const res = await loadData(apiEndpointsParams);

      console.log(res);
      if (res.result) {
        setData(res.result);
        setTotalPage(res.pages);
      } else {
        setTotalPage(1);
      }
      setSelectedTaskGroups([]);
    };

    const delayDebounce = setTimeout(() => {
      loadTaskGroups();
      //   setSelectedItem(null);
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [limit, currentPage, token.access_token, table, reloadController, query]);

  useEffect(() => {
    if (data?.length > 0) {
      if (selectedTaskGroups.length !== data?.length) {
        setIsSelectAll(false);
      } else {
        setIsSelectAll(true);
      }
    }
    const ids = selectedTaskGroups.map((item) => item.group_id);
    setSelectedIds(ids);
  }, [data?.length, selectedTaskGroups]);

  const handleRowSelection = (rowData: ITaskGroup) => {
    setSelectedTaskGroups((prev) => {
      const taskGroups = prev.find(
        (item) => item.group_id === rowData.group_id,
      );

      if (taskGroups) {
        const filtered = prev.filter(
          (item) => item.group_id !== rowData.group_id,
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
      setSelectedTaskGroups([]);
    } else {
      setIsSelectAll(true);
      setSelectedTaskGroups(data);
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
      url: flaskApi.TaskGroups,
      baseURL: FLASK_URL,
      payload: {
        group_ids: selectedIds,
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
              <button disabled={selectedTaskGroups.length !== 1}>
                <CustomTooltip tooltipTitle="Edit">
                  <FileEdit
                    className={`${
                      selectedTaskGroups.length !== 1
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
                disabled={selectedTaskGroups.length === 0 || isDeleteLoading}
                actionName="delete"
                onContinue={handleDelete}
                tooltipTitle="Delete"
              >
                <>
                  {isDeleteLoading ? (
                    <Spinner size="40" color="black" />
                  ) : (
                    <span className="flex flex-col items-start">
                      {selectedTaskGroups.map((item, index) => (
                        <span key={item.group_id}>
                          {index + 1}. Task Group Name : {item.group_name}
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
                          checked={selectedIds.includes(row.original.group_id)}
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
          {selectedTaskGroups?.length} row(s) selected.
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
        selectedItems={selectedTaskGroups}
        setState={setReloadController}
        openModal={openModal}
      />
    </>
  );
};

export default ManageTaskGroups;
