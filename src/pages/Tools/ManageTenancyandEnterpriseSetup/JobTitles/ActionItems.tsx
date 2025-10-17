import { toast } from "@/components/ui/use-toast";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { IJobTitle } from "@/types/interfaces/users.interface";
import { FileEdit, PlusIcon } from "lucide-react";

import Alert from "@/components/Alert/Alert";
import CustomTooltip from "@/components/Tooltip/Tooltip";
import ActionButtons from "@/components/ActionButtons/ActionButtons";
import { FLASK_URL } from "@/Api/Api";

interface ActionItemsProps {
  selectedJobTitlesRows: IJobTitle[];
  setAction: React.Dispatch<React.SetStateAction<string>>;
  setStateChanged: React.Dispatch<React.SetStateAction<number>>;
  setSelectedJobTitlesRows: React.Dispatch<React.SetStateAction<IJobTitle[]>>;
}

const ActionItems = ({
  selectedJobTitlesRows,
  setAction,
  setStateChanged,
  setSelectedJobTitlesRows,
}: ActionItemsProps) => {
  const api = useAxiosPrivate();

  const handleDelete = async () => {
    try {
      for (const jobTitle of selectedJobTitlesRows) {
        const res = await api.delete(
          `/job_titles?job_title_id=${jobTitle.job_title_id}`,
          {
            baseURL: FLASK_URL,
          }
        );
        if (res) {
          toast({
            description: `${res.data.message}`,
          });
          setSelectedJobTitlesRows([]);
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
            selectedJobTitlesRows.length > 1 ||
            selectedJobTitlesRows.length === 0
          }
        >
          <FileEdit
            className={`${
              selectedJobTitlesRows.length > 1 ||
              selectedJobTitlesRows.length === 0
                ? "text-slate-200 cursor-not-allowed"
                : "cursor-pointer"
            }`}
            onClick={() => setAction("edit")}
          />
        </button>
      </CustomTooltip>

      <Alert
        disabled={selectedJobTitlesRows.length === 0}
        actionName="delete"
        onContinue={handleDelete}
        tooltipTitle="Delete"
      >
        <>
          <span className="flex flex-col items-start">
            {selectedJobTitlesRows.map((item, index) => (
              <span key={item.job_title_id}>
                {index + 1}. Job Title Name : {item.job_title_name}
              </span>
            ))}
          </span>
        </>
      </Alert>
    </ActionButtons>
  );
};

export default ActionItems;
