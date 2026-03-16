import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { Dispatch, FC, SetStateAction, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ShapeNode } from "../../shape/types";
import { Checkbox } from "@/components/ui/checkbox";
import { IdecisionEdgeData } from "@/types/interfaces/orchestration.interface";
import Spinner from "@/components/Spinner/Spinner";

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
}

const EditEdge: FC<EditNodeProps> = ({
  theme,
  nodes,
  setNodes,
  setEdges,
  selectedEdge,
  setSelectedEdge,
  decisionEdgeData,
  isLoading,
}) => {
  const FormSchema = z.object({
    label: z.string().optional(),
    data: z.object({
      field: z.string().optional(),
      operator: z.string().optional(),
      value: z.string().optional(),
      is_default: z.boolean().optional(),
    }),
    animated: z.string().optional(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      label: selectedEdge.label ?? "",
      data: {
        field: selectedEdge.data?.field ?? "",
        operator: selectedEdge.data?.operator ?? "",
        value: selectedEdge.data?.value ?? "",
        is_default: selectedEdge.data?.is_default ?? false,
      },
      animated: String(selectedEdge.animated) ?? "false",
    },
  });

  useEffect(() => {
    if (selectedEdge) {
      form.reset({
        label: selectedEdge.label ?? "",
        data: {
          field: selectedEdge.data?.field ?? "",
          operator: selectedEdge.data?.operator ?? "",
          value: selectedEdge.data?.value ?? "",
          is_default: selectedEdge.data?.is_default ?? false,
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
                field: data.data.field,
                operator: data.data.operator,
                value: data.data.value,
                is_default: data.data.is_default,
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
                        </FormItem>
                      )}
                    />
                    {isDiamond && (
                      <>
                        <FormField
                          control={form.control}
                          name="data.field"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Field</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    // handleGetParameters(value);
                                  }}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger
                                    disabled={form.getValues("data.is_default")}
                                  >
                                    <SelectValue placeholder="Select a Field" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-60">
                                    {decisionEdgeData?.fields?.length > 0 ? (
                                      decisionEdgeData?.fields?.map((item) => (
                                        <SelectItem
                                          key={item.value}
                                          value={item.value}
                                        >
                                          {item.label} ({item.NodeSourceLabel})
                                        </SelectItem>
                                      ))
                                    ) : (
                                      <span className="text-gray-500 text-sm">
                                        No Fields Found
                                      </span>
                                    )}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="data.operator"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Operator</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    // handleGetParameters(value);
                                  }}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger
                                    disabled={form.getValues("data.is_default")}
                                  >
                                    <SelectValue placeholder="Select a Operator" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-60">
                                    {decisionEdgeData?.operators?.length > 0 ? (
                                      decisionEdgeData?.operators?.map(
                                        (item) => (
                                          <SelectItem
                                            key={item.value}
                                            value={item.value}
                                          >
                                            {item.label}
                                          </SelectItem>
                                        ),
                                      )
                                    ) : (
                                      <span className="text-gray-500 text-sm">
                                        No Operators Found
                                      </span>
                                    )}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="data.value"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Value</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Value"
                                  disabled={form.getValues("data.is_default")}
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
                    {isDiamond && (
                      <FormField
                        control={form.control}
                        name="data.is_default"
                        render={({ field }) => (
                          <span className="flex gap-2">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) =>
                                field.onChange(checked)
                              }
                            />
                            <FormLabel>Default</FormLabel>
                          </span>
                        )}
                      />
                    )}
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
