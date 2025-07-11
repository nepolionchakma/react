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
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
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
  IARMAsynchronousTasksParametersTypes,
  IARMAsynchronousTasksTypes,
  IAsynchronousRequestsAndTaskSchedulesTypes,
  IParametersTypes,
  IScheduleOnce,
  ISchedulePropsNonPeriodic,
  ISchedulePropsPeriodic,
} from "@/types/interfaces/ARM.interface";
import { X } from "lucide-react";
import Schedule from "./Schedule";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ITaskRequestProps {
  action: string;
  handleCloseModal: () => void;
  user_schedule_name: string;
  selected?: IAsynchronousRequestsAndTaskSchedulesTypes;
  setSelected: Dispatch<
    SetStateAction<IAsynchronousRequestsAndTaskSchedulesTypes | undefined>
  >;
}

const ScheduleATaskComponent: FC<ITaskRequestProps> = ({
  action,
  handleCloseModal,
  user_schedule_name,
  selected,
  setSelected,
}) => {
  const api = useAxiosPrivate();
  const { getAsyncTasks, getTaskParametersByTaskName, setChangeState } =
    useARMContext();
  const { isOpenScheduleModal, setIsOpenScheduleModal } = useGlobalContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [asyncTaskNames, setAsyncTaskNames] = useState<
    IARMAsynchronousTasksTypes[] | undefined
  >(undefined);
  const [parameters, setParameters] = useState<IParametersTypes>({});
  // Record<string, string | number | boolean | Date | undefined>
  // console.log(parameters, "parameters");
  const [parameterArray, setParameterArray] = useState<
    IARMAsynchronousTasksParametersTypes[] | undefined
  >([]);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  // const [time, setTime] = useState("00:00:00");

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
        setParameterArray(results);
        results.forEach((item) => {
          updatedParameters[item.parameter_name] =
            item.data_type.toLowerCase() === "integer" ? 0 : "";
        });
      }
      if (selected?.parameters) {
        setParameters(selected.parameters);
      } else {
        setParameters(updatedParameters);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const FormSchema = z.object({
    user_schedule_name: z.string(),
    task_name: z.string(),
    parameters: z.record(
      z.union([z.string(), z.number(), z.boolean(), z.date()])
    ),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      user_schedule_name: "",
      task_name: "",
      parameters: selected?.parameters ?? {},
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
        if (selected) {
          // select value update
          setSelected((prev) => {
            if (prev) {
              return {
                ...prev,
                parameters: payload.parameters,
              };
            }
            return prev;
          });
        }
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
    // handleGetParameters for editing scheduled task
    if (selected) {
      handleGetParameters(selected.task_name);
      if (selected?.parameters["Date-Time"]) {
        const dateString = selected?.parameters["Date-Time"];
        const date = new Date(dateString as Date | string);
        // const time = format(selected?.parameters["Date-Time"] as Date, "HH:mm");
        // setTime(time);
        setDate(date);
      }
    }
  }, [scheduleType, selected]);

  return (
    <div
      className={`${
        action === "Edit Scheduled Task"
          ? ""
          : "w-[900px] mx-auto my-10 border rounded"
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
                <>
                  {parameterArray?.map((pm) => (
                    <TableRow key={pm.parameter_name}>
                      <TableCell className="border border-winter-100 p-2">
                        {pm.parameter_name}
                      </TableCell>
                      <TableCell className="border border-winter-100 p-2">
                        {(pm.data_type.toLowerCase() === "string" ||
                          pm.data_type.toLowerCase() === "varchar" ||
                          pm.data_type.toLowerCase() === "interval") && (
                          <Input
                            type="text"
                            value={String(parameters[pm.parameter_name])}
                            onChange={(e) =>
                              setParameters((prev) => ({
                                ...prev,
                                [pm.parameter_name]: e.target.value,
                              }))
                            }
                            className="h-8"
                            placeholder={
                              pm.parameter_name === "Interval" ? "2h" : ""
                            }
                          />
                        )}
                        {pm.data_type.toLowerCase() === "integer" && (
                          <Input
                            type="number"
                            value={Number(parameters[pm.parameter_name])}
                            onChange={(e) =>
                              setParameters((prev) => ({
                                ...prev,
                                [pm.parameter_name]: Number(e.target.value),
                              }))
                            }
                            className="h-8"
                          />
                        )}
                        {pm.data_type.toLowerCase() === "boolean" && (
                          <Select
                            value={String(parameters[pm.parameter_name])}
                            onValueChange={(val) => {
                              setParameters((prev) => ({
                                ...prev,
                                [pm.parameter_name]:
                                  val === "true"
                                    ? true
                                    : val === "false"
                                    ? false
                                    : val,
                              }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a value" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">True</SelectItem>
                              <SelectItem value="false">False</SelectItem>
                            </SelectContent>
                          </Select>
                        )}

                        {pm.data_type.toLowerCase() === "datetime" && (
                          <div className="flex gap-4">
                            <div className="flex flex-col gap-3">
                              <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    id="date-picker"
                                    className="w-32 justify-between font-normal"
                                  >
                                    {date
                                      ? date.toLocaleDateString()
                                      : "Select date"}
                                    <ChevronDownIcon />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto overflow-hidden p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={date}
                                    captionLayout="dropdown"
                                    onSelect={(date) => {
                                      setDate(date);
                                      setOpen(false);
                                      setParameters((prev) => ({
                                        ...prev,
                                        [pm.parameter_name]: date,
                                      }));
                                    }}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div className="flex flex-col gap-3">
                              <Input
                                type="time"
                                id="time-picker"
                                step="1"
                                value={
                                  parameters[pm.parameter_name]
                                    ? format(
                                        parameters[pm.parameter_name] as Date,
                                        "HH:mm"
                                      )
                                    : "00:00:00" //time
                                }
                                onChange={(e) => {
                                  const timeValue = e.target.value;
                                  // setTime(timeValue);
                                  if (date) {
                                    const [hours, minutes, seconds] =
                                      timeValue.split(":");
                                    const updatedDate = new Date(date);
                                    updatedDate.setHours(
                                      parseInt(hours),
                                      parseInt(minutes),
                                      parseInt(seconds)
                                    );
                                    setParameters((prev) => ({
                                      ...prev,
                                      [pm.parameter_name]: updatedDate,
                                    }));
                                  }
                                }}
                                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                              />
                            </div>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </>
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
