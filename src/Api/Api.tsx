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
  DefAccessModels: "/def_access_models",
  DefAccessModelLogics: "/def_access_model_logics",
  DefAccessModelLogicAttributes: "/def_access_model_logic_attributes",
  DefActionItems: "/def_action_items_v",
};

// All Node api
export const nodeApi = {
  ViewEditScheduleTaskApi:
    "/asynchronous-requests-and-task-schedules/task-schedules",
  alerts: "/alerts",
};
