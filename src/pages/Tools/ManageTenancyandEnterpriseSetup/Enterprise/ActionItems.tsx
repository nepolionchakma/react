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
import { IEnterprisesTypes } from "@/types/interfaces/users.interface";
import { FileEdit, Trash } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActionItemsProps {
  selectedEnterpriseRows: IEnterprisesTypes[];
  setAction: React.Dispatch<React.SetStateAction<string>>;
  setStateChanged: React.Dispatch<React.SetStateAction<number>>;
}

const ActionItems = ({
  selectedEnterpriseRows,
  setAction,
  setStateChanged,
}: ActionItemsProps) => {
  const api = useAxiosPrivate();
  const handleDelete = async () => {
    try {
      const res = await api.delete(
        `/def-tenant-enterprise-setup/${selectedEnterpriseRows[0].tenant_id}`
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
      <div className="flex gap-3 items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                disabled={
                  selectedEnterpriseRows.length > 1 ||
                  selectedEnterpriseRows.length === 0
                }
              >
                <FileEdit
                  className={`${
                    selectedEnterpriseRows.length > 1 ||
                    selectedEnterpriseRows.length === 0
                      ? "text-slate-200 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  onClick={() => setAction("edit")}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit Enterprise Setup</p>
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
                        selectedEnterpriseRows.length > 1 ||
                        selectedEnterpriseRows.length === 0
                      }
                    >
                      <Trash
                        className={`${
                          selectedEnterpriseRows.length > 1 ||
                          selectedEnterpriseRows.length === 0
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
                        {selectedEnterpriseRows.map((item, index) => (
                          <span
                            key={item.tenant_id}
                            className="block text-black"
                          >
                            {index + 1}. Enterprise Name :{" "}
                            {item.enterprise_name}
                          </span>
                        ))}
                        <span className="mt-2 text-sm text-muted-foreground block">
                          This action cannot be undone. This will permanently
                          delete your data from the server.
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
              <p>Delete Enterprise Setup</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ActionItems;
