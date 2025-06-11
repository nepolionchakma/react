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
import { ChevronDown, FileEdit, PlusIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { tailspin } from "ldrs";
tailspin.register();
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
import { Input } from "@/components/ui/input";
import Alert from "@/components/Alert/Alert";
import { toast } from "@/components/ui/use-toast";
interface Props {
  selectedUser: IUsersInfoTypes;
  setSelectedUser: React.Dispatch<React.SetStateAction<IUsersInfoTypes>>;
}
export function UsersTable({ selectedUser, setSelectedUser }: Props) {
  const {
    // isLoading,
    // setIsLoading,
    fetchCombinedUser,
    searchCombinedUser,
    // usersInfo: data,
    // page,
    // setPage,
    // totalPage,
    deleteCombinedUser,
    isOpenModal,
    setIsOpenModal,
    token,
    stateChange,
  } = useGlobalContext();
  const [data, setData] = React.useState<IUsersInfoTypes[] | []>([]);
  const [page, setPage] = React.useState(1);
  const [totalPage, setTotalPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [query, setQuery] = React.useState({ isEmpty: true, value: "" });
  const [limit, setLimit] = React.useState<number>(3);

  const handleQuery = (e: string) => {
    if (e === "") {
      setQuery({ isEmpty: true, value: e });
      setPage(1);
    } else {
      setQuery({ isEmpty: false, value: e });
      setPage(1);
    }
  };
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (!query.isEmpty) {
          const res = await searchCombinedUser(page, limit, query.value);

          if (res) {
            setData(res.items);
            setPage(res.page);
            setTotalPage(res.pages);
          }
        } else {
          const res = await fetchCombinedUser(page, limit);
          if (res) {
            setData(res.items);
            setPage(res.page);
            setTotalPage(res.pages);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
        //table toggle false
        table.toggleAllRowsSelected(false);
        // setSelected([]);
      }
    };
    setIsLoading(true);
    const delayDebounce = setTimeout(() => {
      fetchData();
      handleCloseModal();
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [limit, page, query.value, stateChange]);

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
      pagination: {
        pageIndex: 0,
        pageSize: limit,
      },
    },
  });

  const handleOpenModal = (modelName: string) => {
    setIsOpenModal(modelName);
  };
  const handleCloseModal = () => {
    setIsOpenModal(""); // close modal
  };

  const handleRow = (value: number) => {
    if (value < 1) {
      toast({
        title: "The value must getter than 0",
        variant: "destructive",
      });
      return;
    } else {
      setLimit(value);
      setPage(1);
    }
  };
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
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-2 items-center  border p-2 rounded-md">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <PlusIcon
                    className="cursor-pointer"
                    onClick={() => handleOpenModal("create_user")}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create An Account</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger disabled={selectedUser.user_id === 0}>
                  <FileEdit
                    className={`${
                      selectedUser.user_id === 0
                        ? "text-slate-200 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                    onClick={() => handleOpenModal("edit_user")}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Account</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Alert
              disabled={
                selectedUser.user_id === 0 ||
                token.user_type.toLocaleLowerCase() !== "system"
              } // disable condition
              tooltipTitle="Delete Account" // tooltip title
              actionName="delete" // Cancel/Reschedule
              onContinue={handleDelete} // funtion
            >
              <span className="block text-black">
                1. username : {selectedUser.user_name}
              </span>
            </Alert>
          </div>
          <Input
            placeholder="Search by User Task Name.."
            value={query.value}
            onChange={(e) => handleQuery(e.target.value)}
            className="w-[20rem] px-4 py-2"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-2 items-center ml-auto">
            <h3>Rows :</h3>
            <input
              type="number"
              placeholder="Rows"
              value={limit}
              min={1}
              // max={20}
              onChange={(e) => handleRow(Number(e.target.value))}
              className="w-14 border rounded p-2"
            />
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
                            // onCheckedChange={(value) => {
                            //   row.toggleSelected(!!value);
                            // }}
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
