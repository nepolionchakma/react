import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useARMContext } from "@/Context/ARMContext/ARMContext";

import { IARMAsynchronousTasksTypes } from "@/types/interfaces/ARM.interface";
import { zodResolver } from "@hookform/resolvers/zod";
import { EllipsisVertical, Play, StopCircle, X } from "lucide-react";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ShapeNode } from "../../shape/types";
import { Edge, useUpdateNodeInternals } from "@xyflow/react";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import axios from "axios";
import { tailspin } from "ldrs";
import { toast } from "@/components/ui/use-toast";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { postData } from "@/Utility/funtion";
import { IRequiredAttributes } from "../../Flow";

interface EditNodeProps {
  theme: string;
  nodes: ShapeNode[];
  setNodes: (
    payload: ShapeNode[] | ((nodes: ShapeNode[]) => ShapeNode[]),
  ) => void;
  edges: Edge[];
  setEdges: (payload: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  selectedNode: ShapeNode | undefined;
  setSelectedNode: Dispatch<SetStateAction<ShapeNode | undefined>>;
  setIsAddAttribute: Dispatch<SetStateAction<boolean>>;
  // processExecutionId: string;
  setProcessExecutionId: Dispatch<SetStateAction<string>>;
  workFlowId: number | undefined;
  setRequiredAttributes: Dispatch<SetStateAction<IRequiredAttributes[]>>;
}

const EditNode: FC<EditNodeProps> = ({
  theme,
  nodes,
  setNodes,
  edges,
  setEdges,
  selectedNode,
  setSelectedNode,
  setIsAddAttribute,
  // processExecutionId,
  setProcessExecutionId,
  workFlowId,
  setRequiredAttributes,
}) => {
  const { getAsyncTasks } = useARMContext();
  const [stepFunctionTasks, setStepFunctionTasks] = useState<
    IARMAsynchronousTasksTypes[]
  >([]);
  const { token, edgeConnectionPosition, setEdgeConnectionPosition } =
    useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);
  tailspin.register();
  const updateNodeInternals = useUpdateNodeInternals(); // Updating node internals dynamically

  // {
  //           "name": "EMPLOYEE_ID",
  //           "required": true,
  //           "source_label": "get employee name",
  //           "source_task": "get_employee_name",
  //           "type": "string",
  //           "value": ""
  //       }

  useEffect(() => {
    const fetchAsyncTasks = async () => {
      try {
        const res = await getAsyncTasks();
        if (res) {
          setStepFunctionTasks(res.filter((task) => task.sf === "Y"));
        }
      } catch (error) {
        console.log(error, "error");
      }
    };
    fetchAsyncTasks();
  }, []);

  const FormSchema = z.object(
    selectedNode
      ? Object.keys(selectedNode.data).reduce(
          (acc, key) => {
            const value =
              selectedNode.data[key as keyof typeof selectedNode.data];
            if (key === "label") {
              acc[key] = z.string();
            } else if (key === "step_function") {
              acc[key] = z.string();
            } else if (key === "attributes" && Array.isArray(value)) {
              acc[key] = z
                .array(
                  z.object({
                    id: z.number(),
                    attribute_name: z.string(),
                    attribute_value: z.string(),
                  }),
                )
                .optional();
            } else {
              acc[key] = z.unknown().optional();
            }

            return acc;
          },
          {} as Record<string, z.ZodType<any>>,
        )
      : {},
  );

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: selectedNode ? selectedNode.data : {},
  });

  useEffect(() => {
    if (selectedNode?.data) {
      form.reset(selectedNode ? selectedNode.data : {});
    }
  }, [selectedNode, form]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (selectedNode) {
      setNodes((prev: ShapeNode[]) => {
        return prev.map((node: ShapeNode) => {
          if (node.id === selectedNode.id) {
            return {
              ...node,
              data: {
                ...node.data,
                label: data.label,
                step_function: data.step_function,
                attributes: data.attributes,
                edge_connection_position: edgeConnectionPosition,
              },
            };
          }
          return node;
        });
      });

      updateNodeInternals(selectedNode.id); // <-- force refresh

      setSelectedNode(undefined);
    }
  };

  const handleDelete = () => {
    if (selectedNode) {
      setNodes((prevNodes: ShapeNode[]) =>
        prevNodes.filter((node: ShapeNode) => node.id !== selectedNode.id),
      );

      setEdges((prevEdges) =>
        prevEdges.filter(
          (edge) =>
            edge.source !== selectedNode.id && edge.target !== selectedNode.id,
        ),
      );
      setSelectedNode(undefined);
    }
  };

  const handleRemoveAttribute = (id: number) => {
    if (selectedNode) {
      setSelectedNode((prevNode: ShapeNode | undefined) =>
        prevNode
          ? {
              ...prevNode,
              data: {
                ...prevNode.data,
                attributes: prevNode?.data?.attributes.filter(
                  (attr: any) => attr.id !== id,
                ),
              },
            }
          : prevNode,
      );
    }
  };

  const displayOrder = [
    "edge_connection_position",
    "label",
    "step_function",
    "attributes",
    "color",
    "type",
  ];

  const handlePositionClick = (position: string) => {
    setEdgeConnectionPosition((prevPositions) => {
      let updatedPositions: string[] = [];

      if (prevPositions.includes(position)) {
        updatedPositions = prevPositions.filter((pos) => pos !== position);
      } else {
        updatedPositions = [...prevPositions, position];
      }

      if (!selectedNode) return updatedPositions;

      const edgesToRemove = selectedNode.data.edges;

      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          return {
            ...node,
            data: {
              ...node.data,
              edge_connection_position:
                node.id === selectedNode.id
                  ? updatedPositions
                  : node.data.edge_connection_position,
            },
          };
        }),
      );

      setEdges((prevEdges) =>
        prevEdges.filter((edge) => !edgesToRemove.includes(edge.id)),
      );

      // Force React Flow to update the node's internal handles
      setTimeout(() => {
        updateNodeInternals(selectedNode.id);
      }, 0);

      return updatedPositions;
    });
  };
  console.log(selectedNode, "selectedNode");

  // Trigger the workflow via a standard POST request
  const startWorkflow = async () => {
    try {
      setIsLoading(true);
      const response = await postData({
        baseURL: FLASK_URL,
        url: flaskApi.RequiredParams,
        setLoading: setIsLoading,
        payload: { nodes: nodes, edges: edges },
        // isConsole: true,
        // isToast: true,
        accessToken: token.access_token,
      });
      // const response = await axios.post(
      //   `${FLASK_URL}/workflow/required_params`,
      //   { nodes: nodes, edges: edges },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token.access_token}`,
      //     },
      //   },
      // );
      console.log(response.data.has_required_inputs, "response.....");
      if (response.data.has_required_inputs) {
        console.log(response.data.message);
        setRequiredAttributes(response.data.workflow_inputs);
      } else {
        const response = await axios.post(
          `${FLASK_URL}/workflow/run/${workFlowId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token.access_token}`,
            },
          },
        );

        toast({
          description: `${response.data.message}`,
          variant: "default",
        });
        const executionId = response.data.def_process_execution_id;
        setProcessExecutionId(executionId);

        const eventSource = new EventSource(
          `${FLASK_URL}/workflow/execution_stream/${executionId}?access_token=${token.access_token}`,
        );

        eventSource.onmessage = (event) => {
          const payload = JSON.parse(event.data);

          console.log("Workflow Update:", event);

          if (payload.type === "step") {
            // handle step update
          }
        };

        eventSource.addEventListener("step", (event) => {
          const step = JSON.parse(event.data);
          console.log(step, "step");
          if (step.status === "RUNNING") {
            console.log("Currently executing:", step.node_label);
          }
        });

        eventSource.addEventListener("complete", (event) => {
          console.log("Workflow finished successfully!");
          const parseEvent = JSON.parse(event.data);
          toast({
            title: parseEvent.execution_status,
            description: `
          Process Execution ID: ${parseEvent.def_process_execution_id},
          Process ID: ${parseEvent.def_process_execution_id}`,
          });
          eventSource.close();
        });

        eventSource.onerror = (error) => {
          console.error("SSE connection error:", error);
          eventSource.close();
        };
      }
    } catch (err) {
      console.error("Failed to start workflow:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = async () => {
    startWorkflow();
    // const postParams = {
    //   baseURL: FLASK_URL,
    //   url: `${flaskApi.RunFlow}/20`,
    //   setLoading: () => {},
    //   payload: {},
    //   accessToken: token.access_token,
    // };
    // console.log(postParams);
    // const res = await postData({
    //   baseURL: FLASK_URL,
    //   url: `${flaskApi.RunFlow}/20`,
    //   setLoading: setIsLoading,
    //   payload: {},
    //   accessToken: token.access_token,
    // });

    // const res = await axios.get(`${FLASK_URL}${flaskApi.RunFlowStream}/35`, {
    //   headers: {
    //     Authorization: `Bearer ${token.access_token}`,
    //   },
    // });
    // console.log(token.access_token, "token.access_token");
    // console.log(res, "res....");
    // console.log("res....");
  };

  return (
    <>
      {selectedNode && (
        <div
          className={`mt-1 rounded p-4 max-h-[60vh] overflow-y-auto scrollbar-thin ${
            theme === "dark" ? "bg-[#1e293b] text-white" : "bg-[#f7f7f7]"
          }`}
        >
          <TooltipProvider>
            <div className="flex items-center justify-between">
              <div>Properties</div>
              <div className="flex items-center gap-2">
                {selectedNode?.data?.type === "Start" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {isLoading ? (
                        <l-tailspin
                          size="20"
                          stroke="3"
                          speed="1"
                          color="green"
                        ></l-tailspin>
                      ) : (
                        <Play
                          size={20}
                          className="cursor-pointer"
                          color="green"
                          onClick={handlePlay}
                        />
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Play</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {selectedNode?.data?.type === "Stop" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <StopCircle
                        size={20}
                        className="cursor-pointer"
                        color="red"
                        onClick={() => {}}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Stop</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                <Popover>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <button>
                          <EllipsisVertical size={20} />
                        </button>
                      </PopoverTrigger>
                    </TooltipTrigger>

                    <TooltipContent>
                      <p>More options</p>
                    </TooltipContent>
                  </Tooltip>

                  <PopoverContent className="w-40">
                    <span
                      onClick={() => setIsAddAttribute(true)}
                      className="cursor-pointer"
                    >
                      Add Attribute
                    </span>
                  </PopoverContent>
                </Popover>
              </div>
              <X
                size={20}
                className="cursor-pointer"
                onClick={() => {
                  setNodes((nodes) =>
                    nodes.map((node) => ({ ...node, selected: false })),
                  );
                  setSelectedNode(undefined);
                }}
              />
            </div>
          </TooltipProvider>
          <hr className="my-2" />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <div className="flex flex-col gap-2">
                {displayOrder.map((key) => {
                  if (
                    Object.prototype.hasOwnProperty.call(
                      selectedNode?.data,
                      key,
                    )
                  ) {
                    if (key === "edge_connection_position") {
                      return (
                        <FormField
                          key={key}
                          control={form.control}
                          name={key}
                          render={() => (
                            <FormItem>
                              <FormLabel>Edge Connection Position</FormLabel>
                              <FormControl>
                                <div className="flex flex-row gap-1 justify-center">
                                  {["Top", "Bottom", "Left", "Right"].map(
                                    (item: string, index: number) => (
                                      <div
                                        key={index}
                                        onClick={() => {
                                          if (
                                            selectedNode?.data.type ===
                                              "Start" ||
                                            selectedNode?.data.type === "Stop"
                                          ) {
                                            return;
                                          } else {
                                            handlePositionClick(item);
                                          }
                                        }}
                                        className={`${
                                          edgeConnectionPosition.includes(item)
                                            ? "bg-[#697b97] text-white"
                                            : "bg-[#f7f7f7] text-[#1e293b]"
                                        } border border-[#697b97] px-2 rounded ${
                                          selectedNode?.data.type === "Start" ||
                                          selectedNode?.data.type === "Stop"
                                            ? "cursor-not-allowed"
                                            : "cursor-pointer"
                                        }`}
                                      >
                                        {item}
                                      </div>
                                    ),
                                  )}
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      );
                    }

                    if (key === "label") {
                      return (
                        <FormField
                          key={key}
                          control={form.control}
                          name={key}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{key}</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value ?? ""}
                                  required
                                  placeholder={key}
                                  onBlur={() => {
                                    setSelectedNode((prev) => {
                                      if (prev) {
                                        return {
                                          ...prev,
                                          data: {
                                            ...prev.data,
                                            [key]: field.value,
                                          },
                                        };
                                      }
                                      return prev;
                                    });
                                  }}
                                  className={`${
                                    theme === "dark"
                                      ? "border-white"
                                      : "border-gray-400"
                                  }`}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      );
                    }

                    if (key === "step_function") {
                      return (
                        <FormField
                          key={key}
                          control={form.control}
                          name={key}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Step Function</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    setSelectedNode((prev) => {
                                      if (prev) {
                                        return {
                                          ...prev,
                                          data: {
                                            ...prev.data,
                                            [key]: value,
                                          },
                                        };
                                      }
                                      return prev;
                                    });
                                  }}
                                  value={field.value}
                                >
                                  <SelectTrigger
                                    className={`${
                                      theme === "dark"
                                        ? "border-white"
                                        : "border-gray-400"
                                    }`}
                                  >
                                    <SelectValue placeholder="Select an option" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      {stepFunctionTasks.map((task) => (
                                        <SelectItem
                                          key={task.def_task_id}
                                          value={task.task_name}
                                        >
                                          {task.user_task_name}
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      );
                    }

                    if (key === "attributes") {
                      return selectedNode?.data?.attributes?.map(
                        (attribute: any, index: number) => (
                          <FormField
                            key={index}
                            control={form.control}
                            name={`attributes.${index}.attribute_value`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex justify-between">
                                  <span>{attribute.attribute_name}</span>
                                  <X
                                    size={15}
                                    className="cursor-pointer"
                                    onClick={() =>
                                      handleRemoveAttribute(attribute.id)
                                    }
                                  />
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    value={
                                      field.value ?? attribute.attribute_value
                                    }
                                    required
                                    placeholder="Enter value"
                                    onBlur={() => {
                                      setSelectedNode(
                                        (prev: ShapeNode | undefined) => {
                                          if (prev) {
                                            const updatedAttributes = [
                                              ...prev.data.attributes,
                                            ];
                                            updatedAttributes[index] = {
                                              ...updatedAttributes[index],
                                              attribute_value: field.value,
                                            };
                                            return {
                                              ...prev,
                                              data: {
                                                ...prev.data,
                                                attributes: updatedAttributes,
                                              },
                                            };
                                          }
                                          return prev;
                                        },
                                      );
                                    }}
                                    className={`${
                                      theme === "dark"
                                        ? "border-white"
                                        : "border-gray-400"
                                    }`}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        ),
                      );
                    }
                  }
                })}
              </div>
              <hr className="my-2" />
              <div className="flex justify-between gap-1">
                <button
                  type="submit"
                  className="cursor-pointer p-1 flex justify-center rounded border border-green-500"
                >
                  <h3>Save</h3>
                </button>
                <span
                  onClick={handleDelete}
                  className="cursor-pointer p-1 flex justify-center rounded border border-red-500"
                >
                  <h3>Delete Node</h3>
                </span>
              </div>
            </form>
          </Form>
        </div>
      )}
    </>
  );
};

export default EditNode;
