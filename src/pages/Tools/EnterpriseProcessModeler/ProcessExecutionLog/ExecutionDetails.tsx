import { FLASK_URL, flaskApi } from "@/Api/Api";
import Spinner from "@/components/Spinner/Spinner";
import { Card } from "@/components/ui/card";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import {
  IOrchestrationDataTypes,
  IProcessExecution,
  IWorkflowExecutionStep,
} from "@/types/interfaces/orchestration.interface";
import { convertDate } from "@/Utility/DateConverter";
import { loadData } from "@/Utility/funtion";
import { processName } from "@/Utility/general";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ExecutionDetailsTable from "./ExecutionDetailsTable";
import StepDetail from "./StepDetail";

export type Detail = "Details" | "Input" | "Result" | undefined;

const ExecutionDetails = () => {
  const { token } = useGlobalContext();
  const { def_process_execution_id } = useParams();
  const [processExecution, setProcessExecution] = useState<
    IProcessExecution | undefined
  >(undefined);
  const [workflows, setWorkflows] = useState<IOrchestrationDataTypes[]>([]);
  const [executionSteps, setExecutionSteps] = useState<
    IWorkflowExecutionStep[]
  >([]);
  const [executionStep, setExecutionStep] = useState<
    IWorkflowExecutionStep | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [detail, setDetail] = useState<Detail>(undefined);

  //Fetch Process Execution
  useEffect(() => {
    const loadExecution = async () => {
      const params = {
        baseURL: FLASK_URL,
        url: `${flaskApi.WorkflowExecutionLog}?def_process_execution_id=${def_process_execution_id}`,
        accessToken: `${token.access_token}`,
        setLoading: setIsLoading,
      };

      const res = await loadData(params);
      if (res) {
        setProcessExecution(res.result[0]);
      }
    };

    loadExecution();
  }, [def_process_execution_id, token.access_token]);

  //Fetch Workflows
  useEffect(() => {
    const params = {
      baseURL: FLASK_URL,
      url: `${flaskApi.WorkFlow}`,
      accessToken: `${token.access_token}`,
      setLoading: setIsLoading,
    };

    const fetchData = async () => {
      const res = await loadData(params);
      if (res) {
        setWorkflows(res.result);
      }
    };

    fetchData();
  }, [token.access_token]);

  //Fetch Execution Steps
  useEffect(() => {
    const params = {
      baseURL: FLASK_URL,
      url: `workflow/execution_stream/${def_process_execution_id}?access_token=${token.access_token}`,
      accessToken: `${token.access_token}`,
      setLoading: setIsLoading,
    };

    const fetchData = async () => {
      const res = await loadData(params);
      if (res) {
        const raw = `${res}`;

        const events: IWorkflowExecutionStep[] = raw
          .split("\n\n")
          .filter(Boolean)
          .map((block) => {
            const lines = block.split("\n");

            const dataLine = lines.find((l) => l.startsWith("data:"));

            return dataLine
              ? (JSON.parse(
                  dataLine.replace("data:", "").trim(),
                ) as IWorkflowExecutionStep)
              : null;
          })
          .filter((item): item is IWorkflowExecutionStep => item !== null);

        setExecutionSteps(events);
      }
    };

    fetchData();
  }, [def_process_execution_id, token.access_token]);

  return (
    <>
      {isLoading ? (
        <div className="w-[100vw] h-[100vh]">
          <Spinner size="40" color="red" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Card className="flex flex-wrap justify-around gap-6 p-4">
            <div>
              <p className="text-gray-600">Execution Id</p>
              <p>{processExecution?.def_process_execution_id}</p>
            </div>

            <div className="bg-gray-100 w-[2px] my-1"></div>

            <div>
              <p className="text-gray-600">Workflow</p>
              <p>{processName(processExecution?.process_id, workflows)}</p>
            </div>

            <div className="bg-gray-100 w-[2px] my-1"></div>

            <div>
              <p className="text-gray-600">Status</p>
              <p
                className={`${processExecution?.execution_status === "COMPLETED" ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"} px-1 rounded-sm`}
              >
                {processExecution?.execution_status}
              </p>
            </div>

            <div className="bg-gray-100 w-[2px] my-1"></div>

            <div>
              <p className="text-gray-600">Started At</p>
              <p>{convertDate(processExecution?.execution_start_date)}</p>
            </div>

            <div className="bg-gray-100 w-[2px] my-1"></div>

            <div>
              <p className="text-gray-600">Ended At</p>
              <p>{convertDate(processExecution?.execution_end_date)}</p>
            </div>
          </Card>

          <div className="grid grid-cols-5 gap-4">
            <Card className="col-span-3">
              <ExecutionDetailsTable
                executionSteps={executionSteps}
                executionStep={executionStep}
                setExecutionStep={setExecutionStep}
                setDetail={setDetail}
              />
            </Card>

            <Card className="col-span-2">
              <StepDetail
                setExecutionStep={setExecutionStep}
                executionStep={executionStep}
                detail={detail}
                setDetail={setDetail}
              />
            </Card>
          </div>
        </div>
      )}
    </>
  );
};

export default ExecutionDetails;
