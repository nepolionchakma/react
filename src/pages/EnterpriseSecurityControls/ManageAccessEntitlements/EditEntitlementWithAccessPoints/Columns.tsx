import { useManageAccessEntitlementsContext } from "@/Context/ManageAccessEntitlements/ManageAccessEntitlementsContext";
import { ICreateAccessPointsElementTypes } from "@/types/interfaces/ManageAccessEntitlements.interface";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

const columns: ColumnDef<ICreateAccessPointsElementTypes>[] = [
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
    accessorKey: "entitlement_name",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as string;
      const b = rowB.getValue(columnId) as string;

      return a.localeCompare(b, undefined, { sensitivity: "base" });
    },
    header: ({ column }) => {
      return (
        <div
          className="min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Entitlement Name
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },
    cell: () => {
      const { selectedManageAccessEntitlements } =
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useManageAccessEntitlementsContext();
      return (
        <div className="capitalize min-w-[25rem]">
          {selectedManageAccessEntitlements?.entitlement_name}
        </div>
      );
    },
  },
  {
    accessorKey: "element_name",
    enableResizing: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as string;
      const b = rowB.getValue(columnId) as string;

      return a.localeCompare(b, undefined, { sensitivity: "base" });
    },
    header: ({ column }) => {
      return (
        <div
          className="min-w-max"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Element Name
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer inline-block" />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize min-w-[40rem]">
        {row.getValue("element_name")}
      </div>
    ),
  },
  // {
  //   accessorKey: "Action",
  //   header: "Action",
  //   cell: ({ row }) => {
  //     const { selected, deleteAccessEntitlementElement } =
  //       useManageAccessEntitlementsContext();
  //     const id = row?.original?.access_point_id;
  //     const handleRemoveAccessEntitlementElement = (id: number) => {
  //       deleteAccessEntitlementElement(selected[0].entitlement_id, id);
  //     };
  //     return (
  //       // <Button
  //       //   className="h-8"
  //       //   onClick={() => handleRemoveAccessEntitlementElement(id as number)}
  //       // >
  //       //   Remove
  //       // </Button>
  //       <AlertDialog>
  //         <AlertDialogTrigger asChild>
  //           <Button className="h-8">Remove</Button>
  //         </AlertDialogTrigger>
  //         <AlertDialogContent>
  //           <AlertDialogHeader>
  //             <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
  //             <AlertDialogDescription>
  //               This action cannot be undone. This will permanently delete your
  //               account and remove your data from our servers.
  //             </AlertDialogDescription>
  //           </AlertDialogHeader>
  //           <AlertDialogFooter>
  //             <AlertDialogCancel>Cancel</AlertDialogCancel>
  //             <AlertDialogAction
  //               onClick={() =>
  //                 handleRemoveAccessEntitlementElement(id as number)
  //               }
  //             >
  //               Continue
  //             </AlertDialogAction>
  //           </AlertDialogFooter>
  //         </AlertDialogContent>
  //       </AlertDialog>
  //     );
  //   },
  // },
];
export default columns;
