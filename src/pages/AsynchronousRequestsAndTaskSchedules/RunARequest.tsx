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
import { useEffect, useState } from "react";
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
} from "@/types/interfaces/ARM.interface";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const RunARequest = () => {
  const api = useAxiosPrivate();
  const { getAsyncTasks, getTaskParametersByTaskName, setChangeState } =
    useARMContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [asyncTaskNames, setAsyncTaskNames] = useState<
    IARMAsynchronousTasksTypes[] | undefined
  >(undefined);
  const [parameters, setParameters] = useState<
    Record<string, string | number | boolean | Date | undefined>
  >({});
  const [parameterArray, setParameterArray] = useState<
    IARMAsynchronousTasksParametersTypes[] | undefined
  >([]);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

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
      // kwargs: action === "Edit Task Schedule" ? selected?.kwargs : parameters,
    });
  }, [parameters]);

  const FormSchema = z.object({
    task_name: z.string(),
    parameters: z.record(
      z.union([z.string(), z.number(), z.boolean(), z.date()])
    ),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      task_name: "",
      parameters: {},
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const PostData = {
      task_name: data.task_name,
      parameters: data.parameters,
      schedule_type: "IMMEDIATE",
    };
    try {
      setIsLoading(true);
      const response = await api.post(
        `/asynchronous-requests-and-task-schedules/create-task-schedule`,
        PostData
      );

      if (response) {
        toast({
          description: `${response.data.message}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task schedule.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      form.reset();
      setChangeState(Math.random() + 23 * 3000);
    }
  };

  const handleGetParameters = async (task_name: string) => {
    try {
      setIsLoading(true);
      const results = await getTaskParametersByTaskName(task_name);
      const updatedParameters: Record<string, string | number | boolean> = {};

      if (results) {
        setParameterArray(results);
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

  return (
    <div className="w-[900px] mx-auto my-10 border rounded">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 p-4">
          <div className="grid grid-cols-2 gap-4 pb-2">
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
                                defaultValue="00:00:00"
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

export default RunARequest;
