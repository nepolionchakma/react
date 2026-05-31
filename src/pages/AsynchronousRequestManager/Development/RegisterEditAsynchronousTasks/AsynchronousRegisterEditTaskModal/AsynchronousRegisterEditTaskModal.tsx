import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import {
  IARMAsynchronousTasksTypes,
  IExecutionMethodsTypes,
} from "@/types/interfaces/ARM.interface";
import { useARMContext } from "@/Context/ARMContext/ARMContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Spinner from "@/components/Spinner/Spinner";
import { ILookup } from "@/types/interfaces/orchestration.interface";
import { FLASK_URL } from "@/Api/Api";
import { loadData, postData, putData } from "@/Utility/funtion";

interface ICreateTaskProps {
  task_name: string;
  selected: IARMAsynchronousTasksTypes;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  handleCloseModal: () => void;
}
interface IChackboxTypes {
  srs?: string;
  sf?: string;
}
const AsynchronousRegisterEditTaskModal: FC<ICreateTaskProps> = ({
  task_name,
  selected,
  isLoading,
  setIsLoading,
  handleCloseModal,
}) => {
  const { isOpenModal, token } = useGlobalContext();
  const { setChangeState, getManageExecutionMethods } = useARMContext();
  const [executionMethods, setExecutionMethods] = useState<
    IExecutionMethodsTypes[]
  >([]);
  const [selectedExecutionMethod, setSelectedExecutionMethod] =
    useState<IExecutionMethodsTypes>(executionMethods[0]);
  const [lookups, setLookups] = useState<ILookup[] | []>([]);

  const [checkboxSelected, setCheckboxSelected] = useState<IChackboxTypes>(
    selected && { srs: selected.srs, sf: selected.sf },
    // selected[0] && { srs: selected[0].srs, sf: selected[0].sf }
  );

  const FormSchema = z.object({
    user_task_name: z.string(),
    task_name: z.string(),
    execution_method: z.string(),
    script_name: z.string(),
    script_path: z.string(),
    description: z.string(),
    srs: z.string().optional(),
    sf: z.string().optional(),
    sf_type: z.enum(["PREDICTABLE", "UNPREDICTABLE"]).optional(),
    lookup_id: z.string().optional().nullable(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues:
      isOpenModal === "register_task"
        ? {
            user_task_name: "",
            task_name: "",
            execution_method: selectedExecutionMethod?.execution_method,
            script_name: "",
            description: "",
            srs: "N",
            sf: "N",
            script_path: "",
            sf_type: undefined,
            lookup_id: null,
          }
        : {
            user_task_name: selected?.user_task_name,
            task_name: selected?.task_name,
            execution_method: selected?.execution_method,
            script_name: selected?.script_name,
            description: selected?.description,
            srs: selected?.srs,
            sf: selected?.sf,
            script_path: selected?.script_path,
            sf_type: selected?.sf_type,
            lookup_id: selected?.lookup_id?.toString(),
          },
  });

  console.log(form.formState.errors);
  const { reset } = form;

  const stepFuntion = form.watch("sf");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getManageExecutionMethods();
        if (res) {
          console.log(res);
          setExecutionMethods(res);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const params = {
      baseURL: FLASK_URL,
      url: `/lookup_with_values`,
      accessToken: `${token.access_token}`,
      setLoading: setIsLoading,
    };

    const fetchLookups = async () => {
      const res = await loadData(params);
      if (res.result) {
        setLookups(res.result);
      }
    };

    fetchLookups();
  }, [setIsLoading, token.access_token]);

  const handleCheckboxChange = (name: string) => {
    if (name === "srs") {
      setCheckboxSelected((prev) => {
        if (prev?.srs === "Y") {
          form.setValue("srs", "N");
          return { ...prev, srs: "N" };
        } else {
          form.setValue("srs", "Y");
          return { ...prev, srs: "Y" };
        }
      });
    } else if (name === "sf") {
      setCheckboxSelected((prev) => {
        if (prev?.sf === "Y") {
          form.setValue("sf", "N");
          return { ...prev, sf: "N" };
        } else {
          form.setValue("sf", "Y");
          return { ...prev, sf: "Y" };
        }
      });
    }
  };

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const postPayload = {
      user_task_name: data.user_task_name,
      task_name: data.task_name,
      executor: selectedExecutionMethod?.executor,
      execution_method: data.execution_method,
      internal_execution_method:
        selectedExecutionMethod?.internal_execution_method,
      script_name: data.script_name,
      script_path: data.script_path,
      description: data.description,
      srs: data.srs,
      sf: data.sf,
      sf_type: stepFuntion === "Y" ? data.sf_type : null,
      lookup_id: stepFuntion === "Y" ? Number(data.lookup_id) : null,
    };
    const putPayload = {
      user_task_name: data.user_task_name,
      execution_method: data.execution_method,
      script_name: data.script_name,
      description: data.description,
      srs: data.srs,
      sf: data.sf,
      sf_type: stepFuntion === "Y" ? data.sf_type : null,
      lookup_id: stepFuntion === "Y" ? Number(data.lookup_id) : null,
    };

    if (isOpenModal === "register_task") {
      const params = {
        baseURL: FLASK_URL,
        url: "Create_Task",
        setLoading: setIsLoading,
        payload: postPayload,
        // isConsole?: boolean;
        isToast: true,
        accessToken: token.access_token,
      };

      const res = await postData(params);

      if (res.status === 201) {
        handleCloseModal();
        reset();
        setChangeState(Math.random() + 23 * 3000);
      }
    } else {
      const params = {
        baseURL: FLASK_URL,
        url: `Update_Task/${selected.task_name}`,
        setLoading: setIsLoading,
        payload: putPayload,
        // isConsole?: boolean;
        isToast: true,
        accessToken: token.access_token,
      };

      const res = await putData(params);

      if (res.status === 200) {
        handleCloseModal();
        reset();
        setChangeState(Math.random() + 23 * 3000);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between bg-[#CEDEF2] p-4">
        <h2 className="font-semibold capitalize">{task_name} Task</h2>
        <X onClick={() => handleCloseModal()} className="cursor-pointer" />
      </div>
      <div className="max-h-[70vh] p-4 overflow-auto scrollbar-thin">
        {isLoading ? (
          <div className="w-full flex justify-center">
            <Spinner size="40" color="black" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              {/* <div className="grid grid-cols-2 gap-4">
                
              </div> */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-1">
                  <Checkbox
                    checked={checkboxSelected?.srs === "Y"}
                    onClick={() => handleCheckboxChange("srs")}
                  />
                  <FormLabel onClick={() => handleCheckboxChange("srs")}>
                    Standard Request Submission (SRS)
                  </FormLabel>
                </div>
                <div className="flex items-center gap-1">
                  <Checkbox
                    checked={checkboxSelected?.sf === "Y"}
                    onClick={() => handleCheckboxChange("sf")}
                  />
                  <FormLabel onClick={() => handleCheckboxChange("sf")}>
                    Step Function (SF)
                  </FormLabel>
                </div>
                {stepFuntion === "Y" && (
                  <FormField
                    control={form.control}
                    name="sf_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Step Function Type</FormLabel>

                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Step Function Type" />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            <SelectItem value="PREDICTABLE">
                              Predictable
                            </SelectItem>
                            <SelectItem value="UNPREDICTABLE">
                              Unpredictable
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                )}

                {stepFuntion === "Y" && (
                  <FormField
                    control={form.control}
                    name="lookup_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lookup</FormLabel>

                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) => {
                            field.onChange(value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Lookup" />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            {lookups.map((l) => (
                              <SelectItem
                                key={l.lookup_id}
                                value={l.lookup_id.toString()}
                              >
                                {l.lookup_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="user_task_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Task Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          required
                          autoFocus
                          type="text"
                          placeholder="User Task Name"
                          className="px-2 h-8"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="task_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          required
                          type="text"
                          placeholder="Task Name"
                          className="px-2 h-8"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {isOpenModal !== "edit_task" && (
                  <FormField
                    control={form.control}
                    name="execution_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Execution Method</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              const selectedItem = executionMethods.find(
                                (item) => item.execution_method === value,
                              );
                              if (selectedItem) {
                                setSelectedExecutionMethod(selectedItem);
                              }
                            }}
                            value={field.value}
                          >
                            <SelectTrigger className="px-2 h-8">
                              <SelectValue placeholder="Select Execution Method" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                              {executionMethods.map((item) => (
                                <SelectItem
                                  key={item.execution_method}
                                  value={item.execution_method}
                                >
                                  {item.execution_method}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                {isOpenModal !== "edit_task" && (
                  <div>
                    <FormLabel htmlFor="Executor">Executor</FormLabel>
                    <Input
                      placeholder="Executor"
                      readOnly
                      disabled
                      className="my-2 px-2 h-8"
                      value={selectedExecutionMethod?.executor ?? "Executor"}
                    />
                  </div>
                )}

                {isOpenModal !== "edit_task" && (
                  <FormField
                    control={form.control}
                    name="script_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Script Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            required
                            type="text"
                            placeholder="Script Name"
                            className="px-2 h-8"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                {isOpenModal !== "edit_task" && (
                  <FormField
                    control={form.control}
                    name="script_path"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Script Path</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            required
                            type="text"
                            placeholder="Script Path"
                            className="px-2 h-8"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Description" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" className=" mt-2">
                  {isLoading ? (
                    <l-tailspin
                      size="15"
                      stroke="3"
                      speed="0.9"
                      color="white"
                    />
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
};
export default AsynchronousRegisterEditTaskModal;
