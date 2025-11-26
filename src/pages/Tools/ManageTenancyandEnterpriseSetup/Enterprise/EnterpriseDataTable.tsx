import * as React from "react";
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
import columns from "./Columns";
import { IEnterprisesTypes } from "@/types/interfaces/users.interface";
import Pagination5 from "@/components/Pagination/Pagination5";
import EnterpriseCreateAndEditModal from "../Modal/EnterpriseCreateAndEditModal";
import { Checkbox } from "@/components/ui/checkbox";
import ActionItems from "./ActionItems";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import Rows from "@/components/Rows/Rows";
import { convertToTitleCase } from "@/Utility/general";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { loadData } from "@/Utility/funtion";

interface IEnterpriseDataProps {
  tabName: string;
  action: string;
  setAction: React.Dispatch<React.SetStateAction<string>>;
  selectedEnterpriseRows: IEnterprisesTypes[];
  setSelectedEnterpriseRows: React.Dispatch<
    React.SetStateAction<IEnterprisesTypes[]>
  >;
  enterpriseLimit: number;
  setEnterpriseLimit: React.Dispatch<React.SetStateAction<number>>;
}

export function EnterpriseDataTable({
  tabName,
  action,
  setAction,
  selectedEnterpriseRows,
  setSelectedEnterpriseRows,
  enterpriseLimit,
  setEnterpriseLimit,
}: IEnterpriseDataProps) {
  const { enterpriseSetting, token } = useGlobalContext();
  const [data, setData] = React.useState<IEnterprisesTypes[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [page, setPage] = React.useState<number>(1);
  const [totalPage, setTotalPage] = React.useState<number>(1);
  const [stateChanged, setStateChanged] = React.useState<number>(0);
  // const [isSelectAll, setIsSelectAll] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  // const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // React.useEffect(() => {
  //   if (selectedEnterpriseRows.length !== data.length || data.length === 0) {
  //     setIsSelectAll(false);
  //   } else {
  //     setIsSelectAll(true);
  //   }

  //   const selected = selectedEnterpriseRows.map((sel) => sel.tenant_id);
  //   setSelectedIds(selected);
  // }, [selectedEnterpriseRows.length, data.length]);

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
        pageSize: enterpriseLimit,
      },
    },
  });

  // const handleRowSelection = (rowSelection: IEnterprisesTypes) => {
  //   if (selectedIds.includes(rowSelection.tenant_id)) {
  //     const newSelected = selectedEnterpriseRows.filter(
  //       (row) => row.tenant_id !== rowSelection.tenant_id
  //     );
  //     setSelectedEnterpriseRows(newSelected);
  //   } else {
  //     setSelectedEnterpriseRows((prev) => [...prev, rowSelection]);
  //   }
  // };

  // const handleSelectAll = () => {
  //   if (isSelectAll) {
  //     setIsSelectAll(false);
  //     setSelectedEnterpriseRows([]);
  //   } else {
  //     setIsSelectAll(true);
  //     setSelectedEnterpriseRows(data);
  //   }
  // };

  const handleCloseModal = () => {
    setAction("");
  };

  React.useEffect(() => {
    setAction("");
  }, [page, stateChanged, enterpriseLimit, setAction]);

  React.useEffect(() => {
    const fetch = async () => {
      const params = {
        baseURL: FLASK_URL,
        url: `${flaskApi.EnterpriseSetup}?page=${page}&limit=${enterpriseLimit}`,
        setLoading: setIsLoading,
        accessToken: token.access_token,
      };

      const res = await loadData(params);

      if (res) {
        setData(res.result);
        setTotalPage(res.pages);
      }
    };
    fetch();
  }, [page, stateChanged, enterpriseLimit, token.access_token]);

  return (
    <div className="w-full">
      <>
        {tabName && tabName === "Enterprise" && action && (
          <EnterpriseCreateAndEditModal
            action={action}
            tabName={tabName}
            selectedEnterpriseRows={selectedEnterpriseRows}
            setSelectedEnterpriseRows={setSelectedEnterpriseRows}
            setStateChanged={setStateChanged}
            handleCloseModal={handleCloseModal}
          />
        )}
      </>
      {/* Action Items */}
      <div className="flex items-center justify-between py-1">
        <ActionItems
          selectedEnterpriseRows={selectedEnterpriseRows}
          setAction={setAction}
          setStateChanged={setStateChanged}
          setSelectedEnterpriseRows={setSelectedEnterpriseRows}
        />
        <div className="flex items-center gap-2">
          <Rows limit={enterpriseLimit} setLimit={setEnterpriseLimit} />

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
      {/* Table  */}
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
                      {/* {header.id === "select" && (
                        <Checkbox
                          checked={isSelectAll}
                          // onClick={handleSelectAll}
                          aria-label="Select all"
                        />
                      )} */}
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
                        width: cell.column.getSize(),
                        minWidth: cell.column.columnDef.minSize,
                      }}
                    >
                      {cell.column.id === "select" ? (
                        <Checkbox
                          disabled={
                            enterpriseSetting?.tenant_id !==
                            row.original.tenant_id
                          }
                          className="mt-1"
                          checked={
                            enterpriseSetting?.tenant_id ===
                            row.original.tenant_id
                          }
                          // onClick={() => handleRowSelection(row.original)}
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

        <div className="flex justify-between p-1">
          <div className="flex-1 text-sm text-gray-600">
            {selectedEnterpriseRows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
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
}
