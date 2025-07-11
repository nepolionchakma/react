import ScheduleATaskComponent from "@/components/AsynchronousRequestsAndTaskSchedules/TaskRequest/ScheduleATask";

const ScheduleATask = () => {
  return (
    <div>
      <ScheduleATaskComponent
        action="Schedule A Task"
        user_schedule_name="run_script"
        handleCloseModal={() => {}}
        setSelected={() => {}}
      />
    </div>
  );
};
export default ScheduleATask;
