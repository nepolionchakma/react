import ActionButtons from "@/components/ActionButtons/ActionButtons";
import Alert from "@/components/Alert/Alert";
import Rows from "@/components/Rows/Rows";
import SearchInput from "@/components/SearchInput/SearchInput";
import CustomTooltip from "@/components/Tooltip/Tooltip";
import { Button } from "@/components/ui/button";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown, FileEdit, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { columns } from "./Columns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination5 from "@/components/Pagination/Pagination5";

import { deleteData, loadData } from "@/Utility/funtion";
import { IManageControlEnvironments } from "@/types/interfaces/manageControlEnvironments.interface";
import { Checkbox } from "@/components/ui/checkbox";
import Modal from "./Modal";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { convertToTitleCase } from "@/Utility/general";

const ManageControlEnvironments = () => {
  const { token } = useGlobalContext();
  const [controlEnvironments, setControlEnvironments] = useState<
    IManageControlEnvironments[]
  >([]);
  // const [query, setQuery] = useState({ isEmpty: true, value: "" });
  const [page, setPage] = useState<number>(1);
  const [state, setState] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(0);
  const [limit, setLimit] = useState(8);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState({ isEmpty: true, value: "" });
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedItems, setSelectedItems] = useState<
    IManageControlEnvironments[]
  >([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedControlEnvironment, setSelectedControlEnvironment] = useState<
    IManageControlEnvironments | undefined
  >();
  const [modalType, SetModalType] = useState("Add");
  // const FLASK_URL = import.meta.env.VITE_FLASK_ENDPOINT_URL;

  const table = useReactTable({
    data: controlEnvironments,
    columns,
    columnResizeMode: "onChange",
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
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

  // default hidden columns
  const hiddenColumns = useMemo(() => ["created_by", "last_updated_by"], []);

  useEffect(() => {
    table.getAllColumns().forEach((column) => {
      if (hiddenColumns.includes(column.id)) {
        column.toggleVisibility(false);
      }
    });
  }, [table, hiddenColumns]);

  useEffect(() => {
    const fetchControlEnvironments = async () => {
      const actionItemsParams = {
        baseURL: FLASK_URL,
        url: `${flaskApi.DefControlEnvironments}?name=${query.value}&page=${page}&limit=${limit}`,
        setLoading: setIsLoading,
        accessToken: token.access_token,
      };
      const res = await loadData(actionItemsParams);
      if (res) {
        setControlEnvironments(res.items);
        setTotalPage(res.pages);
        // return res;
      }
    };
    const delayDebounce = setTimeout(() => {
      fetchControlEnvironments();
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [limit, page, query.value, token.access_token, state]);

  useEffect(() => {
    if (controlEnvironments.length > 0) {
      if (controlEnvironments?.length !== selectedIds.length) {
        setIsSelectAll(false);
      } else {
        setIsSelectAll(true);
      }
    }
    const controlEnvironment = controlEnvironments.find(
      (item) => item.control_environment_id === selectedIds[0]
    );
    setSelectedControlEnvironment(controlEnvironment);
  }, [selectedIds, controlEnvironments]);

  const handleSelectAll = () => {
    if (isSelectAll) {
      setIsSelectAll(false);
      setSelectedIds([]);
      setSelectedItems([]);
    } else {
      setIsSelectAll(true);
      const allIds = controlEnvironments.map(
        (item) => item.control_environment_id
      );
      setSelectedIds(allIds);
      setSelectedItems(controlEnvironments);
    }
  };

  const handleRowSelection = (item: IManageControlEnvironments) => {
    if (selectedIds.includes(item.control_environment_id)) {
      setSelectedIds((prev) =>
        prev.filter((i) => i !== item.control_environment_id)
      );
      setSelectedItems((prev) =>
        prev.filter(
          (i) => i.control_environment_id !== item.control_environment_id
        )
      );
    } else {
      setSelectedIds((prev) => [...prev, item.control_environment_id]);
      setSelectedItems((prev) => [...prev, item]);
    }
  };

  const handleAddCllick = () => {
    setShowModal(true);
    SetModalType("Add");
  };
  const handleEditCllick = () => {
    setShowModal(true);
    SetModalType("Edit");
  };
  const handleDelete = async () => {
    const params = {
      url: flaskApi.DefControlEnvironments,
      baseURL: FLASK_URL,
      payload: {
        control_environment_ids: selectedIds,
      },
      accessToken: token.access_token,
      isToast: true,
    };

    const res = await deleteData(params);
    if (res.status === 200) {
      // setControlEnvironments((prev) => {
      //   const filtered = prev.filter(
      //     (env) => !selectedIds.includes(env.control_environment_id)
      //   );

      //   return filtered;
      // });
      setSelectedIds([]);
      setSelectedItems([]);
      setState((prev) => prev + 1);
    }
  };

  return (
    <div>
      <div className="flex gap-3 items-center py-2">
        <ActionButtons>
          <CustomTooltip tooltipTitle="Add">
            <Plus className="cursor-pointer" onClick={handleAddCllick} />
          </CustomTooltip>
          <CustomTooltip tooltipTitle="Edit">
            {selectedIds.length === 1 ? (
              <FileEdit className="cursor-pointer" onClick={handleEditCllick} />
            ) : (
              <FileEdit className="cursor-not-allowed text-slate-200" />
            )}
          </CustomTooltip>
          <Alert
            actionName="delete"
            disabled={selectedIds.length === 0}
            onContinue={handleDelete}
            // onClick={() => console.log("clicked")}
            tooltipTitle="Delete"
          >
            <span className="flex flex-col items-start gap-1">
              {selectedItems.map((item, index) => (
                <span key={item.control_environment_id}>
                  {index + 1}. Environment Name: {item.name}
                </span>
              ))}
            </span>
          </Alert>
        </ActionButtons>
        <SearchInput
          query={query}
          setQuery={setQuery}
          setPage={setPage}
          placeholder="Search Name"
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
      <div className="rounded-md border">
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
                          // width: `${header.getSize()}px`,
                          // maxWidth: header.id === "select" ? "24px" : "",
                          width:
                            header.column.id === "select"
                              ? 24
                              : `${header.getSize()}px`,
                          minWidth:
                            header.column.id === "select"
                              ? 24
                              : header.column.columnDef.minSize,
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
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="border py-0 px-1"
                        style={{
                          width:
                            cell.column.id === "select"
                              ? 24
                              : cell.column.getSize(),
                          minWidth:
                            cell.column.id === "select"
                              ? 24
                              : cell.column.columnDef.minSize,
                        }}
                      >
                        {cell.column.id === "select" ? (
                          <Checkbox
                            className="mt-1"
                            checked={selectedIds.includes(
                              row.original.control_environment_id
                            )} // Use react-table's selection state
                            onCheckedChange={() =>
                              handleRowSelection(row.original)
                            }
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

          {/* Pagination and Status */}
          <div className="flex justify-between p-1">
            <div className="flex-1 text-sm text-gray-600">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <Pagination5
              currentPage={page}
              setCurrentPage={setPage}
              totalPageNumbers={totalPage}
            />
          </div>
        </div>
        {showModal && (
          <Modal
            modalType={modalType}
            setShowModal={setShowModal}
            controlEnvironment={selectedControlEnvironment}
            setControlEnvironments={setControlEnvironments}
            setSelectedIds={setSelectedIds}
            setState={setState}
            setSelectedItems={setSelectedItems}
          />
        )}
      </div>
    </div>
  );
};
export default ManageControlEnvironments;
