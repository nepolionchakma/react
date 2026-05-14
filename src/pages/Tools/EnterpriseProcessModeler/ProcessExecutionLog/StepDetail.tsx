import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { IWorkflowExecutionStep } from "@/types/interfaces/orchestration.interface";
import { convertDate } from "@/Utility/DateConverter";
import { renderUserName } from "@/Utility/NotificationUtils";
import { X } from "lucide-react";
import { Detail } from "./ExecutionDetails";

interface Props {
  executionStep: IWorkflowExecutionStep | undefined;
  setExecutionStep: React.Dispatch<
    React.SetStateAction<IWorkflowExecutionStep | undefined>
  >;
  detail: Detail;
  setDetail: React.Dispatch<React.SetStateAction<Detail>>;
}

const StepDetail = ({
  executionStep,
  setExecutionStep,
  detail,
  setDetail,
}: Props) => {
  const { users } = useGlobalContext();
  const result = executionStep?.result;
  const input = executionStep?.input_data;

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center p-3">
        <p className="font-bold">{executionStep?.node_label}</p>
        <button onClick={() => setExecutionStep(undefined)}>
          <X />
        </button>
      </div>
      <div className="bg-gray-100 h-[1px]"></div>

      <div className="p-3 flex justify-between items-center">
        <button
          className={detail === "Details" ? "text-blue-500 font-bold" : ""}
          onClick={() => setDetail("Details")}
        >
          Details
        </button>
        <button
          className={detail === "Input" ? "text-blue-500 font-bold" : ""}
          onClick={() => setDetail("Input")}
        >
          Input
        </button>
        <button
          className={detail === "Result" ? "text-blue-500 font-bold" : ""}
          onClick={() => setDetail("Result")}
        >
          Result
        </button>
      </div>
      <div className="bg-gray-100 h-[1px]"></div>

      {detail === "Details" && (
        <div className="p-3 space-y-1 text-sm">
          <p className="grid grid-cols-5 gap-6">
            <span className="text-gray-600 col-span-2">Step Id</span>
            <span className="col-span-3">
              {executionStep?.def_execution_step_id}
            </span>
          </p>

          <p className="grid grid-cols-5 gap-6">
            <span className="text-gray-600 col-span-2">
              Process Execution Id
            </span>
            <span className="col-span-3">
              {executionStep?.def_process_execution_id}
            </span>
          </p>

          <p className="grid grid-cols-5 gap-6">
            <span className="text-gray-600 col-span-2">Node Id</span>
          </p>

          <p className="grid grid-cols-5 gap-6">
            <span className="text-gray-600 col-span-2">Node Label</span>
            <span className="col-span-3">{executionStep?.node_label}</span>
          </p>

          <p className="grid grid-cols-5 gap-6">
            <span className="text-gray-600 col-span-2">Task Name</span>
            <span className="col-span-3">{executionStep?.task_name}</span>
          </p>

          <p className="grid grid-cols-5 gap-6">
            <span className="text-gray-600 col-span-2">Status</span>
            <span className="col-span-3">{executionStep?.status}</span>
          </p>

          <p className="grid grid-cols-5 gap-6">
            <span className="text-gray-600 col-span-2">Error Message</span>
            <span className="col-span-3">
              {executionStep?.error_message || "N/A"}
            </span>
          </p>

          <p className="grid grid-cols-5 gap-6">
            <span className="text-gray-600 col-span-2">
              Execution Start Date
            </span>
            <span className="col-span-3">
              {convertDate(executionStep?.execution_start_date)}
            </span>
          </p>

          <p className="grid grid-cols-5 gap-6">
            <span className="text-gray-600 col-span-2">Execution End Date</span>
            <span className="col-span-3">
              {convertDate(executionStep?.execution_end_date)}
            </span>
          </p>

          <p className="grid grid-cols-5 gap-6">
            <span className="text-gray-600 col-span-2">Created By</span>
            <span className="col-span-3">
              {renderUserName(executionStep?.created_by, users)}
            </span>
          </p>

          <p className="grid grid-cols-5 gap-6">
            <span className="text-gray-600 col-span-2">Creation Date</span>
            <span className="col-span-3">
              {convertDate(executionStep?.creation_date)}
            </span>
          </p>

          <p className="grid grid-cols-5 gap-6">
            <span className="text-gray-600 col-span-2">Last Updated By</span>
            <span className="col-span-3">
              {renderUserName(executionStep?.last_updated_by, users)}
            </span>
          </p>

          <p className="grid grid-cols-5 gap-6">
            <span className="text-gray-600 col-span-2">Last Update Date</span>
            <span className="col-span-3">
              {renderUserName(executionStep?.last_updated_by, users)}
            </span>
          </p>
        </div>
      )}

      {detail === "Input" && (
        <div className="p-3">
          {Object.entries(input || {}).map(([key, value]) => (
            <p key={key} className="grid grid-cols-5 gap-6">
              <span className="text-gray-600 col-span-2">
                {key
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (char) => char.toUpperCase())}
              </span>

              <span className="col-span-3">{String(value)}</span>
            </p>
          ))}
        </div>
      )}

      {detail === "Result" && (
        <div className="p-3">
          {Object.entries(result || {}).map(([key, value]) => (
            <p key={key} className="grid grid-cols-5 gap-6">
              <span className="text-gray-600 col-span-2">
                {key
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (char) => char.toUpperCase())}
              </span>

              <span className="col-span-3">{String(value)}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default StepDetail;
