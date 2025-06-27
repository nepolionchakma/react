import { IARMTaskParametersTypes } from "@/types/interfaces/ARM.interface";
import { ColumnDef } from "@tanstack/react-table";
export const columns: ColumnDef<IARMTaskParametersTypes>[] = [
  {
    id: "select",
    size: 24,
    minSize: 24,
    maxSize: 24,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
  },
  {
    accessorKey: "parameter_name",
    enableResizing: true,
    header: "Parameter Name",
    cell: ({ row }) => (
      <div className="min-w-max">{row.getValue("parameter_name")}</div>
    ),
  },
  {
    accessorKey: "task_name",
    enableResizing: true,
    header: "Task Name",
    cell: ({ row }) => (
      <div className="min-w-[11rem]">{row.getValue("task_name")}</div>
    ),
  },
  {
    accessorKey: "description",
    enableResizing: true,
    header: "Description",
    cell: ({ row }) => (
      <div className="min-w-[25rem] capitalize">
        {row.getValue("description")}
      </div>
    ),
  },
  {
    accessorKey: "data_type",
    enableResizing: true,
    header: "Data Type",
    cell: ({ row }) => {
      // const value = ;
      const convertString = (value: string) => {
        switch (value.toLowerCase()) {
          case "integer":
            return "Number";
          case "string":
            return "Text";
          case "varchar":
            return "Text";
          case "boolean":
            return "Boolean";
          case "datetime":
            return "Date and Time";
          case "interval":
            return "Interval";
        }
      };

      return (
        <div className=" min-w-max capitalize">
          {convertString(row.getValue("data_type"))}{" "}
        </div>
      );
    },
  },
  {
    accessorKey: "created_by",
    enableResizing: true,
    header: "Created By",
    cell: ({ row }) => (
      <div className="min-w-max">{row.getValue("created_by")}</div>
    ),
  },
  {
    accessorKey: "last_updated_by",
    enableResizing: true,
    header: "Last Updated By",
    cell: ({ row }) => (
      <div className="min-w-max">{row.getValue("last_updated_by")}</div>
    ),
  },
  {
    accessorKey: "creation_date",
    enableResizing: true,
    header: "Creation Date",
    cell: ({ row }) => {
      const data: Date = row.getValue("creation_date");
      const date = new Date(data);
      const formattedDate = date.toLocaleString("en-US");
      return <div className="min-w-max">{formattedDate} </div>;
    },
  },
  {
    accessorKey: "last_update_date",
    enableResizing: true,
    header: "Last Updated Date",
    cell: ({ row }) => {
      const data: Date = row.getValue("last_update_date");
      const date = new Date(data);
      const formattedDate = date.toLocaleString("en-US");
      return <div className=" min-w-max">{formattedDate} </div>;
    },
  },
];
export default columns;
