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
import { ChevronDown, FileEdit, PlusIcon, Trash } from "lucide-react";
import { tailspin } from "ldrs";
tailspin.register();
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import columns from "./Columns";
import AddUser from "@/components/AddUser/AddUser";
import { IUsersInfoTypes } from "@/types/interfaces/users.interface";
import Pagination5 from "@/components/Pagination/Pagination5";
import CustomModal4 from "@/components/CustomModal/CustomModal4";
interface Props {
  selectedUser: IUsersInfoTypes;
  setSelectedUser: React.Dispatch<React.SetStateAction<IUsersInfoTypes>>;
}
export function UsersTable({ selectedUser, setSelectedUser }: Props) {
  const {
    isLoading,
    fetchCombinedUser,
    usersInfo: data,
    page,
    setPage,
    totalPage,
    deleteCombinedUser,
    isOpenModal,
    setIsOpenModal,
    token,
  } = useGlobalContext();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  React.useEffect(() => {
    fetchCombinedUser();
  }, []);

  const handleRowSelection = (rowSelection: IUsersInfoTypes) => {
    if (selectedUser.user_name === rowSelection.user_name) {
      setSelectedUser({
        user_id: 0,
        user_name: "string",
        email_addresses: "",
        profile_picture: {
          original: "",
          thumbnail: "",
        },
        first_name: "",
        middle_name: "",
        last_name: "",
        job_title: "",
      });
    } else {
      setSelectedUser(rowSelection);
    }
  };

  const handleDelete = () => {
    deleteCombinedUser([selectedUser]);
    //table toggle empty
    table.getRowModel().rows.map((row) => row.toggleSelected(false));
    setSelectedUser({
      user_id: 0,
      user_name: "string",
      email_addresses: "",
      profile_picture: {
        original: "",
        thumbnail: "",
      },
      first_name: "",
      middle_name: "",
      last_name: "",
      job_title: "",
    });
  };
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

  React.useEffect(() => {
    if (page > 1 || page < totalPage) {
      fetchCombinedUser();
    }
  }, [page, totalPage]);
  const handleOpenModal = (modelName: string) => {
    setIsOpenModal(modelName);
  };
  const handleCloseModal = () => {
    setIsOpenModal(""); // close modal
    setSelectedUser({
      user_id: 0,
      user_name: "string",
      email_addresses: "",
      profile_picture: {
        original: "",
        thumbnail: "",
      },
      first_name: "",
      middle_name: "",
      last_name: "",
      job_title: "",
    });
    //table toggle false
    table.toggleAllRowsSelected(false);
  };
  React.useEffect(() => {
    handleCloseModal();
  }, [page]);

  return (
    <div className="px-3">
      {isOpenModal === "create_user" ? (
        <CustomModal4 className="w-[770px] ">
          <AddUser
            selected={selectedUser}
            handleCloseModal={handleCloseModal}
          />
        </CustomModal4>
      ) : (
        isOpenModal === "edit_user" && (
          <CustomModal4 className="w-[770px] ">
            <AddUser
              selected={selectedUser}
              handleCloseModal={handleCloseModal}
            />
          </CustomModal4>
        )
      )}
      {/* top icon and columns*/}
      <div className="flex gap-3 items-center py-2">
        <div className="flex gap-3">
          <div className="flex gap-3 items-center px-4 py-2 border rounded">
            <div className="flex gap-3">
              <PlusIcon
                className="cursor-pointer"
                onClick={() => handleOpenModal("create_user")}
              />
              <button disabled={selectedUser.user_id === 0}>
                <FileEdit
                  className={`${
                    selectedUser.user_id === 0
                      ? "text-slate-200 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  onClick={() => handleOpenModal("edit_user")}
                />
              </button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    disabled={
                      selectedUser.user_id === 0 || token.user_type !== "System"
                    }
                  >
                    <Trash
                      className={`${
                        selectedUser.user_id === 0 ||
                        token.user_type !== "System"
                          ? "cursor-not-allowed text-slate-200"
                          : "cursor-pointer"
                      }`}
                    />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      <span className="block text-black">
                        1. username : {selectedUser.user_name}
                      </span>
                      This action cannot be undone. This will permanently delete
                      your account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
        {/* Columns */}
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
      {/* Table */}
      <div className="rounded-md border">
        <div>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="border border-slate-400 bg-slate-200 p-1 h-9"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {/* Example: Checkbox for selecting all rows */}
                        {/* {header.id === "select" && (
                          <Checkbox
                            checked={
                              table.getIsAllPageRowsSelected() ||
                              (table.getIsSomePageRowsSelected() &&
                                "indeterminate")
                            }
                            onCheckedChange={(value) => {
                              // Toggle all page rows selected
                              table.toggleAllPageRowsSelected(!!value);
                              setTimeout(() => {
                                const selectedRows = table
                                  .getSelectedRowModel()
                                  .rows.map((row) => row.original);
                                console.log(selectedRows);
                                setSelectedUsers(selectedRows);
                              }, 0);
                            }}
                            className="mr-1"
                            aria-label="Select all"
                          />
                        )} */}
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
                        className={`border p-1 h-8 ${index === 0 && "w-6"}`}
                      >
                        {index === 0 ? (
                          <Checkbox
                            className=""
                            checked={
                              row.original.user_id === selectedUser.user_id
                            }
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
        </div>
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
      {/* Start Pagination */}
    </div>
  );
}
