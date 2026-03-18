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
import { useEffect, useState } from "react";
import { IAPIEndpoint } from "@/types/interfaces/apiEndpoints.interface";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { loadData } from "@/Utility/funtion";
import { Checkbox } from "@/components/ui/checkbox";
import ActionButtons from "@/components/ActionButtons/ActionButtons";
import CustomTooltip from "@/components/Tooltip/Tooltip";
import { ChevronDown, Edit, Plus } from "lucide-react";
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
import Spinner from "@/components/Spinner/Spinner";
import Modal from "./Modal";

const ManageApiEndpoints = () => {
  const { token } = useGlobalContext();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState<IAPIEndpoint[] | []>([]);
  const [limit, setLimit] = useState<number>(8);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedEndPoints, setSelectedEndPoints] = useState<IAPIEndpoint[]>(
    [],
  );
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [action, setAction] = useState("");
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [reloadController, setReloadController] = useState(1);

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

  useEffect(() => {
    const apiEndpointsParams = {
      baseURL: FLASK_URL,
      url: `${flaskApi.APIEndpoints}?page=${page}&limit=${limit}`,
      accessToken: `${token.access_token}`,
      setLoading: setIsLoading,
    };

    const loadPrevilegesAndRolesData = async () => {
      const res = await loadData(apiEndpointsParams);
      if (res) {
        setData(res.result);
        setTotalPage(res.pages);
      }
      table.toggleAllRowsSelected(false);
    };

    const delayDebounce = setTimeout(() => {
      loadPrevilegesAndRolesData();
      //   setSelectedItem(null);
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [limit, page, token.access_token, table, reloadController]);

  useEffect(() => {
    if (data.length > 0) {
      if (selectedEndPoints.length !== data.length) {
        setIsSelectAll(false);
      } else {
        setIsSelectAll(true);
      }
    }
    const ids = selectedEndPoints.map((item) => item.api_endpoint_id);
    setSelectedIds(ids);
  }, [data.length, selectedEndPoints]);

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

  const handleAddClick = () => {
    setAction("Add");
    setShowModal(true);
  };

  const handleEditClick = () => {
    setAction("Edit");
    setShowModal(true);
  };

  const handleDelete = () => {};

  const handleDeleteCalculate = () => {};
  return (
    <div>
      {/* Modal */}
      {showModal && (
        <Modal
          setShowModal={setShowModal}
          action={action}
          selectedEndPoints={selectedEndPoints}
          setReloadController={setReloadController}
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
              <button disabled={selectedEndPoints.length !== 1}>
                <Edit
                  onClick={handleEditClick}
                  className={`${
                    selectedEndPoints.length === 1
                      ? "text-black cursor-pointer"
                      : "text-slate-200 cursor-not-allowed"
                  }`}
                />
              </button>
            </CustomTooltip>
            <Alert
              actionName="delete"
              disabled={selectedEndPoints.length === 0}
              onContinue={handleDelete} // Main delete function
              onClick={handleDeleteCalculate} // Delete calculate function
              tooltipTitle="Delete"
            >
              <span className="flex flex-col items-start gap-1">
                {isDeleteLoading ? (
                  <span className="block">
                    <Spinner size="40" color="black" />
                  </span>
                ) : (
                  selectedEndPoints.map((item) => (
                    <span key={item.api_endpoint_id}>{item.api_endpoint}</span>
                  ))
                )}
              </span>
            </Alert>
          </ActionButtons>
          {/* <Input
            placeholder="Search Model Name"
            value={query.value}
            onChange={(e) => handleQuery(e.target.value)}
            className="w-[20rem] px-4 py-2 "
          /> */}
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
                              header.getContext(),
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
                            checked={selectedIds.includes(
                              row.original.api_endpoint_id,
                            )}
                            onCheckedChange={(value) => {
                              if (value) {
                                // Select only the current row (deselect others)
                                table.setRowSelection({ [row.id]: true });
                                handleRowSelection(row.original);
                              } else {
                                // Deselect current row
                                table.setRowSelection({});
                                handleRowSelection({} as IAPIEndpoint);
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
                    colSpan={columns.length}
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
            {selectedEndPoints.length} row(s) selected.
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

export default ManageApiEndpoints;
