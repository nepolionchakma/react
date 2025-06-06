import * as React from "react";
import { tailspin } from "ldrs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  ColumnDef,
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
import { ArrowUpDown, ChevronDown, FileEdit, Plus, Trash } from "lucide-react";
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
import DataSourceDataAdd from "@/components/DataSourceDataAdd/DataSourceDataAdd";
import { IDataSourceTypes } from "@/types/interfaces/datasource.interface";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import Pagination5 from "@/components/Pagination/Pagination5";

const ManageDataSources = () => {
  const { fetchDataSources, deleteDataSource, getSearchDataSources } =
    useGlobalContext();
  const [data, setData] = React.useState<IDataSourceTypes[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [query, setQuery] = React.useState({ isEmpty: true, value: "" });
  const [save, setSave] = React.useState<number>(0);
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(8);
  const [totalPage, setTotalPage] = React.useState<number | undefined>();
  // const [currentPage, setCurrentPage] = React.useState<number | undefined>();
  // Fetch Data
  // React.useEffect(() => {
  //   const fetchData = async () => {
  //     setIsLoading(true);
  //     try {
  //       const result = await fetchDataSources(page, limit);
  //       setTotalPage(result?.totalPages);
  //       // setCurrentPage(result?.currentPage);
  //       setData(result?.results ?? []);
  //     } catch (error) {
  //       console.error("Error fetching data sources:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [save, page, limit]);
  // loader
  tailspin.register();
  // Shadcn Form
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [selected, setSelected] = React.useState<IDataSourceTypes[]>([]);

  const handleQuery = (e: string) => {
    if (e === "") {
      console.log(e === "");
      setQuery({ isEmpty: true, value: e });
    } else {
      setQuery({ isEmpty: false, value: e });
    }
  };

  // When query changes, reset page to 1
  React.useEffect(() => {
    if (!query.isEmpty) {
      setPage(1);
    }
  }, [query]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (!query.isEmpty) {
          const results = await getSearchDataSources(page, limit, query.value);
          if (results) {
            setData(results);
          }
        } else {
          const res = await fetchDataSources(page, limit);
          if (res) {
            setTotalPage(res?.totalPages);
            setData(res.results);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    setIsLoading(true);
    // Debounce only when query changes
    const delayDebounce = setTimeout(() => {
      fetchData();
    }, 1000);

    return () => clearTimeout(delayDebounce); // Cleanup timeout
  }, [query, page, save, limit]);

  // select row
  const handleRowSelection = (rowData: IDataSourceTypes) => {
    setSelected((prevSelected) => {
      if (prevSelected.includes(rowData)) {
        // If the id is already selected, remove it
        return prevSelected.filter((selectedId) => selectedId !== rowData);
      } else {
        // If the id is not selected, add it
        return [...prevSelected, rowData];
      }
    });
  };

  // const handleInputChange = (id: number, field: string, value: string) => {
  //   setData((prevData) =>
  //     prevData.map((item) =>
  //       item.data_source_id === id ? { ...item, [field]: value } : item
  //     )
  //   );
  // };

  const columns: ColumnDef<IDataSourceTypes>[] = [
    {
      id: "select",
      // header: ({ table }) => {
      //   return (
      //     <Checkbox
      //       checked={
      //         table.getIsAllPageRowsSelected() ||
      //         (table.getIsSomePageRowsSelected() && "indeterminate")
      //       }
      //       onCheckedChange={(value) => {
      //         table.toggleAllPageRowsSelected(!!value);
      //         setIsChecked(!isChecked);
      //       }}
      //       aria-label="Select all"
      //     />
      //   );
      // },
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onClick={() => handleRowSelection(row.original)}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "datasource_name",
      header: ({ column }) => {
        return (
          <div
            className="min-w-max"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Datasource Name{" "}
            <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
          </div>
        );
      },
      // header: "Datasource Name",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("datasource_name")}</div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="capitalize min-w-[20rem]">
          {row.getValue("description")}
        </div>
      ),
    },
    {
      accessorKey: "application_type",
      header: () => {
        return <div className="min-w-max">Application Type</div>;
      },
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("application_type")}</div>
      ),
    },
    {
      accessorKey: "application_type_version",
      header: () => {
        return <div className="min-w-max">Application Type Version</div>;
      },
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue("application_type_version")}
        </div>
      ),
    },
    {
      accessorKey: "last_access_synchronization_date",
      header: () => {
        return (
          <div className="min-w-max">Last Access Synchronization Date</div>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("last_access_synchronization_date"));
        const convertDate = (isoDateString: Date) => {
          const date = new Date(isoDateString);
          const formattedDate = date.toLocaleString();
          return formattedDate;
        };

        return <div className="capitalize">{convertDate(date)}</div>;
      },
    },
    {
      accessorKey: "last_access_synchronization_status",
      header: () => {
        return (
          <div className="min-w-max">Last Access Synchronization Status</div>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue("last_access_synchronization_status")}
        </div>
      ),
    },
    {
      accessorKey: "last_transaction_synchronization_date",
      header: () => {
        return (
          <div className="min-w-max">Last Transaction Synchronization Date</div>
        );
      },
      cell: ({ row }) => {
        const sliceDate = String(
          row.getValue("last_transaction_synchronization_date")
        ).toString();

        return <div className="capitalize">{sliceDate}</div>;
      },
    },
    {
      accessorKey: "last_transaction_synchronization_status",
      header: () => {
        return (
          <div className="min-w-max">
            Last Transaction Synchronization Status
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue("last_transaction_synchronization_status")}
        </div>
      ),
    },
    {
      accessorKey: "default_datasource",
      header: () => {
        return <div className="min-w-max">Default Datasource</div>;
      },
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("default_datasource")}</div>
      ),
    },
  ];
  //
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

  // Hide default columns
  const hiddenColumns = [
    "last_access_synchronization_status",
    "last_transaction_synchronization_status",
    "last_transaction_synchronization_date",
    "default_datasource",
  ];

  React.useEffect(() => {
    table.getAllColumns().forEach((column) => {
      if (hiddenColumns.includes(column.id)) {
        column.toggleVisibility(false);
      }
    });
  }, [table]);

  // Select for edit, delete
  React.useEffect(() => {
    setSelected(table.getSelectedRowModel().rows.map((row) => row.original));
  }, [table.getSelectedRowModel().rows]);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      setRowSelection({});
      // Iterate through the selected IDs and delete them one by one
      for (const data of selected) {
        await deleteDataSource(data.def_data_source_id);
      }
      // Update the `save` state to trigger data re-fetching
      setSave((prevSave) => prevSave + 1);
    } catch (error) {
      console.error("Error deleting data sources:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const maxID =
    data.length > 0
      ? Math.max(...data.map((item) => item.def_data_source_id))
      : 0;

  return (
    <div className="w-full">
      {/* top icon and columns*/}
      <div className="flex gap-3 items-center py-2">
        <div className="flex gap-3">
          <div className="flex gap-3 px-4 py-2 border rounded">
            <AlertDialog>
              <AlertDialogTrigger>
                <Plus className="cursor-pointer" />
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-300">
                <AlertDialogHeader>
                  <AlertDialogTitle>Create Datasource</AlertDialogTitle>
                  <AlertDialogDescription></AlertDialogDescription>
                </AlertDialogHeader>
                <div>
                  <DataSourceDataAdd
                    props="add"
                    maxID={maxID}
                    setSave={setSave}
                    selected={selected}
                    setRowSelection={setRowSelection}
                  />
                </div>
                <AlertDialogFooter></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger
                disabled={selected.length !== 1}
                className={`${
                  selected.length !== 1 && "text-slate-200 cursor-not-allowed"
                }`}
              >
                <FileEdit
                  className={`${
                    selected.length === 1
                      ? "cursor-pointer "
                      : "cursor-not-allowed"
                  }`}
                />
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-300">
                <AlertDialogHeader>
                  <AlertDialogTitle>Edit Datasource</AlertDialogTitle>
                  <AlertDialogDescription></AlertDialogDescription>
                </AlertDialogHeader>
                <div>
                  <DataSourceDataAdd
                    props="update"
                    selected={selected}
                    editAble={true}
                    setSave={setSave}
                    setRowSelection={setRowSelection}
                  />
                </div>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger
                disabled={selected.length < 1}
                className={`${
                  selected.length < 1 && "text-slate-200 cursor-not-allowed"
                }`}
              >
                <Trash
                  className={`${
                    selected.length > 0
                      ? "cursor-pointer"
                      : "cursor-not-allowed"
                  }`}
                />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers. You are
                    selected {selected.length}{" "}
                    {selected.length > 1 ? "rows" : "row"}. Data Source Name is
                    :{" "}
                    {selected.map((row, i) => (
                      <span
                        key={row.def_data_source_id}
                        className="flex flex-col text-black"
                      >
                        {i + 1}. {row.datasource_name}
                      </span>
                    ))}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  {isLoading ? (
                    <l-tailspin
                      size="40"
                      stroke="5"
                      speed="0.9"
                      color="black"
                    />
                  ) : (
                    <AlertDialogAction onClick={handleDelete}>
                      Continue
                    </AlertDialogAction>
                  )}
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <Input
          placeholder="Filter by Datasource Name"
          value={query.value}
          onChange={(e) => handleQuery(e.target.value)}
          className="max-w-sm px-4 py-2"
        />
        <div className="flex gap-2 items-center ml-auto">
          <h3>Rows :</h3>
          <input
            type="number"
            placeholder="Rows"
            value={limit}
            min={1}
            max={20}
            onChange={(e) => setLimit(Number(e.target.value))}
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
      {/* Table */}
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
                      {header.id === "select" && (
                        <Checkbox
                          className="m-1"
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
                              setSelected(selectedRows);
                            }, 0);
                          }}
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
                    <TableCell key={cell.id} className="border py-0 px-1">
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
};
export default ManageDataSources;
