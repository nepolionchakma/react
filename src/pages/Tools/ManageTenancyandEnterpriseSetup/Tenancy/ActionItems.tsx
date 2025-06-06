import {
  AlertDialogAction,
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { ITenantsTypes } from "@/types/interfaces/users.interface";
import { FileEdit, PlusIcon, Trash } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActionItemsProps {
  selectedTenancyRows: ITenantsTypes[];
  setAction: React.Dispatch<React.SetStateAction<string>>;
  setStateChanged: React.Dispatch<React.SetStateAction<number>>;
}

const ActionItems = ({
  selectedTenancyRows,
  setAction,
  setStateChanged,
}: ActionItemsProps) => {
  const api = useAxiosPrivate();
  const handleDelete = async () => {
    try {
      const res = await api.delete(
        `/def-tenants/${selectedTenancyRows[0].tenant_id}`
      );
      if (res) {
        toast({
          description: `${res.data.message}`,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setStateChanged(Math.random() + 23 * 3000);
    }
  };
  return (
    <div className="flex gap-3 items-center px-4 py-2 border rounded">
      <div className="flex gap-3">
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      disabled={
                        selectedTenancyRows.length > 1 ||
                        selectedTenancyRows.length === 0
                      }
                    >
                      <Trash
                        className={`${
                          selectedTenancyRows.length > 1 ||
                          selectedTenancyRows.length === 0
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
                        {selectedTenancyRows.map((item, index) => (
                          <span
                            key={item.tenant_id}
                            className="block text-black"
                          >
                            {index + 1}. Tenant Name : {item.tenant_name}
                          </span>
                        ))}
                        <span className="mt-2 text-sm text-muted-foreground block">
                          This action cannot be undone. This will permanently
                          delete your data from our servers.
                        </span>
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
