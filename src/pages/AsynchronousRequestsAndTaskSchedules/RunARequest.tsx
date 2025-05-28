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
import { IARMAsynchronousTasksTypes } from "@/types/interfaces/ARM.interface";

const RunARequest = () => {
  const api = useAxiosPrivate();
  const { getAsyncTasks, getTaskParametersByTaskName, setChangeState } =
    useARMContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [asyncTaskNames, setAsyncTaskNames] = useState<
    IARMAsynchronousTasksTypes[] | undefined
  >(undefined);
  const [parameters, setParameters] = useState<Record<string, string | number>>(
    {}
  );

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
    parameters: z.record(z.union([z.string(), z.number()])),
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
                        {asyncTaskNames?.map((item) => (
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

export default RunARequest;
