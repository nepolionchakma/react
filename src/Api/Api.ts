import axios from "axios";
export const url = import.meta.env.VITE_NODE_ENDPOINT_URL; //VITE_API_ENDPOINT using NGNIX;
export const FLASK_URL = import.meta.env.VITE_FLASK_ENDPOINT_URL;

axios.defaults.withCredentials = true;
// export default axios.create({
//   baseURL: url,
// });

export const api = axios.create({
  baseURL: url,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const flaskApi = {
  DefGlobalConditions: "/def_global_conditions",
  DefGlobalConditionLogics: "/def_global_condition_logics",
  DefGlobalConditionLogicAttributes: "/def_global_condition_logic_attributes",
  DefGlobalConditionLogicExtend: "/def_global_condition_logic_extend",
  DefDataSources: "/def_data_sources",
  DefAccessModels: "/def_access_models",
  DefAccessModelLogics: "/def_access_model_logics",
  DefAccessModelLogicAttributes: "/def_access_model_logic_attributes",
  DefAccessModelLogicExtend: "/def_access_model_logic_extend",
  DefControls: "/def_controls",
  DefAccessPointElements: "/def_access_point_elements",
  DefAccessEntitlementElements: "/def_access_entitlement_elements",
  DefActionItems: "/def_action_items_view",
  DefActionItemAssignment: "/def_action_item_assignments",
  DefControlEnvironments: "/def_control_environments",
  DefTenants: "/tenants",
  Users: "/users",
  AccessProfiles: "/access_profiles",
  JobTitles: "/job_titles",
  ViewRequests: "/view_requests",
  DefAsyncTaskSchedules: "/def_async_task_schedules",
  DeleteTaskParameters: "/Delete_TaskParams",
  ShowTaskParameters: "/Show_TaskParams",
  CreateTaskSchedule: "/Create_TaskSchedule",
  UpdateTaskSchedule: "/Update_TaskSchedule",
  CancelAsyncTasks: "/Cancel_TaskSchedule",
  CancelTask: "/Cancel_Task",
  ShowAsyncTasks: "/def_async_tasks",
  ShowExecutionMethods: "/Show_ExecutionMethods",
  DefAsyncSearchExecutionMethods: "/def_async_execution_methods/search",
  DeleteExecutionMethod: "/Delete_ExecutionMethod",
  DefAsyncSearchTaskSchedules: "/def_async_task_schedules/search",
  RescheduleTask: "/Reschedule_Task",
};

// All Node api
export const nodeApi = {
  ViewEditScheduleTaskApi:
    "/asynchronous-requests-and-task-schedules/task-schedules",
  Alerts: "/alerts",
};
