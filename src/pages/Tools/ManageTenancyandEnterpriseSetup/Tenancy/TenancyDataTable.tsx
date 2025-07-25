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
import TenancyCreateAndEditModal from "../Modal/TenancyCreateAndEditModal";
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
import { toast } from "@/components/ui/use-toast";
import Rows from "@/components/Rows/Rows";

interface ITenantsDataProps {
  tabName: string;
  action: string;
  setAction: React.Dispatch<React.SetStateAction<string>>;
  selectedTenancyRows: ITenantsTypes[];
  setSelectedTenancyRows: React.Dispatch<React.SetStateAction<ITenantsTypes[]>>;
  tenancyLimit: number;
  setTenancyLimit: React.Dispatch<React.SetStateAction<number>>;
}

export function TenancyDataTable({
  tabName,
  action,
  setAction,
  selectedTenancyRows,
  setSelectedTenancyRows,
  tenancyLimit,
  setTenancyLimit,
}: ITenantsDataProps) {
  const api = useAxiosPrivate();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [data, setData] = React.useState<ITenantsTypes[]>([]);
  const [page, setPage] = React.useState<number>(1);
  const [totalPage, setTotalPage] = React.useState<number>(1);

  const [stateChanged, setStateChanged] = React.useState<number>(0);
  const [isSelectAll, setIsSelectAll] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [colSizing, setColSizing] = React.useState<ColumnSizingState>({});

  React.useEffect(() => {
    if (selectedTenancyRows.length !== data.length || data.length === 0) {
      setIsSelectAll(false);
    } else {
      setIsSelectAll(true);
    }

    const selected = selectedTenancyRows.map((sel) => sel.tenant_id);
    setSelectedIds(selected);
  }, [selectedTenancyRows.length, data.length]);

  // const selectedTenancyRowsID = selectedTenancyRows.map((row) => row.tenant_id);

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
        (row) => row.tenant_id !== rowSelection.tenant_id
      );
      setSelectedTenancyRows(newSelected);
    } else {
      setSelectedTenancyRows((prev) => [...prev, rowSelection]);
    }
  };

  const handleCloseModal = () => {
    setAction("");
  };

  React.useEffect(() => {
    handleCloseModal();
  }, [page, stateChanged, tenancyLimit]);

  React.useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/def-tenants/${page}/${tenancyLimit}`);

        setData(res.data.items);
        setTotalPage(res.data.pages);
      } catch (error) {
        if (error instanceof Error) {
          toast({ title: error.message, variant: "destructive" });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [api, page, stateChanged, tenancyLimit]);

  return (
    <div className="w-full">
      <>
        {tabName && tabName === "Tenancy" && action && (
          <TenancyCreateAndEditModal
            action={action}
            tabName={tabName}
            selectedTenancyRows={selectedTenancyRows}
            setSelectedTenancyRows={setSelectedTenancyRows}
            setStateChanged={setStateChanged}
            handleCloseModal={handleCloseModal}
          />
        )}
      </>
      {/* Action Items */}
      <div className="flex items-center justify-between py-1">
        <ActionItems
          selectedTenancyRows={selectedTenancyRows}
          setAction={setAction}
          setStateChanged={setStateChanged}
          setSelectedTenancyRows={setSelectedTenancyRows}
        />
        <div className="flex items-center gap-2">
          <Rows limit={tenancyLimit} setLimit={setTenancyLimit} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
                      {column.id}
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
                      className={`relative border h-9 py-0 px-1 border-slate-400 bg-slate-200`}
                      style={{
                        width: `${header.getSize()}px`,
                        maxWidth: header.id === "select" ? "10px" : undefined,
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
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      key={cell.id}
                      className={`border py-0 px-1 ${index === 0 && "w-7"}`}
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.columnDef.minSize,
                      }}
                    >
                      {index === 0 ? (
                        <Checkbox
                          className="mt-1"
                          checked={selectedIds.includes(row.original.tenant_id)}
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

        {/* <Table
          style={{
            width: table.getTotalSize(),
            // width: table.getTotalSize(),
            minWidth: "100%",
            // tableLayout: "fixed",
          }}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  if (header.index === 0) {
              
                  }
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        // width: header.index === 0 ? 24 : "auto",
                        width: `${header.getSize()}px`,
                      }}
                      className={`relative border border-slate-400 bg-slate-200 p-1 h-9 
                      `}
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
                      {header.column.getCanResize() && (
                        <div
                          onDoubleClick={() => header.column.resetSize()}
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className="absolute top-0 right-0 cursor-col-resize w-px h-full hover:w-2"
                          style={{
                            userSelect: "none",
                            touchAction: "none",
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
                  className="h-64 text-center"
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
                      className={`border p-1 h-8`}
                      style={{
                        // width: index === 0 ? 24 : cell.column.getSize(),
                        width: cell.column.getSize(),
                        minWidth: cell.column.columnDef.minSize,
                      }}
                    >
                      {cell.column.id === "select" ? (
                        <Checkbox
                          className=""
                          checked={selectedIds.includes(row.original.tenant_id)}
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
        </Table> */}
        <div className="flex justify-between p-1">
          <div className="flex-1 text-sm text-gray-600">
            {selectedTenancyRows.length} of{" "}
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
