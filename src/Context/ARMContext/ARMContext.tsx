import useAxiosPrivate from "@/hooks/useAxiosPrivate";
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
  getManageExecutionMethods: () => Promise<
    IExecutionMethodsTypes[] | undefined
  >;
  getManageExecutionMethodsLazyLoading: (
    page: number,
    limit: number
  ) => Promise<IExecutionMethodsTypes[] | undefined>;

  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  deleteAsyncTasks: (
    selectedItems: IARMAsynchronousTasksTypes[]
  ) => Promise<void>;
  selectedTask: IARMAsynchronousTasksTypes | undefined;
  setSelectedTask: React.Dispatch<
    React.SetStateAction<IARMAsynchronousTasksTypes | undefined>
  >;
  selectedTaskParameters: IARMTaskParametersTypes[] | undefined;
  setSelectedTaskParameters: React.Dispatch<
    React.SetStateAction<IARMTaskParametersTypes[] | undefined>
  >;
  getTaskParametersLazyLoading: (
    task_name: string,
    page: number,
    limit: number
  ) => Promise<IARMTaskParametersTypes[] | undefined>;
  getTaskParametersByTaskName: (
    task_name: string
  ) => Promise<IARMAsynchronousTasksParametersTypes[] | undefined>;
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
    selectedItems: IAsynchronousRequestsAndTaskSchedulesTypes[]
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
  const [changeState, setChangeState] = useState<number>(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedTask, setSelectedTask] = useState<
    IARMAsynchronousTasksTypes | undefined
  >(undefined);
  const [selectedTaskParameters, setSelectedTaskParameters] = useState<
    IARMTaskParametersTypes[] | undefined
  >(undefined);
  // const [page, setPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [totalPage2, setTotalPage2] = useState<number>(1);

  // Asunchronous Tasks
  const getAsyncTasks = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<IARMAsynchronousTasksTypes[]>(
        `/arm-tasks/def_async_tasks`
      );
      console.log(res);
      return res.data ?? [];
    } catch (error) {
      console.log(error);
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
      console.log(resultLazyLoading.data.items);
      return resultLazyLoading.data.items;
    } catch (error) {
      console.log(error);
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
      setIsLoading(true);
      const resultLazyLoading = await api.get(
        `/arm-tasks/def_async_tasks/search/${page}/${limit}?user_task_name=${userTaskName}`
      );

      setTotalPage(resultLazyLoading.data.pages);
      console.log(resultLazyLoading.data.items);
      return resultLazyLoading.data.items;
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAsyncTasks = async (
    selectedItems: IARMAsynchronousTasksTypes[]
  ) => {
    try {
      setIsLoading(true);
      await Promise.all(
        selectedItems.map(async (item) => {
          await api.put(`/arm-tasks/cancel-task/${item.task_name}`);
        })
      );
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Manage Execution Methods
  const getManageExecutionMethods = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<IExecutionMethodsTypes[]>(
        `/arm-tasks/show-execution-methods`
      );
      return res.data ?? [];
    } catch (error) {
      console.log(error);
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
      const [countExecutionMethods, ExecutionMethods] = await Promise.all([
        api.get<IExecutionMethodsTypes[]>(`/arm-tasks/show-execution-methods`),
        api.get<IExecutionMethodsTypes[]>(
          `/arm-tasks/show-execution-methods/${page}/${limit}`
        ),
      ]);

      const totalCount = countExecutionMethods.data.length;
      const totalPages = Math.ceil(totalCount / limit);
      setTotalPage(totalPages);
      return ExecutionMethods.data ?? [];
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Task Parameters
  const getTaskParametersLazyLoading = async (
    task_name: string,
    page: number,
    limit: number
  ) => {
    try {
      const [countTasksParameters, tasksParameters] = await Promise.all([
        api.get<IARMTaskParametersTypes[]>(
          `/arm-tasks/task-params/${task_name}`
        ),
        api.get<IARMTaskParametersTypes[]>(
          `/arm-tasks/task-params/${task_name}/${page}/${limit}`
        ),
      ]);

      const totalCount = countTasksParameters.data.length;
      const totalPages = Math.ceil(totalCount / limit);
      setTotalPage2(totalPages);
      return tasksParameters.data ?? [];
    } catch (error) {
      console.log("Task Parameters Item Not found");
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

  // lazy loading task schedule
  const getAsynchronousRequestsAndTaskSchedules = async (
    page: number,
    limit: number
  ) => {
    try {
      const result = await api.get<{
        pages: number;
        items: IAsynchronousRequestsAndTaskSchedulesTypes[];
      }>(
        `/asynchronous-requests-and-task-schedules/task-schedules/${page}/${limit}`
      );

      const totalPages = result.data.pages;
      setTotalPage(totalPages);
      return result.data.items ?? [];
    } catch (error) {
      console.log("Task Parameters Item Not found");
      return [];
    }
  };

  // lazy loading search by task name
  const getSearchAsynchronousRequestsAndTaskSchedules = async (
    page: number,
    limit: number,
    task_name: string
  ) => {
    try {
      const resultLazyLoading = await api.get(
        `/asynchronous-requests-and-task-schedules/task-schedules/search/${page}/${limit}?task_name=${task_name}`
      );
      setTotalPage(resultLazyLoading.data.pages);
      return resultLazyLoading.data.items;
    } catch (error) {
      console.log(error);
    }
  };

  // const getAsynchronousRequestsAndTaskSchedules = async (
  //   page: number,
  //   limit: number
  // ) => {
  //   try {
  //     const [allTasksSchedules, taskSchedules] = await Promise.all([
  //       api.get<IAsynchronousRequestsAndTaskSchedulesTypes[]>(
  //         `/asynchronous-requests-and-task-schedules/task-schedules`
  //       ),
  //       api.get<IAsynchronousRequestsAndTaskSchedulesTypes[]>(
  //         `/asynchronous-requests-and-task-schedules/task-schedules/${page}/${limit}`
  //       ),
  //     ]);

  //     const totalCount = allTasksSchedules.data.length;
  //     const totalPages = Math.ceil(totalCount / limit);
  //     setTotalPage(totalPages);
  //     return taskSchedules.data ?? [];
  //   } catch (error) {
  //     console.log("Task Parameters Item Not found");
  //     return [];
  //   }
  // };

  const cancelScheduledTask = async (
    selectedItems: IAsynchronousRequestsAndTaskSchedulesTypes[]
  ) => {
    try {
      setIsLoading(true);
      const responses = await Promise.all(
        selectedItems.map(async (item) => {
          try {
            const response = await api.put(
              `/asynchronous-requests-and-task-schedules/cancel-task-schedule/${item.task_name}`,
              {
                redbeat_schedule_name: item.redbeat_schedule_name,
              }
            );
            return response;
          } catch (error) {
            console.error("Error canceling task schedule:", error);
            return null;
          }
        })
      );
      responses.map((i) => {
        return toast({
          description: `${i?.data?.message}`,
        });
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const getViewRequests = async (page: number, limit: number) => {
    try {
      setIsLoading(true);
      const resultLazyLoading = await api.get(
        `/asynchronous-requests-and-task-schedules/view_requests/${page}/${limit}`
      );

      setTotalPage(resultLazyLoading.data.pages);
      console.log(resultLazyLoading.data.items);
      return resultLazyLoading.data.items;
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSearchViewRequests = async (
    page: number,
    limit: number,
    userScheduleName: string
  ) => {
    try {
      setIsLoading(true);
      const resultLazyLoading = await api.get(
        `/asynchronous-requests-and-task-schedules/view_requests/search/${page}/${limit}?user_schedule_name=${userScheduleName}`
      );

      setTotalPage(resultLazyLoading.data.pages);

      return resultLazyLoading.data.items;
    } catch (error) {
      console.log(error);
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
    getAsyncTasks,
    getAsyncTasksLazyLoading,
    isLoading,
    setIsLoading,
    deleteAsyncTasks,
    selectedTask,
    setSelectedTask,
    selectedTaskParameters,
    setSelectedTaskParameters,
    getTaskParametersLazyLoading,
    getTaskParametersByTaskName,
    changeState,
    setChangeState,
    getAsynchronousRequestsAndTaskSchedules,
    getSearchAsynchronousRequestsAndTaskSchedules,
    cancelScheduledTask,
    getViewRequests,
    getSearchViewRequests,
    getSearchAsyncTasksLazyLoading,
  };
  return <ARMContext.Provider value={values}>{children}</ARMContext.Provider>;
}
