import { FLASK_URL, flaskApi } from "@/Api/Api";
import { toast } from "@/components/ui/use-toast";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { IOrchestrationDataTypes2 } from "@/types/interfaces/orchestration.interface";
import { postData, putData } from "@/Utility/funtion";
interface ICreateAFlowProps {
  actionType: string;
  flowsData: IOrchestrationDataTypes2[];
  selectedFlowData?: IOrchestrationDataTypes2 | undefined;
  newProcessName: string;
  setNewProcessName: React.Dispatch<React.SetStateAction<string>>;
  setCreateNewFlow: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedFlowData: React.Dispatch<
    React.SetStateAction<IOrchestrationDataTypes2 | undefined>
  >;
  setSelectedFlowName: React.Dispatch<React.SetStateAction<string>>;
  setIsEditFlowName: React.Dispatch<React.SetStateAction<boolean>>;
  closeAllProgress: () => void;
}
const CreateAFlow = ({
  actionType,
  flowsData,
  selectedFlowData,
  newProcessName,
  setNewProcessName,
  setCreateNewFlow,
  setSelectedFlowData,
  setSelectedFlowName,
  setIsEditFlowName,
  closeAllProgress,
}: ICreateAFlowProps) => {
  const { token } = useGlobalContext();
  console.log(selectedFlowData, "selectedFlowData");
  const handleCreateNewFlow = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (flowsData) {
        const flow = flowsData.find(
          (flow) => flow.process_name === newProcessName,
        );
        if (flow) {
          toast({
            title: "Info!!",
            description: "Flow already exists.",
          });
        } else {
          if (actionType === "CreateAFlow") {
            const res = await postData({
              baseURL: FLASK_URL,
              url: `${flaskApi.WorkFlow}`,
              accessToken: token.access_token,
              payload: {
                process_name: newProcessName,
                process_structure: { nodes: [], edges: [] },
              },
              setLoading: () => {},
            });

            if (res.data.result.created_by) {
              setSelectedFlowName(newProcessName);
              closeAllProgress();
              setCreateNewFlow(false);
              setSelectedFlowData({
                process_id: res.data.result.process_id,
                process_name: res.data.result.process_name,
                process_structure: { nodes: [], edges: [] },
              });

              toast({
                // title: "Success",
                description: `${res.data.message}`,
              });
            }
          } else if (actionType === "EditFlowName") {
            console.log(
              {
                process_name: newProcessName || "",
                process_structure: selectedFlowData?.process_structure,
              },
              "selectedFlowData?.process_structure",
            );
            const res = await putData({
              baseURL: FLASK_URL,
              payload: {
                process_name: newProcessName || "",
                process_structure: selectedFlowData?.process_structure,
              },
              setLoading: () => {},
              url: `${flaskApi.WorkFlow}?process_id=${selectedFlowData?.process_id}`,
              accessToken: token.access_token,
            });
            console.log(res, "res");
            if (res) {
              setIsEditFlowName(false);
              setSelectedFlowName(newProcessName);
              toast({
                // title: "Success",
                description: `${res.data.message}`,
              });
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="absolute left-[50%] z-50 translate-x-[-50%] bg-slate-300 p-3 border rounded">
      <form onSubmit={handleCreateNewFlow}>
        <input
          type="text"
          value={newProcessName ?? ""}
          placeholder="Flow Name"
          onChange={(e) => {
            setNewProcessName(e.target.value);
          }}
          autoFocus
          className="px-2 py-1 rounded mr-2"
        />
        <button
          type="submit"
          className="bg-slate-200 p-1 rounded-l-md border-black border hover:bg-slate-300 hover:shadow"
        >
          Save
        </button>
        <button
          className="bg-slate-200 p-1 rounded-r-md border-black border hover:bg-slate-300 hover:shadow"
          onClick={(e) => {
            e.preventDefault();
            setCreateNewFlow(false);
            setIsEditFlowName(false);
            setNewProcessName("");
          }}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default CreateAFlow;
