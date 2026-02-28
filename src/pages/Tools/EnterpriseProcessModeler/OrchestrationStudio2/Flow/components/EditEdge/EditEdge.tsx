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

interface EditNodeProps {
  theme: string;
  nodes: ShapeNode[];
  setNodes: (
    payload: ShapeNode[] | ((nodes: ShapeNode[]) => ShapeNode[]),
  ) => void;
  setEdges: (payload: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  selectedEdge: any;
  setSelectedEdge: Dispatch<SetStateAction<Edge | undefined>>;
}
const EditEdge: FC<EditNodeProps> = ({
  theme,
  nodes,
  setNodes,
  setEdges,
  selectedEdge,
  setSelectedEdge,
}) => {
  const FormSchema = z.object({
    label: z.string().optional(),
    data: z.object({
      field: z.string().optional(),
      operator: z.string().optional(),
      value: z.string().optional(),
      default: z.boolean().optional(),
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
        default: selectedEdge.data?.default ?? false,
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
          default: selectedEdge.data?.default ?? false,
        },
        animated: selectedEdge.animated ?? "false",
      });
    }
  }, [selectedEdge, form]);

  // useEffect(() => {
  // }, [nodes]);
  console.log(nodes, "nodes....");
  // check is node data type diamond
  const isDiamond =
    nodes.find((node) => node.id === selectedEdge.source)?.data?.type ===
    "diamond";
  console.log(isDiamond, "isDiamond....");

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
                default: data.data.default,
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
                                <Input
                                  {...field}
                                  placeholder="Field"
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
                        <FormField
                          control={form.control}
                          name="data.operator"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Operator</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Operator"
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
                        name="data.default"
                        render={({ field }) => (
                          <span className="flex gap-2">
                            <Checkbox
                              checked={field.value === true ? true : false}
                              onCheckedChange={(checked) =>
                                field.onChange(checked ? true : false)
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
