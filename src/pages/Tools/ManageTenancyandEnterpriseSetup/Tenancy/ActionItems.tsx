import { toast } from "@/components/ui/use-toast";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { ITenantsTypes } from "@/types/interfaces/users.interface";
import { FileEdit, PlusIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Alert from "@/components/Alert/Alert";

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
        const res = await api.delete(`/tenants/${tenancy.tenant_id}`, {
          baseURL: flaskUrl,
        });
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
    <div className="flex gap-3 items-center px-4 py-2 border rounded">
      <div className="flex gap-3 items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className=" disabled:text-slate-200 disabled:cursor-not-allowed">
                <PlusIcon onClick={() => setAction("create")} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create Tenancy</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <button
                  disabled={
                    selectedTenancyRows.length > 1 ||
                    selectedTenancyRows.length === 0
                  }
                >
                  <FileEdit
                    className={`${
                      selectedTenancyRows.length > 1 ||
                      selectedTenancyRows.length === 0
                        ? "text-slate-200 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                    onClick={() => setAction("edit")}
                  />
                </button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit Tenancy</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Alert
                  disabled={selectedTenancyRows.length === 0}
                  children={
                    <>
                      <div className="flex flex-col items-start">
                        {selectedTenancyRows.map((item, index) => (
                          <span key={item.tenant_id} className="text-black ">
                            {index + 1}. Tenant Name : {item.tenant_name}
                          </span>
                        ))}
                      </div>
                    </>
                  }
                  actionName="delete"
                  onContinue={handleDelete}
                ></Alert>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Tenancy</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ActionItems;
