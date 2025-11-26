import { toast } from "@/components/ui/use-toast";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { IEnterprisesTypes } from "@/types/interfaces/users.interface";
import { FileEdit } from "lucide-react";

import Alert from "@/components/Alert/Alert";
import CustomTooltip from "@/components/Tooltip/Tooltip";
import ActionButtons from "@/components/ActionButtons/ActionButtons";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { flaskApi } from "@/Api/Api";

interface ActionItemsProps {
  selectedEnterpriseRows: IEnterprisesTypes[];
  setAction: React.Dispatch<React.SetStateAction<string>>;
  setStateChanged: React.Dispatch<React.SetStateAction<number>>;
  setSelectedEnterpriseRows: React.Dispatch<
    React.SetStateAction<IEnterprisesTypes[]>
  >;
}

const ActionItems = ({
  selectedEnterpriseRows,
  setAction,
  setStateChanged,
  setSelectedEnterpriseRows,
}: ActionItemsProps) => {
  const { enterpriseSetting } = useGlobalContext();
  const api = useAxiosPrivate();
  const flaskUrl = import.meta.env.VITE_FLASK_ENDPOINT_URL;
  const handleDelete = async () => {
    for (const enterprise of selectedEnterpriseRows) {
      try {
        const res = await api.delete(
          `${flaskApi.EnterpriseSetup}?tenant_id=${enterprise.tenant_id}`,
          {
            baseURL: flaskUrl,
          }
        );
        if (res) {
          toast({
            description: `${res.data.message}`,
          });
          setSelectedEnterpriseRows([]);
        }
      } catch (error) {
        if (error instanceof Error) {
          toast({ title: error.message, variant: "destructive" });
        }
      } finally {
        setStateChanged(Math.random() + 23 * 3000);
      }
    }
  };

  const handleAction = () => {
    if (!enterpriseSetting?.enterprise_name) {
      setAction("add");
    } else {
      setAction("edit");
    }
  };
  return (
    <ActionButtons>
      <CustomTooltip tooltipTitle="Edit">
        <button
          disabled={
            selectedEnterpriseRows.length > 1 ||
            selectedEnterpriseRows.length === 0
          }
        >
          <FileEdit
            size={23}
            className={`${
              selectedEnterpriseRows.length > 1 ||
              selectedEnterpriseRows.length === 0
                ? "text-slate-200 cursor-not-allowed"
                : "cursor-pointer"
            }`}
            onClick={handleAction}
          />
        </button>
      </CustomTooltip>

      <Alert
        actionName="delete"
        disabled={selectedEnterpriseRows.length === 0}
        onContinue={handleDelete}
        tooltipTitle="Delete"
      >
        <div className="flex flex-col items-start">
          {selectedEnterpriseRows.map((item, index) => (
            <span key={item.tenant_id}>
              {index + 1}. Enterprise Name :{" "}
              {item.enterprise_name ? item.enterprise_name : "null"}
            </span>
          ))}
        </div>
      </Alert>
    </ActionButtons>
  );
};

export default ActionItems;
