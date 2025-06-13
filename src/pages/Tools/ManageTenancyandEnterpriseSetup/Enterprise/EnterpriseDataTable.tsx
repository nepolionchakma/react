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
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
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
import { toast } from "@/components/ui/use-toast";

interface IEnterpriseDataProps {
  tabName: string;
  action: string;
  setAction: React.Dispatch<React.SetStateAction<string>>;
  selectedEnterpriseRows: IEnterprisesTypes[];
  setSelectedEnterpriseRows: React.Dispatch<
    React.SetStateAction<IEnterprisesTypes[]>
  >;
}

export function EnterpriseDataTable({
  tabName,
  action,
  setAction,
  selectedEnterpriseRows,
  setSelectedEnterpriseRows,
}: IEnterpriseDataProps) {
  const api = useAxiosPrivate();
  const [data, setData] = React.useState<IEnterprisesTypes[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [page, setPage] = React.useState<number>(1);
  const [totalPage, setTotalPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(8);
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

  React.useEffect(() => {
    if (selectedEnterpriseRows.length !== data.length || data.length === 0) {
      setIsSelectAll(false);
    } else {
      setIsSelectAll(true);
    }

    const selected = selectedEnterpriseRows.map((sel) => sel.tenant_id);
    setSelectedIds(selected);
  }, [selectedEnterpriseRows.length, data.length]);

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

  const handleRowSelection = (rowSelection: IEnterprisesTypes) => {
    if (selectedIds.includes(rowSelection.tenant_id)) {
      const newSelected = selectedEnterpriseRows.filter(
        (row) => row.tenant_id !== rowSelection.tenant_id
      );
      setSelectedEnterpriseRows(newSelected);
    } else {
      setSelectedEnterpriseRows((prev) => [...prev, rowSelection]);
    }
  };

  const handleSelectAll = () => {
    if (isSelectAll) {
      setIsSelectAll(false);
      setSelectedEnterpriseRows([]);
    } else {
      setIsSelectAll(true);
      setSelectedEnterpriseRows(data);
    }
  };

  const handleCloseModal = () => {
    setAction("");
  };

  const handleRow = (value: number) => {
    if (value < 1) {
      toast({
        title: "The value must be greater than 0",
        variant: "destructive",
      });
      return;
    } else {
      setLimit(value);
    }
  };

  React.useEffect(() => {
    handleCloseModal();
  }, [page, stateChanged, limit]);

  React.useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(
          `/def-tenant-enterprise-setup/${page}/${limit}`
        );
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
  }, [api, page, stateChanged, limit]);

  console.log(tabName, "tabname", action);

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
          <div className="flex gap-2 items-center ml-auto">
            <h3>Rows :</h3>
            <input
              type="number"
              placeholder="Rows"
              value={limit}
              min={1}
              onChange={(e) => handleRow(Number(e.target.value))}
              className="w-14 border rounded-md p-2"
            />
          </div>
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
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={`border border-slate-400 bg-slate-200 p-1 h-9 ${
                        index === 0
                          ? "w-7"
                          : index === 1
                          ? "w-40"
                          : index === 3 && "w-64"
                      }`}
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
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell key={cell.id} className={`border p-1 h-8`}>
                      {index === 0 ? (
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
