import {
  IARMAsynchronousTasksParametersTypes,
  IARMAsynchronousTasksTypes,
  IARMTaskParametersTypes,
  IARMViewRequestsTypes,
  IAsynchronousRequestsAndTaskSchedulesTypes,
  IExecutionMethodsTypes,
} from "@/types/interfaces/ARM.interface";
import React, { ReactNode, createContext, useContext, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { useGlobalContext } from "../GlobalContext/GlobalContext";
import { deleteData, loadData, putData } from "@/Utility/funtion";
import { FLASK_URL, flaskApi } from "@/Api/Api";
interface ARMContextProviderProps {
  children: ReactNode;
}

interface ARMContext {
  totalPage: number;
  setTotalPage: React.Dispatch<React.SetStateAction<number>>;
  getAsyncTasks: () => Promise<IARMAsynchronousTasksTypes[] | undefined>;
  getAsyncTasksLazyLoading: (
    page: number,
    limit: number
  ) => Promise<IARMAsynchronousTasksTypes[] | undefined>;
  getSearchAsyncTasksLazyLoading: (
    page: number,
    limit: number,
    userTaskName: string
  ) => Promise<IARMAsynchronousTasksTypes[] | undefined>;
  cancelAsyncTasks: (task_name: string) => Promise<void>;
  getManageExecutionMethods: () => Promise<
    IExecutionMethodsTypes[] | undefined
  >;
  getManageExecutionMethodsLazyLoading: (
    page: number,
    limit: number
  ) => Promise<IExecutionMethodsTypes[] | undefined>;
  getSearchManageExecutionMethodsLazyLoading: (
    page: number,
    limit: number,
    userExecutionMethodName: string
  ) => Promise<IExecutionMethodsTypes[] | undefined>;

  deleteExecutionMethod: (internal_execution_method: string) => Promise<void>;

  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  selectedTask: IARMAsynchronousTasksTypes | undefined;
  setSelectedTask: React.Dispatch<
    React.SetStateAction<IARMAsynchronousTasksTypes | undefined>
  >;
  selectedTaskParameters: IARMTaskParametersTypes[];
  setSelectedTaskParameters: React.Dispatch<
    React.SetStateAction<IARMTaskParametersTypes[]>
  >;
  getTaskParametersLazyLoading: (
    task_name: string
  ) => Promise<IARMTaskParametersTypes[] | undefined>;
  getTaskParametersByTaskName: (
    task_name: string
  ) => Promise<IARMAsynchronousTasksParametersTypes[] | undefined>;
  deleteTaskParameters: (
    task_name: string,
    def_param_id: number
  ) => Promise<void>;
  changeState: number;
  setChangeState: React.Dispatch<React.SetStateAction<number>>;
  getAsynchronousRequestsAndTaskSchedules: (
    page: number,
    limit: number
  ) => Promise<IAsynchronousRequestsAndTaskSchedulesTypes[] | undefined>;
  getSearchAsynchronousRequestsAndTaskSchedules: (
    page: number,
    limit: number,
    task_name: string
  ) => Promise<IAsynchronousRequestsAndTaskSchedulesTypes[]>;
  cancelScheduledTask: (
    selectedItem: IAsynchronousRequestsAndTaskSchedulesTypes
    // selectedItems: IAsynchronousRequestsAndTaskSchedulesTypes[]
  ) => Promise<void>;
  rescheduleTask: (
    selectedItem: IAsynchronousRequestsAndTaskSchedulesTypes
  ) => Promise<void>;
  getViewRequests: (
    page: number,
    limit: number,
    days: number,
    task_name: string
  ) => Promise<IARMViewRequestsTypes[] | undefined>;
  // getSearchViewRequests: (
  //   page: number,
  //   limit: number,
  //   query: string
  // ) => Promise<IARMViewRequestsTypes[] | undefined>;
}

const ARMContext = createContext({} as ARMContext);

export function useARMContext() {
  return useContext(ARMContext);
}

export function ARMContextProvider({ children }: ARMContextProviderProps) {
  const { token } = useGlobalContext();
  const [changeState, setChangeState] = useState<number>(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedTask, setSelectedTask] = useState<
    IARMAsynchronousTasksTypes | undefined
  >(undefined);
  const [selectedTaskParameters, setSelectedTaskParameters] = useState<
    IARMTaskParametersTypes[]
  >([]);
  // const [page, setPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);

  // Asunchronous Tasks
  const getAsyncTasks = async () => {
    const res = await loadData({
      baseURL: FLASK_URL,
      url: flaskApi.ShowAsyncTasks,
      setLoading: setIsLoading,
      accessToken: token.access_token,
    });
    if (res.length) {
      return res;
    } else {
      return [];
    }
  };
  const getAsyncTasksLazyLoading = async (page: number, limit: number) => {
    const resultLazyLoading = await loadData({
      baseURL: FLASK_URL,
      url: `${flaskApi.ShowAsyncTasks}/${page}/${limit}`,
      setLoading: setIsLoading,
      accessToken: token.access_token,
    });
    if (resultLazyLoading.items.length) {
      setTotalPage(resultLazyLoading.pages);
      return resultLazyLoading.items;
    } else {
      return [];
    }
  };
  const getSearchAsyncTasksLazyLoading = async (
    page: number,
    limit: number,
    userTaskName: string
  ) => {
    const resultLazyLoading = await loadData({
      baseURL: FLASK_URL,
      url: `${flaskApi.ShowAsyncTasks}/search/${page}/${limit}?user_task_name=${userTaskName}`,
      setLoading: setIsLoading,
      accessToken: token.access_token,
    });
    if (resultLazyLoading.items.length) {
      setTotalPage(resultLazyLoading.pages);
      return resultLazyLoading.items;
    } else {
      return [];
    }
  };
  const cancelAsyncTasks = async (task_name: string) => {
    const res = await putData({
      baseURL: FLASK_URL,
      url: `${flaskApi.CancelTask}/${task_name}`,
      setLoading: setIsLoading,
      accessToken: token.access_token,
      payload: {},
    });
    if (res.status === 200) {
      toast({
        description: `${res.data.message}`,
      });
    }
    setChangeState(Math.random() + 23 * 3000);
  };

  // Manage Execution Methods
  const getManageExecutionMethods = async () => {
    const res = await loadData({
      baseURL: FLASK_URL,
      url: flaskApi.ShowExecutionMethods,
      setLoading: setIsLoading,
      accessToken: token.access_token,
    });
    if (res.length) {
      return res;
    } else {
      return [];
    }
  };
  const getManageExecutionMethodsLazyLoading = async (
    page: number,
    limit: number
  ) => {
    const res = await loadData({
      baseURL: FLASK_URL,
      url: `${flaskApi.ShowExecutionMethods}/${page}/${limit}`,
      setLoading: setIsLoading,
      accessToken: token.access_token,
    });
    if (res.items.length) {
      setTotalPage(res.pages);
      return res.items;
    } else {
      return [];
    }
  };
  const getSearchManageExecutionMethodsLazyLoading = async (
    page: number,
    limit: number,
    internal_execution_method: string
  ) => {
    const res = await loadData({
      baseURL: FLASK_URL,
      url: `${flaskApi.DefAsyncSearchExecutionMethods}/${page}/${limit}?internal_execution_method=${internal_execution_method}`,
      setLoading: setIsLoading,
      accessToken: token.access_token,
    });
    if (res.items.length) {
      setTotalPage(res.pages);
      return res.items;
    } else {
      return [];
    }
  };
  const deleteExecutionMethod = async (internal_execution_method: string) => {
    const res = await deleteData({
      baseURL: FLASK_URL,
      url: `${flaskApi.DeleteExecutionMethod}/${internal_execution_method}`,
      accessToken: token.access_token,
    });
    if (res.status === 200) {
      toast({
        description: `${res.data.message}`,
      });
    }
    setChangeState(Math.random() + 23 * 3000);
  };

  // Task Parameters
  const getTaskParametersLazyLoading = async (task_name: string) => {
    const params = {
      baseURL: FLASK_URL,
      url: `${flaskApi.ShowTaskParameters}/${task_name}`,
      setLoading: setIsLoading,
      accessToken: token.access_token,
    };
    const response = await loadData(params);
    if (response.length) {
      return response;
    } else {
      return [];
    }
  };
  const getTaskParametersByTaskName = async (task_name: string) => {
    const res = await loadData({
      baseURL: FLASK_URL,
      url: `${flaskApi.ShowTaskParameters}/${task_name}`,
      setLoading: setIsLoading,
      accessToken: token.access_token,
    });

    if (res.length) {
      return res;
    } else {
      return [];
    }
  };
  const deleteTaskParameters = async (
    task_name: string,
    def_param_id: number
  ) => {
    const params = {
      baseURL: FLASK_URL,
      url: `${flaskApi.DeleteTaskParameters}/${task_name}/${def_param_id}`,
      setLoading: setIsLoading,
      accessToken: token.access_token,
    };
    const res = await deleteData(params);
    if (res.status === 200) {
      toast({
        description: `${res.data.message}`,
      });
    }
    setChangeState(Math.random() + 23 * 3000);
  };

  // Asynchronous Requests and Task Schedules
  const getAsynchronousRequestsAndTaskSchedules = async (
    page: number,
    limit: number
  ) => {
    const params = {
      baseURL: FLASK_URL,
      url: `${flaskApi.DefAsyncTaskSchedules}/${page}/${limit}`,
      setLoading: setIsLoading,
      accessToken: token.access_token,
    };
    const result = await loadData(params);
    if (result.items.length) {
      setTotalPage(result.pages);
      return result.items;
    } else {
      return [];
    }
  };
  const getSearchAsynchronousRequestsAndTaskSchedules = async (
    page: number,
    limit: number,
    task_name: string
  ) => {
    const resultLazyLoading = await loadData({
      baseURL: FLASK_URL,
      url: `${flaskApi.DefAsyncSearchTaskSchedules}/${page}/${limit}?task_name=${task_name}`,
      setLoading: setIsLoading,
      accessToken: token.access_token,
    });
    if (resultLazyLoading.items.length) {
      setTotalPage(resultLazyLoading.pages);
      return resultLazyLoading.items;
    } else {
      return [];
    }
  };
  const cancelScheduledTask = async (
    selectedItem: IAsynchronousRequestsAndTaskSchedulesTypes
    // selectedItems: IAsynchronousRequestsAndTaskSchedulesTypes[]
  ) => {
    const res = await putData({
      baseURL: FLASK_URL,
      url: `${flaskApi.CancelAsyncTasks}/${selectedItem.task_name}`,
      accessToken: token.access_token,
      payload: {
        redbeat_schedule_name: selectedItem.redbeat_schedule_name,
      },
      setLoading: setIsLoading,
    });
    if (res.status === 200) {
      toast({
        description: `${res.data.message}`,
      });
    }
    setChangeState(Math.random() + 23 * 3000);
  };
  const rescheduleTask = async (
    selectedItem: IAsynchronousRequestsAndTaskSchedulesTypes
  ) => {
    const res = await putData({
      baseURL: FLASK_URL,
      url: `${flaskApi.RescheduleTask}/${selectedItem.task_name}`,
      accessToken: token.access_token,
      payload: {
        redbeat_schedule_name: selectedItem.redbeat_schedule_name,
      },
      setLoading: setIsLoading,
    });
    if (res.status === 200) {
      toast({
        description: `${res.data.message}`,
      });
    }
    setChangeState(Math.random() + 23 * 3000);
  };
  const getViewRequests = async (
    page: number,
    limit: number,
    days: number,
    task_name: string
  ) => {
    const params = {
      baseURL: FLASK_URL,
      url: `${flaskApi.ViewRequests}/${page}/${limit}?days=${days}&task_name=${task_name}`,
      setLoading: setIsLoading,
      accessToken: token.access_token,
    };
    const result = await loadData(params);

    if (result.items.length) {
      setTotalPage(result.pages);
      return result.items;
    } else {
      return [];
    }
  };

  const values = {
    totalPage,
    setTotalPage,
    getManageExecutionMethods,
    getManageExecutionMethodsLazyLoading,
    getSearchManageExecutionMethodsLazyLoading,
    deleteExecutionMethod,
    getAsyncTasks,
    getAsyncTasksLazyLoading,
    isLoading,
    setIsLoading,
    selectedTask,
    setSelectedTask,
    selectedTaskParameters,
    setSelectedTaskParameters,
    getTaskParametersLazyLoading,
    getTaskParametersByTaskName,
    deleteTaskParameters,
    changeState,
    setChangeState,
    getAsynchronousRequestsAndTaskSchedules,
    getSearchAsynchronousRequestsAndTaskSchedules,
    cancelScheduledTask,
    rescheduleTask,
    getViewRequests,
    // getSearchViewRequests,
    getSearchAsyncTasksLazyLoading,
    cancelAsyncTasks,
  };
  return <ARMContext.Provider value={values}>{children}</ARMContext.Provider>;
}
