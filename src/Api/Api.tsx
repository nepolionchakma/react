import axios from "axios";
const url = import.meta.env.VITE_NODE_ENDPOINT_URL; //VITE_API_ENDPOINT using NGNIX;

axios.defaults.withCredentials = true;
// export default axios.create({
//   baseURL: url,
// });

export const api = axios.create({
  baseURL: url,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const nodeApi = {
  ViewEditScheduleTaskApi:
    "/asynchronous-requests-and-task-schedules/task-schedules",
};
