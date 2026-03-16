// import { ITenantsTypes } from "@/types/interfaces/users.interface";
import { FileEdit } from "lucide-react";
import CustomTooltip from "@/components/Tooltip/Tooltip";
import ActionButtons from "@/components/ActionButtons/ActionButtons";

interface ActionItemsProps {
  // selectedTenancyRows: ITenantsTypes[];
  setAction: React.Dispatch<React.SetStateAction<string>>;
  // setStateChanged: React.Dispatch<React.SetStateAction<number>>;
  // setSelectedTenancyRows: React.Dispatch<React.SetStateAction<ITenantsTypes[]>>;
}

const ActionItems = ({ setAction }: ActionItemsProps) => {
  // const api = useAxiosPrivate();
  // const flaskUrl = import.meta.env.VITE_FLASK_ENDPOINT_URL;
  // const handleDelete = async () => {
  //   try {
  //     for (const tenancy of selectedTenancyRows) {
  //       const res = await api.delete(
  //         `/tenants/cascade_delete?tenant_id=${tenancy.tenant_id}`,
  //         {
  //           baseURL: flaskUrl,
  //         },
  //       );
  //       if (res) {
  //         toast({
  //           description: `${res.data.message}`,
  //         });
  //         setSelectedTenancyRows([]);
  //       }
  //     }
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       toast({ title: error.message, variant: "destructive" });
  //     }
  //   } finally {
  //     setStateChanged(Math.random() + 23 * 3000);
  //   }
  // };
  return (
    <ActionButtons>
      <CustomTooltip tooltipTitle="Edit">
        <button
        // disabled={
        //   selectedTenancyRows.length > 1 || selectedTenancyRows.length === 0
        // }
        >
          <FileEdit
            className="cursor-pointer"
            onClick={() => setAction("edit")}
          />
        </button>
      </CustomTooltip>
    </ActionButtons>
  );
};

export default ActionItems;
