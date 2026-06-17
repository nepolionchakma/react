import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edge } from "@xyflow/react";
import { X } from "lucide-react";
import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ShapeNode } from "../../shape/types";
import { IdecisionEdgeData } from "@/types/interfaces/orchestration.interface";
import Spinner from "@/components/Spinner/Spinner";
import { FLASK_URL } from "@/Api/Api";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { loadData } from "@/Utility/funtion";

interface LookupValue {
  value_code: string;
  value_label: string;
  sort_order: number;
}

interface EditNodeProps {
  theme: string;
  nodes: ShapeNode[];
  setNodes: (
    payload: ShapeNode[] | ((nodes: ShapeNode[]) => ShapeNode[]),
  ) => void;
  setEdges: (payload: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  selectedEdge: any;
  setSelectedEdge: Dispatch<SetStateAction<Edge | undefined>>;
  decisionEdgeData: IdecisionEdgeData;
  isLoading: boolean;
  setIsEdgeDataLoading: React.Dispatch<React.SetStateAction<boolean>>;
  edges: Edge[];
}

const EditEdge: FC<EditNodeProps> = ({
  theme,
  nodes,
  setNodes,
  setEdges,
  selectedEdge,
  setSelectedEdge,
  isLoading,
  setIsEdgeDataLoading,
  edges,
}) => {
  const { token } = useGlobalContext();
  const [lookupValues, setLookupValues] = useState<LookupValue[]>([]);

  const sourceEdges = useMemo(() => {
    return edges.filter((item) => item.source === selectedEdge.source);
  }, [edges, selectedEdge.source]);

  console.log(sourceEdges, "sourceEdges");

  console.log(lookupValues, "lookupValues");

  const FormSchema = z.object({
    label: z.string().optional(),
    data: z.object({
      lookup_value: z.string().optional(),
    }),
    animated: z.string().optional(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      label: selectedEdge.label ?? "",
      data: {
        lookup_value: selectedEdge.data?.lookup_value ?? "",
      },
      animated: String(selectedEdge.animated) ?? "false",
    },
  });

  console.log("lookup_value:", form.watch("data.lookup_value"));

  useEffect(() => {
    const fetchLookup = async () => {
      if (selectedEdge) {
        const node = selectedEdge.source;

        const stepFuntion = nodes.find((item) => item.id === node)?.data
          .step_function;

        const params = {
          baseURL: FLASK_URL,
          url: `/def_async_tasks/sf_lookup_values/${stepFuntion}`,
          setLoading: setIsEdgeDataLoading,
          accessToken: token.access_token,
          // isToast?: boolean;
        };

        const res = await loadData(params);

        if (res) {
          setLookupValues(res.values);
        }
      }
    };

    fetchLookup();
  }, [nodes, selectedEdge, setIsEdgeDataLoading, token.access_token]);

  useEffect(() => {
    if (selectedEdge) {
      console.log("selectedEdge changed");
      form.reset({
        label: selectedEdge.label ?? "",
        data: {
          lookup_value: selectedEdge.data?.lookup_value ?? "",
        },
        animated: selectedEdge.animated ?? "false",
      });
    }
  }, [selectedEdge, form]);

  // check is node data type diamond
  const isDiamond =
    nodes.find((node) => node.id === selectedEdge.source)?.data?.type ===
    "diamond";

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (selectedEdge) {
      setEdges((prevNodes: Edge[]) =>
        prevNodes.map((edge: Edge) => {
          if (edge.id === selectedEdge.id) {
            return {
              ...edge,
              label: data.label,
              data: {
                ...edge.data,
                lookup_value: data.data.lookup_value,
              },
              animated: data.animated === "true" ? true : false,
            };
          }
          return edge;
        }),
      );
      setSelectedEdge(undefined);
    }
  };

  const handleDelete = useCallback(() => {
    if (selectedEdge) {
      setEdges((prevEdges: Edge[]) =>
        prevEdges.filter((edge: Edge) => edge.id !== selectedEdge.id),
      );
      setSelectedEdge(undefined);
      setNodes((prevNodes: ShapeNode[]) =>
        prevNodes.map((node) => {
          if (node.data.edges.includes(selectedEdge.id)) {
            return {
              ...node,
              data: {
                ...node.data,
                edges: node.data.edges.filter((edg) => edg !== selectedEdge.id),
              },
            };
          }
          return node;
        }),
      );
    }
  }, []);
  return (
    <>
      {/* Loading process... */}
      {isLoading && (
        <div className="absolute left-[50%] top-[45%] z-50 translate-x-[-50%]">
          <Spinner color="red" size="40" />
        </div>
      )}
      {selectedEdge && (
        <div
          className={`mt-1 rounded p-4 max-h-[60vh] overflow-y-auto scrollbar-thin ${
            theme === "dark" ? "bg-[#1e293b] text-white" : "bg-[#f7f7f7]"
          }`}
        >
          {selectedEdge && (
            <div>
              <div className="flex items-center justify-between">
                <h3>Properties</h3>
                <X
                  size={20}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedEdge(undefined);
                  }}
                />
              </div>
              <hr className="my-2" />
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-2"
                >
                  <div className="flex flex-col gap-2">
                    <FormField
                      control={form.control}
                      name="label"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Label</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Label"
                              className={`${
                                theme === "dark"
                                  ? "border-white"
                                  : "border-gray-400"
                              }`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {isDiamond && (
                      <>
                        <FormField
                          control={form.control}
                          name="data.lookup_value"
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormLabel>Values</FormLabel>
                              <SelectTrigger
                                className={`${
                                  theme === "dark"
                                    ? "border-white"
                                    : "border-gray-400"
                                }`}
                              >
                                <SelectValue placeholder="Values" />
                              </SelectTrigger>
                              <SelectContent>
                                {lookupValues.map((v) => (
                                  <SelectItem
                                    disabled={sourceEdges.some(
                                      (edge) =>
                                        edge?.data?.lookup_value ===
                                        v.value_code,
                                    )}
                                    key={v.value_code}
                                    value={v.value_code}
                                  >
                                    {v.value_label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </>
                    )}
                    <FormField
                      control={form.control}
                      name="animated"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormLabel>Animation</FormLabel>
                          <SelectTrigger
                            className={`${
                              theme === "dark"
                                ? "border-white"
                                : "border-gray-400"
                            }`}
                          >
                            <SelectValue placeholder="Animated" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between gap-1">
                    <button
                      type="submit"
                      className="cursor-pointer  p-1 flex justify-center rounded border border-green-500"
                    >
                      <h3>Save</h3>
                    </button>
                    <span
                      onClick={handleDelete}
                      className="cursor-pointer p-1 flex justify-center rounded border border-red-500"
                    >
                      <h3>Delete Edge</h3>
                    </span>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default EditEdge;
