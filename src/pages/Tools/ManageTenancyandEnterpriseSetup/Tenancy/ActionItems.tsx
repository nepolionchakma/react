import { toast } from "@/components/ui/use-toast";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { ITenantsTypes } from "@/types/interfaces/users.interface";
import { FileEdit, PlusIcon } from "lucide-react";

import Alert from "@/components/Alert/Alert";
import CustomTooltip from "@/components/Tooltip/Tooltip";
import ActionButtons from "@/components/ActionButtons/ActionButtons";

interface ActionItemsProps {
  selectedTenancyRows: ITenantsTypes[];
  setAction: React.Dispatch<React.SetStateAction<string>>;
  setStateChanged: React.Dispatch<React.SetStateAction<number>>;
  setSelectedTenancyRows: React.Dispatch<React.SetStateAction<ITenantsTypes[]>>;
}

const ActionItems = ({
  selectedTenancyRows,
  setAction,
  setStateChanged,
  setSelectedTenancyRows,
}: ActionItemsProps) => {
  const api = useAxiosPrivate();
  const flaskUrl = import.meta.env.VITE_FLASK_ENDPOINT_URL;
  const handleDelete = async () => {
    try {
      for (const tenancy of selectedTenancyRows) {
        const res = await api.delete(
          `/tenants/cascade_delete?tenant_id=${tenancy.tenant_id}`,
          {
            baseURL: flaskUrl,
          }
        );
        if (res) {
          toast({
            description: `${res.data.message}`,
          });
          setSelectedTenancyRows([]);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      }
    } finally {
      setStateChanged(Math.random() + 23 * 3000);
    }
  };
  return (
    <ActionButtons>
      <CustomTooltip tooltipTitle="Add">
        <button>
          <PlusIcon onClick={() => setAction("add")} />
        </button>
      </CustomTooltip>

      <CustomTooltip tooltipTitle="Edit">
        <button
          disabled={
            selectedTenancyRows.length > 1 || selectedTenancyRows.length === 0
          }
        >
          <FileEdit
            className={`${
              selectedTenancyRows.length > 1 || selectedTenancyRows.length === 0
                ? "text-slate-200 cursor-not-allowed"
                : "cursor-pointer"
            }`}
            onClick={() => setAction("edit")}
          />
        </button>
      </CustomTooltip>

      <Alert
        disabled={selectedTenancyRows.length === 0}
        actionName="delete"
        onContinue={handleDelete}
        tooltipTitle="Delete"
      >
        <>
          <span className="flex flex-col items-start">
            {selectedTenancyRows.map((item, index) => (
              <span key={item.tenant_id}>
                {index + 1}. Tenant Name : {item.tenant_name}
              </span>
            ))}
          </span>
        </>
      </Alert>
    </ActionButtons>
  );
};

export default ActionItems;
