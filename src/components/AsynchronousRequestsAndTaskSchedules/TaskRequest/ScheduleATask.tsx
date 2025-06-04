import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FC, useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useARMContext } from "@/Context/ARMContext/ARMContext";
import {
  IARMAsynchronousTasksTypes,
  IAsynchronousRequestsAndTaskSchedulesTypes,
  IScheduleOnce,
  ISchedulePropsNonPeriodic,
  ISchedulePropsPeriodic,
} from "@/types/interfaces/ARM.interface";
import { X } from "lucide-react";
import Schedule from "./Schedule";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { format } from "date-fns";

interface ITaskRequestProps {
  action: string;
  handleCloseModal: () => void;
  user_schedule_name: string;
  selected?: IAsynchronousRequestsAndTaskSchedulesTypes;
}

const ScheduleATaskComponent: FC<ITaskRequestProps> = ({
  action,
  handleCloseModal,
  user_schedule_name,
  selected,
}) => {
  const api = useAxiosPrivate();
  const { getAsyncTasks, getTaskParametersByTaskName, setChangeState } =
    useARMContext();
  const { isOpenScheduleModal, setIsOpenScheduleModal } = useGlobalContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [asyncTaskNames, setAsyncTaskNames] = useState<
    IARMAsynchronousTasksTypes[] | undefined
  >(undefined);
  const [parameters, setParameters] = useState<Record<string, string | number>>(
    selected?.kwargs || {}
  );
  const [scheduleType, setScheduleType] = useState<string>(
    selected?.schedule_type ?? ""
  );
  const [schedule, setSchedule] = useState<
    | ISchedulePropsPeriodic
    | ISchedulePropsNonPeriodic
    | IScheduleOnce
    | undefined
  >(selected?.schedule);

  const handleGetParameters = async (task_name: string) => {
    try {
      setIsLoading(true);
      const results = await getTaskParametersByTaskName(task_name);
      const updatedParameters: Record<string, string | number> = {};

      if (results) {
        results.forEach((item) => {
          updatedParameters[item.parameter_name] =
            item.data_type.toLowerCase() === "integer" ? 0 : "";
          // updatedParameters["data_type"] =
          //   item.data_type.toLowerCase() === "integer" ? "integer" : "string";
        });
      }
      setParameters(updatedParameters);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const FormSchema = z.object({
    user_schedule_name: z.string(),
    task_name: z.string(),
    parameters: z.record(z.union([z.string(), z.number()])),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      user_schedule_name: "",
      task_name: "",
      parameters: selected?.kwargs ?? {},
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!(await form.trigger())) return;

    if (action !== "Edit Scheduled Task") {
      if (
        (scheduleType !== "IMMEDIATE" && data.user_schedule_name === "") ||
        data.task_name === "" ||
        scheduleType === "" ||
        (scheduleType !== "IMMEDIATE" && !schedule)
      )
        return toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
    }
    const payload =
      action === "Schedule A Task" && scheduleType !== "IMMEDIATE"
        ? {
            user_schedule_name: data.user_schedule_name,
            task_name: data.task_name,
            parameters: data.parameters,
            schedule,
            schedule_type: scheduleType,
          }
        : scheduleType === "IMMEDIATE"
        ? {
            task_name: data.task_name,
            parameters: data.parameters,
            schedule_type: scheduleType,
          }
        : {
            schedule,
            schedule_type: scheduleType,
            parameters: data.parameters,
            redbeat_schedule_name: selected?.redbeat_schedule_name,
          };
    // console.log(payload, "payload");
    try {
      setIsLoading(true);
      const res = await (action === "Schedule A Task"
        ? api.post(
            "/asynchronous-requests-and-task-schedules/create-task-schedule",
            payload
          )
        : api.put(
            `/asynchronous-requests-and-task-schedules/update-task-schedule/${selected?.task_name}`,
            payload
          ));
      if (res.status === 200) {
        toast({ title: "Success", description: `${res.data.message}` });
        handleCloseModal();
      }
    } catch (error) {
      console.log(error, "er");
      toast({
        title: "Error",
        description: "Failed to process request.",
        variant: "destructive",
      });
    } finally {
      form.reset();
      setSchedule(undefined);
      setScheduleType("");
      setIsLoading(false);
      setChangeState(Math.random() + 23 * 3000);
    }
  };

  useEffect(() => {
    const fetchAsyncTasks = async () => {
      try {
        setIsLoading(true);
        const tasks = await getAsyncTasks();
        if (tasks) {
          setAsyncTaskNames(tasks.filter((item) => item.srs === "Y"));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAsyncTasks();
  }, []);

  useEffect(() => {
    form.reset({
      ...form.getValues(),
      parameters: parameters,
      // kwargs: action === "Edit Scheduled Task" ? selected?.kwargs : parameters,
    });
  }, [form, parameters]);

  useEffect(() => {
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() + 1);
    const parse = format(currentTime, "yyyy-MM-dd HH:mm");

    setSchedule(() => {
      if (selected) {
        if (scheduleType === selected.schedule_type) {
          return selected.schedule;
        } else if (scheduleType === "IMMEDIATE") {
          return undefined;
        } else if (scheduleType === "ONCE") {
          return { VALUES: parse };
        } else if (scheduleType === "PERIODIC") {
          return selected.schedule;
        } else if (scheduleType === "WEEKLY_SPECIFIC_DAYS") {
          return { VALUES: [] };
        } else if (scheduleType === "MONTHLY_SPECIFIC_DATES") {
          return { VALUES: [] };
        }
      } else {
        if (scheduleType === "IMMEDIATE") {
          return undefined;
        } else if (scheduleType === "ONCE") {
          return { VALUES: parse };
        } else if (scheduleType === "PERIODIC") {
          return {} as ISchedulePropsPeriodic;
        } else if (scheduleType === "WEEKLY_SPECIFIC_DAYS") {
          return { VALUES: [] };
        } else if (scheduleType === "MONTHLY_SPECIFIC_DATES") {
          return { VALUES: [] };
        }
      }
    });
  }, [scheduleType, selected]);

  return (
    <div
      className={`${
        action === "Edit Scheduled Task"
          ? ""
          : "w-[900px] h-[450px] mx-auto my-10 border rounded"
      } `}
    >
      {action === "Edit Scheduled Task" && (
        <div className="p-2 bg-slate-300 rounded-t mx-auto text-center font-bold flex justify-between">
          <h2>Edit Scheduled Task</h2>
          <X onClick={() => handleCloseModal()} className="cursor-pointer" />
        </div>
      )}
      {isOpenScheduleModal === "Schedule" && (
        <CustomModal4 className="w-[770px] h-[450px]">
          <Schedule
            schedule={schedule}
            setSchedule={setSchedule}
            scheduleType={scheduleType}
            setScheduleType={setScheduleType}
            action="Schedule"
            setIsOpenScheduleModal={setIsOpenScheduleModal}
            selected={selected}
          />
        </CustomModal4>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 p-4">
          <div className="grid grid-cols-2 gap-4">
            {user_schedule_name !== "ad_hoc" &&
              scheduleType !== "IMMEDIATE" &&
              action === "Schedule A Task" && (
                <FormField
                  control={form.control}
                  name="user_schedule_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Schedule Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          required
                          disabled={user_schedule_name === "ad_hoc"}
                          placeholder="User Schedule Name"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
          </div>
          <div className="grid grid-cols-2 gap-4 pb-2">
            {action !== "Edit Scheduled Task" && (
              <FormField
                control={form.control}
                name="task_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Task Name</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleGetParameters(value);
                        }}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a Task" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {asyncTaskNames
                            ?.filter((item) => item.cancelled_yn !== "Y")
                            ?.map((item) => (
                              <SelectItem
                                key={item.def_task_id}
                                value={item.task_name}
                              >
                                {item.user_task_name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            {user_schedule_name !== "Ad Hoc" && (
              <div className="flex flex-col gap-[18px] pt-8">
                <h3
                  className="bg-gray-400 rounded p-[7px] border text-white font-bold hover:bg-gray-500 text-center cursor-pointer"
                  onClick={() => setIsOpenScheduleModal("Schedule")}
                >
                  Schedule
                </h3>
              </div>
            )}
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-winter-100  hover:bg-winter-100">
                <TableHead className="border border-winter-400">
                  Parameter Name
                </TableHead>
                <TableHead className="border border-winter-400 w-60">
                  Parameter Value
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center h-30 border border-winter-400"
                  >
                    <l-tailspin
                      size="40"
                      stroke="5"
                      speed="0.9"
                      color="black"
                    ></l-tailspin>
                  </TableCell>
                </TableRow>
              ) : Object.entries(form.watch("parameters") || {}).length ===
                0 ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center h-32 border border-winter-400"
                  >
                    No parameters available. Please select a task.
                  </TableCell>
                </TableRow>
              ) : (
                Object.entries(form.watch("parameters") || {}).map(
                  ([key, value]) => (
                    <TableRow key={key}>
                      {!key.trim() ? (
                        <TableCell className="border border-winter-400">
                          Select a Task
                        </TableCell>
                      ) : (
                        <>
                          <TableCell className="border border-winter-100 p-2">
                            {key}
                          </TableCell>
                          <TableCell className="border border-winter-100 p-2">
                            <Input
                              type="text"
                              value={value}
                              onChange={(e) =>
                                form.setValue(
                                  `parameters.${key}`,
                                  typeof value === "number"
                                    ? Number(e.target.value)
                                    : e.target.value
                                )
                              }
                              className="h-8"
                            />
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </Table>
          <div className="flex justify-end">
            <Button type="submit" className="mt-5">
              {isLoading ? <div>Loading...</div> : "Submit"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ScheduleATaskComponent;
