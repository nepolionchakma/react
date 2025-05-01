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

interface IEnterpriseDataProps {
  tabName: string;
  action: string;
  setAction: React.Dispatch<React.SetStateAction<string>>;
  selectedEnterpriseRows: IEnterprisesTypes[];
  setSelectedEnterpriseRows: React.Dispatch<
    React.SetStateAction<IEnterprisesTypes[]>
  >;
  stateChanged: number;
  setStateChanged: React.Dispatch<React.SetStateAction<number>>;
}

export function EnterpriseDataTable({
  tabName,
  action,
  setAction,
  selectedEnterpriseRows,
  setSelectedEnterpriseRows,
  stateChanged,
  setStateChanged,
}: IEnterpriseDataProps) {
  const api = useAxiosPrivate();
  const [data, setData] = React.useState<IEnterprisesTypes[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [page, setPage] = React.useState<number>(1);
  const [totalPage, setTotalPage] = React.useState<number>(1);
  const limit = 8;

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

  const handleRowSelection = (rowSelection: IEnterprisesTypes) => {
    setSelectedEnterpriseRows((prevSelected) => {
      if (prevSelected.includes(rowSelection)) {
        return prevSelected.filter((item) => item !== rowSelection);
      } else {
        return [...prevSelected, rowSelection];
      }
    });
  };

  const handleCloseModal = () => {
    setAction(""); // close modal
    setSelectedEnterpriseRows([]);
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
        const res = await api.get(
          `/def-tenant-enterprise-setup/${page}/${limit}`
        );
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
        {tabName && tabName === "enterprise" && action && (
          <EnterpriseCreateAndEditModal
            action={action}
            tabName={tabName}
            selectedEnterpriseRows={selectedEnterpriseRows}
            setStateChanged={setStateChanged}
            handleCloseModal={handleCloseModal}
          />
        )}
      </>
      <>
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
      </>
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
  );
}
