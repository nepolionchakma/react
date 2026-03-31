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
import Rows from "@/components/Rows/Rows";
import { FLASK_URL } from "@/Api/Api";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { loadData } from "@/Utility/funtion";
import { convertToTitleCase } from "@/Utility/general";

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
  tenancyLimit,
  setTenancyLimit,
}: ITenantsDataProps) {
  const { token, combinedUser } = useGlobalContext();
  const api = useAxiosPrivate();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [data, setData] = React.useState<ITenantsTypes[]>([]);
  const [selectedTenancy, setSelectedTenancy] = React.useState<
    ITenantsTypes | undefined
  >(undefined);
  const [page, setPage] = React.useState<number>(1);
  const [totalPage, setTotalPage] = React.useState<number>(1);
  const [stateChanged, setStateChanged] = React.useState<number>(0);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [colSizing, setColSizing] = React.useState<ColumnSizingState>({});

  // React.useEffect(() => {
  //   if (selectedTenancyRows.length !== data.length || data.length === 0) {
  //     setIsSelectAll(false);
  //   } else {
  //     setIsSelectAll(true);
  //   }

  //   const selected = selectedTenancyRows.map((sel) => sel.tenant_id);
  //   setSelectedIds(selected);
  // }, [selectedTenancyRows.length, data.length, selectedTenancyRows]);

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

  // const handleSelectAll = () => {
  //   if (isSelectAll) {
  //     setIsSelectAll(false);
  //     setSelectedTenancyRows([]);
  //   } else {
  //     setIsSelectAll(true);
  //     setSelectedTenancyRows(data);
  //   }
  // };

  // const handleRowSelection = (rowSelection: ITenantsTypes) => {
  //   if (selectedIds.includes(rowSelection.tenant_id)) {
  //     const newSelected = selectedTenancyRows.filter(
  //       (row) => row.tenant_id !== rowSelection.tenant_id,
  //     );
  //     setSelectedTenancyRows(newSelected);
  //   } else {
  //     setSelectedTenancyRows((prev) => [...prev, rowSelection]);
  //   }
  // };

  const handleCloseModal = () => {
    setAction("");
  };

  // React.useEffect(() => {
  //   handleCloseModal();
  // }, [page, stateChanged, tenancyLimit]);

  React.useEffect(() => {
    const tenancyDataParams = {
      baseURL: FLASK_URL,
      url: `def_tenants/${page}/${tenancyLimit}`,
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
    };
    fetch();
  }, [api, page, stateChanged, token.access_token, tenancyLimit]);

  React.useEffect(() => {
    const tenancyDataParams = {
      baseURL: FLASK_URL,
      url: `/tenants/${combinedUser?.tenant_id}`,
      setLoading: setIsLoading,
      accessToken: `${token.access_token}`,
    };

    const fetchTenancy = async () => {
      const res = await loadData(tenancyDataParams);
      setSelectedTenancy(res);
    };
    fetchTenancy();
  }, [combinedUser?.tenant_id, token.access_token]);

  return (
    <div className="w-full">
      <>
        {tabName && tabName === "Tenancy" && action && (
          <TenancyCreateAndEditModal
            action={action}
            tabName={tabName}
            selectedTenancy={selectedTenancy}
            setStateChanged={setStateChanged}
            handleCloseModal={handleCloseModal}
            setSelectedTenancy={setSelectedTenancy}
          />
        )}
      </>
      {/* Action Items */}
      <div className="flex items-center justify-between py-1">
        <ActionItems setAction={setAction} />
        <div className="flex items-center gap-2">
          <Rows limit={tenancyLimit} setLimit={setTenancyLimit} />

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
                            header.getContext(),
                          )}
                      {/* {header.id === "select" && (
                        <Checkbox
                          checked={isSelectAll}
                          onClick={handleSelectAll}
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
                          checked={
                            row.original.tenant_id === combinedUser?.tenant_id
                          }
                          disabled={
                            row.original.tenant_id !== combinedUser?.tenant_id
                          }
                          // onClick={() => handleRowSelection(row.original)}
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
        <div className="flex justify-end p-1">
          {/* <div className="flex-1 text-sm text-gray-600">
            {sele.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div> */}
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
