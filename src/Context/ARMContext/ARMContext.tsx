import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import {
  IARMAsynchronousTasksParametersTypes,
  IARMAsynchronousTasksTypes,
  IARMTaskParametersTypes,
  IARMViewRequestsTypes,
  IAsynchronousRequestsAndTaskSchedulesTypes,
  IExecutionMethodsTypes,
  IGetResponseExecutionMethodsTypes,
} from "@/types/interfaces/ARM.interface";
import React, { ReactNode, createContext, useContext, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import { useGlobalContext } from "../GlobalContext/GlobalContext";
interface ARMContextProviderProps {
  children: ReactNode;
}

interface ARMContext {
  totalPage: number;
  setTotalPage: React.Dispatch<React.SetStateAction<number>>;
  totalPage2: number;
  setTotalPage2: React.Dispatch<React.SetStateAction<number>>;
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
    limit: number
  ) => Promise<IARMViewRequestsTypes[] | undefined>;
  getSearchViewRequests: (
    page: number,
    limit: number,
    query: string
  ) => Promise<IARMViewRequestsTypes[] | undefined>;
}

// eslint-disable-next-line react-refresh/only-export-components

const ARMContext = createContext({} as ARMContext);

// eslint-disable-next-line react-refresh/only-export-components
export function useARMContext() {
  return useContext(ARMContext);
}

export function ARMContextProvider({ children }: ARMContextProviderProps) {
  const api = useAxiosPrivate();
  const { token } = useGlobalContext();
  const FLASK_ENDPOINT_URL = import.meta.env.VITE_FLASK_ENDPOINT_URL;
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
  const [totalPage2, setTotalPage2] = useState<number>(1);
  const { loadData } = useGlobalContext();

  // Asunchronous Tasks
  const getAsyncTasks = async () => {
    try {
      // setIsLoading(true);
      const res = await api.get<IARMAsynchronousTasksTypes[]>(
        `/arm-tasks/def_async_tasks`
      );

      return res.data ?? [];
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };
  const getAsyncTasksLazyLoading = async (page: number, limit: number) => {
    try {
      setIsLoading(true);
      const resultLazyLoading = await api.get(
        `/arm-tasks/def_async_tasks/${page}/${limit}`
      );

      setTotalPage(resultLazyLoading.data.pages);
      return resultLazyLoading.data.items;
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };
  const getSearchAsyncTasksLazyLoading = async (
    page: number,
    limit: number,
    userTaskName: string
  ) => {
    try {
      // setIsLoading(true);
      const resultLazyLoading = await api.get(
        `/arm-tasks/def_async_tasks/search/${page}/${limit}?user_task_name=${userTaskName}`
      );

      setTotalPage(resultLazyLoading.data.pages);
      return resultLazyLoading.data.items;
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };
  const cancelAsyncTasks = async (task_name: string) => {
    try {
      // setIsLoading(true);
      const res = await api.put(`/arm-tasks/cancel-task/${task_name}`);
      if (res.status === 200) {
        toast({
          description: `${res.data.message}`,
        });
        setChangeState(Math.random() + 23 * 3000);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Manage Execution Methods
  const getManageExecutionMethods = async () => {
    try {
      // setIsLoading(true);
      const res = await api.get<IExecutionMethodsTypes[]>(
        `/arm-tasks/show-execution-methods`
      );
      return res.data ?? [];
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };
  const getManageExecutionMethodsLazyLoading = async (
    page: number,
    limit: number
  ) => {
    try {
      setIsLoading(true);
      // const [countExecutionMethods, ExecutionMethods] = await Promise.all([
      //   api.get<IExecutionMethodsTypes[]>(`/arm-tasks/show-execution-methods`),
      //   api.get<IExecutionMethodsTypes[]>(
      //     `/arm-tasks/show-execution-methods/${page}/${limit}`
      //   ),
      // ]);
      const res = await api.get<IGetResponseExecutionMethodsTypes>(
        `/arm-tasks/show-execution-methods/${page}/${limit}`
      );
      // const totalCount = countExecutionMethods.data.length;
      // const totalPages = Math.ceil(totalCount / limit);
      setTotalPage(res.data.pages);
      return res.data.items ?? [];
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };
  const getSearchManageExecutionMethodsLazyLoading = async (
    page: number,
    limit: number,
    internal_execution_method: string
  ) => {
    try {
      setIsLoading(true);
      const res = await api.get<IGetResponseExecutionMethodsTypes>(
        `/arm-tasks/def_async_execution_methods/search/${page}/${limit}?internal_execution_method=${internal_execution_method}`
      );
      setTotalPage(res.data.pages);
      return res.data.items ?? [];
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };
  const deleteExecutionMethod = async (internal_execution_method: string) => {
    try {
      setIsLoading(true);
      const res = await api.delete(
        `/arm-tasks/delete-execution-method/${internal_execution_method}`
      );
      if (res.status === 200) {
        toast({
          description: `${res.data.message}`,
        });
        setChangeState(Math.random() + 23 * 3000);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Task Parameters
  const getTaskParametersLazyLoading = async (task_name: string) => {
    try {
      const response = await axios.get<IARMTaskParametersTypes[]>(
        `${FLASK_ENDPOINT_URL}/Show_TaskParams/${task_name}`,
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
        }
      );
      // setTotalPage2(response.data.pages);
      return response.data ?? [];
    } catch (error) {
      console.log(error);
      return [];
    }
  };
  const getTaskParametersByTaskName = async (task_name: string) => {
    try {
      const res = await api.get<IARMAsynchronousTasksParametersTypes[]>(
        `/arm-tasks/task-params/${task_name}`
      );

      return res.data ?? [];
    } catch (error) {
      console.log("Task Parameters Item Not found");
      return [];
    }
  };
  const deleteTaskParameters = async (
    task_name: string,
    def_param_id: number
  ) => {
    try {
      const res = await axios.delete(
        `${FLASK_ENDPOINT_URL}/Delete_TaskParams/${task_name}/${def_param_id}`,
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
        }
      );
      if (res.status === 200) {
        toast({
          description: `${res.data.message}`,
        });
        setChangeState(Math.random() + 23 * 3000);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      }
    }
  };

  // Asynchronous Requests and Task Schedules
  const getAsynchronousRequestsAndTaskSchedules = async (
    page: number,
    limit: number
  ) => {
    const params = {
      baseURL: import.meta.env.VITE_FLASK_ENDPOINT_URL,
      url: `/def_async_task_schedules/${page}/${limit}`,
      setLoading: setIsLoading,
    };
    const result = await loadData<{
      pages: number;
      items: IAsynchronousRequestsAndTaskSchedulesTypes[];
    }>(params);
    if (result) {
      setTotalPage(result.pages);
      return result.items;
    }
  };
  const getSearchAsynchronousRequestsAndTaskSchedules = async (
    page: number,
    limit: number,
    task_name: string
  ) => {
    try {
      setIsLoading(true);
      const resultLazyLoading = await api.get(
        `/asynchronous-requests-and-task-schedules/task-schedules/search/${page}/${limit}?task_name=${task_name}`
      );
      setTotalPage(resultLazyLoading.data.pages);
      return resultLazyLoading.data.items;
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      }
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };
  const cancelScheduledTask = async (
    selectedItem: IAsynchronousRequestsAndTaskSchedulesTypes
    // selectedItems: IAsynchronousRequestsAndTaskSchedulesTypes[]
  ) => {
    try {
      setIsLoading(true);
      const res = await api.put(
        `/asynchronous-requests-and-task-schedules/cancel-task-schedule/${selectedItem.task_name}`,
        {
          redbeat_schedule_name: selectedItem.redbeat_schedule_name,
        }
      );
      if (res.status === 200) {
        toast({
          description: `${res.data.message}`,
        });
        setChangeState(Math.random() + 23 * 3000);
      }
      // const responses = await Promise.all(
      //   selectedItems.map(async (item) => {
      //     try {
      //       const response = await api.put(
      //         `/asynchronous-requests-and-task-schedules/cancel-task-schedule/${item.task_name}`,
      //         {
      //           redbeat_schedule_name: item.redbeat_schedule_name,
      //         }
      //       );
      //       return response;
      //     } catch (error) {
      //       console.error("Error canceling task schedule:", error);
      //       return null;
      //     }
      //   })
      // );
      // responses.map((i) => {
      //   return toast({
      //     description: `${i?.data?.message}`,
      //   });
      // });
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };
  const rescheduleTask = async (
    selectedItem: IAsynchronousRequestsAndTaskSchedulesTypes
  ) => {
    try {
      setIsLoading(true);
      const res = await api.put(
        `/asynchronous-requests-and-task-schedules/reschedule-task/${selectedItem.task_name}`,
        {
          redbeat_schedule_name: selectedItem.redbeat_schedule_name,
        }
      );
      if (res.status === 200) {
        toast({
          description: `${res.data.message}`,
        });
        setChangeState(Math.random() + 23 * 3000);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };
  const getViewRequests = async (page: number, limit: number) => {
    const params = {
      baseURL: import.meta.env.VITE_FLASK_ENDPOINT_URL,
      url: `/view_requests/${page}/${limit}`,
      setLoading: setIsLoading,
    };
    const result = await loadData<{
      pages: number;
      items: IARMViewRequestsTypes[];
    }>(params);
    if (result) {
      setTotalPage(result.pages);

      return result.items;
    }
  };

  const getSearchViewRequests = async (
    page: number,
    limit: number,
    task_name: string
  ) => {
    try {
      setIsLoading(true);
      const resultLazyLoading = await api.get(
        `/asynchronous-requests-and-task-schedules/view_requests/search/${page}/${limit}?task_name=${task_name}`
      );

      setTotalPage(resultLazyLoading.data.pages);
      return resultLazyLoading.data.items;
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const values = {
    totalPage,
    setTotalPage,
    totalPage2,
    setTotalPage2,
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
    getSearchViewRequests,
    getSearchAsyncTasksLazyLoading,
    cancelAsyncTasks,
  };
  return <ARMContext.Provider value={values}>{children}</ARMContext.Provider>;
}
