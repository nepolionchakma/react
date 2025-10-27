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
import CustomTooltip from "@/components/Tooltip/Tooltip";
import ActionButtons from "@/components/ActionButtons/ActionButtons";
import Rows from "@/components/Rows/Rows";
import { convertToTitleCase } from "@/Utility/general";
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
    combinedUser,
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
  const [limit, setLimit] = React.useState<number>(4);

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
        setSelectedUser({} as IUsersInfoTypes);
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
      setSelectedUser({} as IUsersInfoTypes);
    } else {
      setSelectedUser(rowSelection);
    }
  };

  const handleDelete = () => {
    deleteCombinedUser([selectedUser]);
    //table toggle empty
    table.getRowModel().rows.map((row) => row.toggleSelected(false));
    setSelectedUser({} as IUsersInfoTypes);
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

  const handleOpenModal = (modelName: string) => {
    setIsOpenModal(modelName);
  };
  const handleCloseModal = () => {
    setIsOpenModal(""); // close modal
  };

  return (
    <div className="px-3">
      {isOpenModal === "add_user" ? (
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
          <ActionButtons>
            {/* Add  */}
            <CustomTooltip tooltipTitle="Add">
              <PlusIcon
                className="cursor-pointer"
                onClick={() => handleOpenModal("add_user")}
              />
            </CustomTooltip>
            {/* Edit  */}
            <button disabled={!selectedUser.user_id}>
              <CustomTooltip tooltipTitle="Edit">
                <FileEdit
                  className={`${
                    !selectedUser.user_id
                      ? "text-slate-200 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  onClick={() => handleOpenModal("edit_user")}
                />
              </CustomTooltip>
            </button>
            {/* Delete  */}
            <Alert
              disabled={
                !selectedUser.user_id ||
                combinedUser?.user_type?.toLocaleLowerCase() !== "system"
              } // disable condition
              tooltipTitle="Delete" // tooltip title
              actionName="delete" // Cancel/Reschedule
              onContinue={handleDelete} // function
            >
              <span>Username : {selectedUser.user_name}</span>
            </Alert>
          </ActionButtons>

          {/* Search  */}
          <Input
            placeholder="Search Username"
            value={query.value}
            onChange={(e) => handleQuery(e.target.value)}
            className="w-[20rem] px-4 py-2"
          />
        </div>

        <div className="flex items-center gap-2">
          <Rows limit={limit} setLimit={setLimit} />
          {/* Columns */}
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
                              header.getContext()
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
                            checked={row.getIsSelected()}
                            onCheckedChange={(value) => {
                              if (value) {
                                // Select only the current row (deselect others)
                                table.setRowSelection({ [row.id]: true });
                              } else {
                                // Deselect current row
                                table.setRowSelection({});
                              }
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
            {!selectedUser.user_id ? 0 : 1} of{" "}
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
