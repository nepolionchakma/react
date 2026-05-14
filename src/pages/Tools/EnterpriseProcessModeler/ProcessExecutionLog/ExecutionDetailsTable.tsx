import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IWorkflowExecutionStep } from "@/types/interfaces/orchestration.interface";
import { convertDate } from "@/Utility/DateConverter";
import { Detail } from "./ExecutionDetails";

interface Props {
  executionSteps: IWorkflowExecutionStep[];
  setExecutionStep: React.Dispatch<
    React.SetStateAction<IWorkflowExecutionStep | undefined>
  >;
  executionStep: IWorkflowExecutionStep | undefined;
  setDetail: React.Dispatch<React.SetStateAction<Detail>>;
}

const ExecutionDetailsTable = ({
  executionSteps,
  setExecutionStep,
  executionStep,
  setDetail,
}: Props) => {
  const steps = executionSteps.slice(0, -1);

  const handleRowClick = (step: IWorkflowExecutionStep) => {
    setExecutionStep(step);
    setDetail("Details");
  };
  return (
    <div>
      <div className="p-3">
        <p>Steps ({steps.length})</p>
      </div>
      <div className="bg-gray-100 h-[1px]"></div>
      <Table>
        <TableHeader>
          <TableRow className="bg-winter-100  hover:bg-winter-100">
            <TableHead>Step Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Start Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {steps.map((step) => (
            <TableRow
              className={
                executionStep &&
                executionStep.def_execution_step_id ===
                  step.def_execution_step_id
                  ? "bg-slate-100 font-bold"
                  : ""
              }
              key={step.def_execution_step_id}
              onClick={() => handleRowClick(step)}
            >
              <TableCell>{step.node_label}</TableCell>
              <TableCell className="capitalize">{step.status}</TableCell>
              <TableCell className="text-right">
                {convertDate(step.execution_start_date)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExecutionDetailsTable;
