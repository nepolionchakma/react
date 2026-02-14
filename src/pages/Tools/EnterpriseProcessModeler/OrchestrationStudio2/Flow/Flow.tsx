import {
  DragEvent,
  DragEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ReactFlow,
  Background,
  ConnectionLineType,
  MarkerType,
  ConnectionMode,
  Panel,
  NodeTypes,
  DefaultEdgeOptions,
  Controls,
  useReactFlow,
  MiniMap,
  useNodesState,
  useEdgesState,
  Edge,
  Connection,
  addEdge,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import ShapeNodeComponent from "./shape-node";
import Sidebar from "./sidebar";
import MiniMapNode from "./minimap-node";
import { ShapeNode, ShapeType } from "./shape/types";
import "./ProFlow.css";
import FlowItems from "./components/FlowItems/FlowItems";
import { IOrchestrationDataTypes2 } from "@/types/interfaces/orchestration.interface";
import AnimatedSVGEdge from "./EdgeTypes/AnimatedSVGEdge";
import { Pen, Plus, Save, SquareMenu, Trash } from "lucide-react";
import CreateAFlow from "./components/CreateAFlow/CreateAFlow";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import axios, { AxiosError } from "axios";
import Spinner from "@/components/Spinner/Spinner";
import { toast } from "@/components/ui/use-toast";
import EditNode from "./components/EditNode/EditNode";
import EditEdge from "./components/EditEdge/EditEdge";
import AddAttribute from "./components/AddAttribute/AddAttribute";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { loadData } from "@/Utility/funtion";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import RequiredAttributes from "./components/RequiredAttributes/RequiredAttributes";
import { useForm } from "react-hook-form";
// import Alert from "@/components/Alert/Alert";

export interface IRequiredAttributes {
  name: string;
  required: boolean;
  source_label: string;
  source_task: string;
  type: string;
  value: string;
}

const nodeTypes: NodeTypes = {
  shape: ShapeNodeComponent,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  type: "smoothstep",
  markerEnd: { type: MarkerType.ArrowClosed },
  style: { strokeWidth: 2 },
};

const proOptions = { account: "paid-pro", hideAttribution: true };

export type ExampleProps = {
  theme?: "dark" | "light";
  snapToGrid?: boolean;
  panOnScroll?: boolean;
  zoomOnDoubleClick?: boolean;
};

const ShapesProExampleApp = ({
  theme = "light",
  snapToGrid = true,
  panOnScroll = true,
  zoomOnDoubleClick = false,
}: ExampleProps) => {
  const api = useAxiosPrivate();
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();
  const { token, setEdgeConnectionPosition } = useGlobalContext();
  const [nodes, setNodes, onNodesChange] = useNodesState<ShapeNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedFlowData, setSelectedFlowData] =
    useState<IOrchestrationDataTypes2>();
  const [selectedNode, setSelectedNode] = useState<ShapeNode | undefined>(
    undefined,
  );
  const [selectedEdge, setSelectedEdge] = useState<Edge | undefined>(undefined);

  const [isAddAttribute, setIsAddAttribute] = useState(false);
  const [newProcessName, setNewProcessName] = useState("");
  const [toolsOpen, setToolsOpen] = useState(false);
  const [createNewFlow, setCreateNewFlow] = useState(false);
  const [isEditFlowName, setIsEditFlowName] = useState(false);
  const [selectedFlowName, setSelectedFlowName] = useState<string>("");
  const [isNewFlowCreated, setIsNewFlowCreated] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [flowsData, setFlowsData] = useState<IOrchestrationDataTypes2[]>([]);
  const [attributeName, setAttributeName] = useState("");
  const [processExecutionId, setProcessExecutionId] = useState<string>("");
  const [requiredAttributes, setRequiredAttributes] = useState<
    IRequiredAttributes[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const resFlows = await api.get("/orchestration-studio-process");

        setFlowsData(resFlows.data);
      } catch (error) {
        if (error instanceof AxiosError && error.response) {
          console.log(error.response.data);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isNewFlowCreated, selectedFlowName]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (selectedFlowName !== "") {
          setIsLoading(true);
          const res = await api.get(
            `/orchestration-studio-process/${selectedFlowName}`,
          );
          setSelectedFlowData(res.data);
          setEdges(res.data.process_structure.edges);
          setNodes(res.data.process_structure.nodes);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedFlowName]);

  useEffect(() => {
    setToolsOpen(false);
  }, [!selectedFlowData]);

  const edgeTypes = {
    animatedEdge: AnimatedSVGEdge,
  };

  const onConnect = useCallback((params: Connection) => {
    const edge: Edge = {
      ...params,
      id: `edge-${params.source}-${params.target}`,
      type: "animatedEdge",
      animated: false,
    };
    setEdges((eds) => addEdge(edge, eds));
    setNodes((nds) => {
      return nds.map((node) => {
        if (node.id === params.source) {
          return {
            ...node,
            data: {
              ...node.data,
              edges: [...node.data.edges, edge.id],
            },
          };
        } else if (node.id === params.target) {
          return {
            ...node,
            data: {
              ...node.data,
              edges: [...node.data.edges, edge.id],
            },
          };
        }
        return node;
      });
    });
  }, []);

  const onDragOver = (evt: DragEvent<HTMLDivElement>) => {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = "move";
  };

  // this function is called when a node from the sidebar is dropped onto the react flow pane
  const onDrop: DragEventHandler = (evt: DragEvent<HTMLDivElement>) => {
    evt.preventDefault();
    const type = evt.dataTransfer.getData("application/reactflow") as ShapeType;
    const colorType = () => {
      switch (type) {
        case "Start":
          return "#549C30";
        case "round-rectangle":
          return "#3F8AE2";
        case "rectangle":
          return "#3F8AE2";
        case "hexagon":
          return "#3F8AE2";
        case "diamond":
          return "#3F8AE2";
        case "parallelogram":
          return "#3F8AE2";
        case "Stop":
          return "#FF0000";
        default:
          return "#3F8AE2";
      }
    };
    // this will convert the pixel position of the node to the react flow coordinate system
    // so that a node is added at the correct position even when viewport is translated and/or zoomed in
    const position = screenToFlowPosition({ x: evt.clientX, y: evt.clientY });
    const dynamicTypeName = (type: string) => {
      switch (type) {
        case "Start":
          return "Start";
        case "round-rectangle":
          return "Automated Task";
        case "rectangle":
          return "Manual Task";
        case "hexagon":
          return "Approval";
        case "diamond":
          return "Decision";
        case "parallelogram":
          return "Script";
        case "Stop":
          return "Stop";
        default:
          return type;
      }
    };
    const newNode: ShapeNode = {
      // id: Date.now().toString(),
      id: `node-${Math.random().toString(36).substr(2, 9)}`,
      type: "shape",
      position,
      style: { width: 100, height: 100 },
      data: {
        label: dynamicTypeName(type),
        step_function: "",
        attributes: [],
        type,
        color: colorType(),
        edge_connection_position:
          type === "Start"
            ? ["Bottom"]
            : type === "Stop"
              ? ["Top"]
              : ["Top", "Bottom", "Left", "Right"],
        edges: [],
        status: {
          status: "",
          result: "",
        },
      },
      selected: true,
    };
    setEdgeConnectionPosition(
      type === "Start"
        ? ["Bottom"]
        : type === "Stop"
          ? ["Top"]
          : ["Top", "Bottom", "Left", "Right"],
    );
    setSelectedNode(newNode);
    setNodes((nodes) =>
      (nodes.map((n) => ({ ...n, selected: false })) as ShapeNode[]).concat([
        newNode,
      ]),
    );
    setSelectedEdge(undefined);
  };

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: ShapeNode) => {
      console.log(event, "Node event");
      setSelectedEdge(undefined);
      setSelectedNode({ ...node, selected: true });
      setEdgeConnectionPosition(node.data.edge_connection_position);
    },
    [],
  );

  const onEdgeClick = (event: React.MouseEvent, edge: Edge) => {
    console.log(event, "Edge event");
    setSelectedNode(undefined);
    setSelectedEdge(edge);
  };
  const onPaneClick = useCallback(() => {
    setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        selected: false,
      })),
    );
    setSelectedNode(undefined);
    setSelectedEdge(undefined);
  }, [setNodes]);

  const closeAllProgress = () => {
    setEdges([]);
    setNodes([]);
    setSelectedNode(undefined);
    setSelectedEdge(undefined);
    setNewProcessName("");
    setIsNewFlowCreated(Math.random() * 9999);
  };
  const handleCloseAfterSelectAFlow = () => {
    setNewProcessName("");
    setCreateNewFlow(false);
    setSelectedEdge(undefined);
    setSelectedNode(undefined);
  };
  const handleToolsOpen = () => {
    if (selectedFlowData) {
      setToolsOpen(!toolsOpen);
    } else {
      toast({
        title: "Info!!",
        description: "Please create a flow first or select a flow.",
      });
      return;
    }
  };
  const handleAddAttribute = () => {
    if (selectedNode && attributeName.trim() !== "") {
      setSelectedNode((prevNode: ShapeNode | undefined) =>
        prevNode
          ? {
              ...prevNode,
              data: {
                ...prevNode.data,
                attributes: [
                  ...(prevNode.data.attributes || []),
                  {
                    id: Date.now(),
                    attribute_name: attributeName,
                    attribute_value: "",
                  },
                ],
              },
            }
          : prevNode,
      );
    }
    setAttributeName("");
  };

  const handleDeleteFlow = async () => {
    try {
      const res = await api.delete(
        `/orchestration-studio-process/${selectedFlowData?.process_id}`,
      );
      if (res) {
        closeAllProgress();
        setSelectedFlowData(undefined);

        toast({
          title: "Success",
          description: "Flow deleted successfully.",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSave = async (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    e.stopPropagation();
    // const id = Math.floor(Math.random() * 1000);
    if (edges?.length > 0 && nodes?.length > 0) {
      const putData = {
        process_structure: {
          nodes: nodes.map((node) => ({
            ...node,
            data: {
              ...node.data,
              status: {
                result: "",
                status: "",
              },
            },
          })),
          edges,
        },
      };

      try {
        if (selectedFlowData) {
          const res = await api.put(
            `/orchestration-studio-process/${selectedFlowData.process_id}`,
            JSON.stringify(putData),
          );

          if (res) {
            toast({
              title: "Success",
              description: `Flow saved successfully.`,
            });
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const [isConnectionCompleted, setIsConnectionCompleted] = useState(false);
  useEffect(() => {
    const checkIfAllNodesConnected = () => {
      const result = nodes.every((node) => {
        const expected = node.data.edge_connection_position?.length || 0;

        // Count how many edges are connected to this node
        const connectedEdges = edges.filter(
          (edge) => edge.source === node.id || edge.target === node.id,
        ).length;

        return connectedEdges >= expected;
      });

      setIsConnectionCompleted(result);
    };

    checkIfAllNodesConnected();
  }, [nodes, edges]);

  const { fitView } = useReactFlow();
  useEffect(() => {
    if (nodes.length === 0) return;

    fitView({
      padding: 0.2,
      maxZoom: 1.4,
      duration: 300,
    });
  }, [fitView, nodes]);

  useEffect(() => {
    (async () => {
      if (!processExecutionId || !selectedNode?.id) return;

      try {
        const loadNodeRes = await loadData({
          baseURL: FLASK_URL,
          url: `${flaskApi.NodeStatusCheck}?def_process_execution_id=${processExecutionId}&node_id=${selectedNode?.id}`,
          accessToken: token.access_token,
        });

        // Update the node with the status information
        if (loadNodeRes && loadNodeRes.result) {
          setNodes((nds) =>
            nds.map((node) => {
              if (node.id === selectedNode.id) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    status: {
                      result: loadNodeRes.result?.result ?? "",
                      status: loadNodeRes.result?.status ?? "",
                    },
                  },
                };
              }
              return node;
            }),
          );

          // Also update the selectedNode reference
          setSelectedNode((prev) =>
            prev
              ? {
                  ...prev,
                  data: {
                    ...prev.data,
                    status: {
                      result: loadNodeRes.result?.result ?? "",
                      status: loadNodeRes.result?.status ?? "",
                    },
                  },
                }
              : prev,
          );
        }
      } catch (error) {
        console.error("Error loading node status:", error);
      }
    })();
  }, [processExecutionId, selectedNode?.id, token.access_token, setNodes]);

  interface IFormValues {
    [key: string]: string | number;
  }
  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {} as IFormValues,
  });

  const onSubmit = async (data: IFormValues) => {
    console.log({ context: data }, "required attributes data");
    try {
      const response = await axios.post(
        `${FLASK_URL}/workflow/run/${selectedFlowData?.process_id}?access_token=${token.access_token}`,
        { context: data },
      );

      if (response.status === 202) {
        setRequiredAttributes([]);
      }
      // const res = await postData({
      //   baseURL: FLASK_URL,
      //   url: `${FLASK_URL}/workflow/run/${selectedFlowData?.process_id}?access_token=${token.access_token}`,
      //   setLoading: setIsLoading,
      //   payload: { context: data },
      //   accessToken: token.access_token,
      // });
      // console.log(res, "res");
      const executionId = response.data.def_process_execution_id;
      setProcessExecutionId(executionId);
    } catch (error) {
      console.log(error, "error");
    }
    // reset();
  };

  useEffect(() => {
    const eventSource = new EventSource(
      `${FLASK_URL}/workflow/execution_stream/${processExecutionId}?access_token=${token.access_token}`,
    );

    // 1. Connection opened
    // eventSource.onopen = () => {
    //   console.log("SSE connection opened");
    // };

    // 2. Listen specifically for 'heartbeat' events
    eventSource.addEventListener("heartbeat", (event) => {
      const data = JSON.parse(event.data);
      console.log("💓 Heartbeat received:", data);

      // You can update state here if needed
      // setStatus(data.status);
    });

    // eventSource.onmessage = (event) => {
    //   const payload = JSON.parse(event.data);

    //   console.log("Workflow Update:", event);

    //   if (payload.type === "step") {
    //     // handle step update
    //   }
    // };

    eventSource.addEventListener("step", (event) => {
      const step = JSON.parse(event.data);

      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === step.node_id) {
            return {
              ...node,
              data: {
                ...node.data,
                status: {
                  result: step.result || "",
                  status: step.status || "",
                },
              },
            };
          }
          return node;
        }),
      );
      // if (step.status === "RUNNING") {
      //   console.log("Currently executing:", step.node_label);
      // }
    });

    eventSource.addEventListener("complete", (event) => {
      console.log("Workflow finished successfully!");
      const parseEvent = JSON.parse(event.data);
      toast({
        title: parseEvent.execution_status,
        description: `
                Process Execution ID: ${parseEvent.def_process_execution_id},
                Process ID: ${parseEvent.def_process_execution_id}`,
        variant:
          parseEvent.execution_status.toLowerCase() === "failed"
            ? "destructive"
            : "default",
      });
      eventSource.close();
    });

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      eventSource.close();
    };
    eventSource.addEventListener("error", (event) => {
      console.log(event, "event...............");
    });

    // Cleanup on unmount
    // return () => {
    //   eventSource.close();
    //   console.log("SSE connection closed");
    // };
  }, [processExecutionId, setNodes, token.access_token]);

  return (
    <div className="dndflow h-[calc(100vh-6rem)]">
      <div className="reactflow-wrapper" ref={reactFlowWrapper}>
        <ReactFlow
          colorMode={theme}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          proOptions={proOptions}
          // defaultNodes={defaultNodes}
          // defaultEdges={defaultEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          defaultEdgeOptions={defaultEdgeOptions}
          // fitView
          onDrop={onDrop}
          onDragOver={onDragOver}
          snapGrid={[10, 10]}
          snapToGrid={snapToGrid}
          panOnScroll={panOnScroll}
          connectionMode={ConnectionMode.Loose}
          connectionLineType={ConnectionLineType.SmoothStep}
          zoomOnDoubleClick={zoomOnDoubleClick}
          className="v2"
        >
          <>
            {/* Loading process... */}
            {isLoading && (
              <div className="absolute left-[50%] top-[45%] z-50 translate-x-[-50%]">
                <Spinner color="red" size="40" />
              </div>
            )}
            {/* Action tools */}
            <div className="absolute top-[13px] left-[20px] z-50 flex gap-1 items-center ">
              <div
                className={`flex gap-1 items-center ${
                  theme === "dark" ? "text-white" : "text-black"
                }`}
              >
                {/* Tools */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        onClick={handleToolsOpen}
                        className={`cursor-pointer p-1 border rounded-full ${
                          theme === "dark"
                            ? "bg-[#1e293b] hover:bg-[#415069] border-[#1e293b]"
                            : "bg-[#abafb5] hover:bg-slate-400 border-[#abafb5]"
                        }`}
                      >
                        <SquareMenu size={15} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Tools</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {/* Add New Flow */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`cursor-pointer p-1 border rounded-full ${
                          theme === "dark"
                            ? "bg-[#1e293b] hover:bg-[#415069] border-[#1e293b]"
                            : "bg-[#abafb5] hover:bg-slate-400 border-[#abafb5]"
                        }`}
                      >
                        <Plus
                          size={15}
                          onClick={() => setCreateNewFlow(!createNewFlow)}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Create New Flow</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {/* Pen Icon */}
                {selectedFlowData && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => {
                            setIsEditFlowName(true);
                            setNewProcessName(
                              selectedFlowData?.process_name ?? "",
                            );
                          }}
                          className={`cursor-pointer p-1 border rounded-full ${
                            theme === "dark"
                              ? "bg-[#1e293b] hover:bg-[#415069] border-[#1e293b]"
                              : "bg-[#abafb5] hover:bg-slate-400 border-[#abafb5]"
                          }`}
                        >
                          <Pen size={15} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit selected Flow</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {/* Trash Flow */}
                {selectedFlowData && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`cursor-pointer p-1 border rounded-full ${
                            theme === "dark"
                              ? "bg-[#1e293b] hover:bg-[#415069] border-[#1e293b]"
                              : "bg-[#abafb5] hover:bg-slate-400 border-[#abafb5]"
                          }`}
                        >
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Trash size={15} />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure delete flow?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete your account and remove
                                  your data from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteFlow}>
                                  Continue
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete selected Flow</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {/* Save Icon */}
                {nodes.length > 0 &&
                  edges.length > 0 &&
                  isConnectionCompleted && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            onClick={handleSave}
                            className={`cursor-pointer p-1 border rounded-full ${
                              theme === "dark"
                                ? "bg-[#1e293b] hover:bg-[#415069] border-[#1e293b]"
                                : "bg-[#abafb5] hover:bg-slate-400 border-[#abafb5]"
                            }`}
                          >
                            <Save size={15} />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Save Flow</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
              </div>
            </div>
            {/* Select Flow */}
            <div className="absolute top-[2px] left-[160px] z-50 flex gap-1 items-center ">
              <FlowItems
                theme={theme}
                flowsData={flowsData}
                setNodes={setNodes}
                setEdges={setEdges}
                selectedFlowData={selectedFlowData}
                setSelectedFlowData={setSelectedFlowData}
                setSelectedFlowName={setSelectedFlowName}
                handleCloseAfterSelectAFlow={handleCloseAfterSelectAFlow}
              />
            </div>
            {/* Add Attribute  */}
            {isAddAttribute && (
              <AddAttribute
                attributeName={attributeName}
                setAttributeName={setAttributeName}
                handleAddAttribute={handleAddAttribute}
                setIsAddAttribute={setIsAddAttribute}
              />
            )}
            {requiredAttributes.length > 0 && (
              <RequiredAttributes
                setValue={setValue}
                control={control}
                requiredAttributes={requiredAttributes}
                setRequiredAttributes={setRequiredAttributes}
                handleSetAttributesAndRunFlow={handleSubmit(onSubmit)}
              />
            )}
            {/* Create or Edit Flow */}
            {(createNewFlow || isEditFlowName) && (
              <CreateAFlow
                actionType={`${createNewFlow ? "CreateAFlow" : "EditFlowName"}`}
                flowsData={flowsData}
                selectedFlowData={selectedFlowData}
                newProcessName={newProcessName}
                setNewProcessName={setNewProcessName}
                setCreateNewFlow={setCreateNewFlow}
                setSelectedFlowData={setSelectedFlowData}
                setSelectedFlowName={setSelectedFlowName}
                setIsEditFlowName={setIsEditFlowName}
                closeAllProgress={closeAllProgress}
              />
            )}
            {/* Right Edit Bar */}
            <div
              className={`absolute top-[35px] right-0 z-50 p-2 flex flex-col gap-1`}
            >
              {/* Edit node */}
              {selectedNode && (
                <>
                  <EditNode
                    theme={theme}
                    nodes={nodes}
                    setNodes={setNodes}
                    edges={edges}
                    setEdges={setEdges}
                    selectedNode={selectedNode}
                    setSelectedNode={setSelectedNode}
                    setIsAddAttribute={setIsAddAttribute}
                    processExecutionId={processExecutionId}
                    setProcessExecutionId={setProcessExecutionId}
                    workFlowId={selectedFlowData?.process_id}
                    setRequiredAttributes={setRequiredAttributes}
                  />
                </>
              )}
              {/* Edit edge */}
              {selectedEdge && (
                <>
                  <EditEdge
                    theme={theme}
                    setNodes={setNodes}
                    setEdges={setEdges}
                    selectedEdge={selectedEdge}
                    setSelectedEdge={setSelectedEdge}
                  />
                </>
              )}
            </div>
          </>

          <Background />
          {toolsOpen && (
            <div className="absolute top-8">
              <Panel position="top-left">
                <Sidebar />
              </Panel>
            </div>
          )}

          <Controls style={{ bottom: 155 }} orientation="horizontal" />
          <MiniMap
            zoomable
            draggable
            nodeComponent={MiniMapNode}
            position="bottom-left"
          />
        </ReactFlow>
      </div>
    </div>
  );
};

export default ShapesProExampleApp;
