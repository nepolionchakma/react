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
import { ChevronDown, Edit, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAACContext } from "@/Context/ManageAccessEntitlements/AdvanceAccessControlsContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ring } from "ldrs";
import columns from "./Columns";
import AddModel from "../Modal/AddModel";
import EditModel from "../Modal/EditModel";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { ITenantsAndEnterprisesTypes } from "@/types/interfaces/users.interface";
import Pagination5 from "@/components/Pagination/Pagination5";

const TenancyAndEnterpriseTable = () => {
  const { isLoading, stateChange, fetchManageAccessModels } = useAACContext();
  ring.register();
  const api = useAxiosPrivate();
  const [selectedTenancyItem, setSelectedTenancyItem] = React.useState<
    ITenantsAndEnterprisesTypes[]
  >([]);
  const [isOpenAddModal, setIsOpenAddModal] = React.useState<boolean>(false);
  const [isOpenEditModal, setIsOpenEditModal] = React.useState<boolean>(false);
  const [willBeDelete, setWillBeDelete] = React.useState<
    ITenantsAndEnterprisesTypes[]
  >([]);

  const [data, setData] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [totalPage, setTotalPage] = React.useState<number>();
  const limit = 2;
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // const res = await api.get(
        //   `/def-tenant-enterprise-setup/${page}/${limit}`
        // );
        const [res, totalData] = await Promise.all([
          api.get(`/def-tenant-enterprise-setup/${page}/${limit}`),
          api.get(`/def-tenant-enterprise-setup`),
        ]);
        setData(res.data);
        setTotalPage(Math.ceil(totalData.data.length / limit));
        console.log(res, "res");
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [page]);

  React.useEffect(() => {
    fetchManageAccessModels();
    table.getRowModel().rows.map((row) => row.toggleSelected(false));
    setSelectedTenancyItem([]);
  }, [stateChange]);

  // form
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
  const handleRowSelection = (rowData: ITenantsAndEnterprisesTypes) => {
    console.log(rowData, "rowData");
    // setSelectedAccessModelItem((prevSelected) => {
    //   if (prevSelected.includes(rowData)) {
    //     // If the id is already selected, remove it
    //     return prevSelected.filter((selectedId) => selectedId !== rowData);
    //   } else {
    //     // If the id is not selected, add it
    //     return [...prevSelected, rowData];
    //   }
    // });
  };
  const handleDeleteCalculate = async () => {
    // const results: IManageAccessModelLogicExtendTypes[] = [];
    // try {
    //   const deletePromises = selectedAccessModelItem.map((item) =>
    //     manageAccessModelLogicsDeleteCalculate(item.manage_access_model_id)
    //   );
    //   const responses = await Promise.all(deletePromises);
    //   responses.forEach((res) => {
    //     if (Array.isArray(res)) {
    //       results.push(...res);
    //     } else if (res) {
    //       results.push(res);
    //     }
    //   });
    //   setWillBeDelete((prev) => [...prev, ...results]);
    // } catch (error) {
    //   console.error("Error deleting access model items:", error);
    // }
  };

  const handleDelete = async () => {};
  // default hidden columns
  const hiddenColumns = [
    "redbeat_schedule_name",
    "task_id",
    "args",
    "kwargs",
    "last_updated_date",
    "revision_date",
  ];

  React.useEffect(() => {
    table.getAllColumns().forEach((column) => {
      if (hiddenColumns.includes(column.id)) {
        column.toggleVisibility(false);
      }
    });
  }, [table]);

  return (
    <div className="w-full">
      {isOpenAddModal && (
        <AddModel items={data} setOpenAddModal={setIsOpenAddModal} />
      )}
      {isOpenEditModal && (
        <EditModel
          setOpenEditModal={setIsOpenEditModal}
          isOpenEditModal={isOpenEditModal}
        />
      )}

      <div className="flex items-center py-4">
        <div className="flex gap-2 items-center mx-2 border p-1 rounded-md">
          <Plus
            onClick={() => setIsOpenAddModal(true)}
            className="hover:scale-110 duration-300 cursor-pointer"
          />

          <Edit
            onClick={() =>
              selectedTenancyItem.length > 0 && setIsOpenEditModal(true)
            }
            className={`hover:scale-110 duration-300 cursor-pointer ${
              selectedTenancyItem.length === 1
                ? "text-black "
                : "text-slate-200"
            }`}
          />
          <AlertDialog>
            <AlertDialogTrigger disabled={selectedTenancyItem.length === 0}>
              <Trash
                onClick={handleDeleteCalculate}
                className={`hover:scale-110 duration-300 ${
                  selectedTenancyItem.length === 0
                    ? "text-slate-200 cursor-not-allowed"
                    : "text-black cursor-pointer"
                }`}
              />
            </AlertDialogTrigger>

            <AlertDialogContent className="overflow-y-auto max-h-[90%]">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-red-500">
                  {selectedTenancyItem.map((modelItem) => (
                    <span key={modelItem.tenant_name}>
                      <span className="capitalize mt-3 font-bold block">
                        ACCESS_MODEL_NAME : model_name
                      </span>
                      <span>
                        {isLoading ? (
                          <span className="block">
                            <l-tailspin
                              size="40"
                              stroke="5"
                              speed="0.9"
                              color="black"
                            ></l-tailspin>
                          </span>
                        ) : (
                          <span>
                            {willBeDelete
                              .filter(
                                (item) =>
                                  item.tenant_name === modelItem.tenant_name
                              )
                              .map((item, index) => (
                                <span
                                  key={index}
                                  className="capitalize flex items-center text-red-500"
                                >
                                  {index + 1}. tenant_name - {item.tenant_name}
                                </span>
                              ))}
                          </span>
                        )}
                      </span>
                    </span>
                  ))}
                  <span className="block mt-3 text-neutral-500">
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="sticky -bottom-2 right-0 mt-4">
                <AlertDialogCancel onClick={() => setWillBeDelete([])}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <Input
          placeholder="Filter by Enterprise name..."
          value={
            (table.getColumn("enterprise_name")?.getFilterValue() as string) ??
            ""
          }
          onChange={(event) =>
            table
              .getColumn("enterprise_name")
              ?.setFilterValue(event.target.value)
          }
          className="max-w-sm h-8"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto h-8">
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="border h-9 py-0 px-1 border-slate-400 bg-slate-200"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {/* Example: Checkbox for selecting all rows */}
                      {header.id === "select" && (
                        <Checkbox
                          checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() &&
                              "indeterminate")
                          }
                          onCheckedChange={(value) => {
                            // Toggle all page rows selected
                            table.toggleAllPageRowsSelected(!!value);

                            // Use a timeout to log the selected data
                            setTimeout(() => {
                              const selectedRows = table
                                .getSelectedRowModel()
                                .rows.map((row) => row.original);
                              // console.log(selectedRows);
                              setSelectedTenancyItem(selectedRows);
                            }, 0);
                          }}
                          className=""
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
                    <TableCell key={cell.id} className="border p-0 w-fit h-9">
                      {index === 0 ? (
                        <Checkbox
                          className="m-1"
                          checked={row.getIsSelected()}
                          onCheckedChange={(value) =>
                            row.toggleSelected(!!value)
                          }
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
      {/* Start Pagination */}
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
};
export default TenancyAndEnterpriseTable;
