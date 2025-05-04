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

interface ITenantsDataProps {
  tabName: string;
  action: string;
  setAction: React.Dispatch<React.SetStateAction<string>>;
  selectedTenancyRows: ITenantsTypes[];
  setSelectedTenancyRows: React.Dispatch<React.SetStateAction<ITenantsTypes[]>>;
}

export function TenancyDataTable({
  tabName,
  action,
  setAction,
  selectedTenancyRows,
  setSelectedTenancyRows,
}: ITenantsDataProps) {
  const api = useAxiosPrivate();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [data, setData] = React.useState<ITenantsTypes[]>([]);
  const [page, setPage] = React.useState<number>(1);
  const [totalPage, setTotalPage] = React.useState<number>(1);
  const limit = 8;
  const [stateChanged, setStateChanged] = React.useState<number>(0);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

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
    },
  });

  const handleRowSelection = (rowSelection: ITenantsTypes) => {
    setSelectedTenancyRows((prevSelected) => {
      if (prevSelected.includes(rowSelection)) {
        return prevSelected.filter((item) => item !== rowSelection);
      } else {
        return [...prevSelected, rowSelection];
      }
    });
  };

  const handleCloseModal = () => {
    setAction(""); // close modal
    setSelectedTenancyRows([]);
    //table toggle false
    table.toggleAllRowsSelected(false);
  };

  React.useEffect(() => {
    handleCloseModal();
  }, [page, stateChanged]);

  React.useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/def-tenants/${page}/${limit}`);
        setData(res.data.results);
        setTotalPage(res.data.totalPages);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [api, page, stateChanged]);

  return (
    <div className="w-full">
      <>
        {tabName && tabName === "tenancy" && action && (
          <TenancyCreateAndEditModal
            action={action}
            tabName={tabName}
            selectedTenancyRows={selectedTenancyRows}
            setStateChanged={setStateChanged}
            handleCloseModal={handleCloseModal}
          />
        )}
      </>
      {/* Action Items */}
      <div className="flex items-center py-1">
        <ActionItems
          selectedTenancyRows={selectedTenancyRows}
          setAction={setAction}
          setStateChanged={setStateChanged}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
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
                        index === 0 ? "w-7" : index === 1 && "w-40"
                      }`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
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
                          checked={row.getIsSelected()}
                          onCheckedChange={(value) => {
                            row.toggleSelected(!!value);
                          }}
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
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
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
