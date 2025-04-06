import { TaskParametersTable } from "@/components/ARM/TaskParameters/TaskParametersTable";
import { TaskNameTable } from "@/components/ARM/TaskParameters/TaskNameTable";

const TaskParameters = () => {
  return (
    <div>
      <TaskNameTable />
      <TaskParametersTable />
    </div>
  );
};
export default TaskParameters;
