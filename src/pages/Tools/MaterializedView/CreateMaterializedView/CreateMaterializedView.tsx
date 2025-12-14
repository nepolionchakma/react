import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Control } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { useState } from "react";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { postData } from "@/Utility/funtion";
import Spinner from "@/components/Spinner/Spinner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  setTabName: React.Dispatch<React.SetStateAction<string>>;
}
const JoinConditions = ({
  control,
  joinIndex,
}: {
  control: Control<any>;
  joinIndex: number;
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `joins.${joinIndex}.conditions`,
  });

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <FormLabel className="uppercase">On Conditions</FormLabel>
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ left: "", op: "=", right: "" })}
        >
          + Add Condition
        </Button>
      </div>
      {fields.map((condition, condIndex) => (
        <div key={condition.id} className="grid grid-cols-10 gap-2">
          <FormField
            control={control}
            name={`joins.${joinIndex}.conditions.${condIndex}.left`}
            render={({ field }) => (
              <FormItem className="col-span-4">
                <FormLabel>Left Column</FormLabel>
                <FormControl>
                  <Input placeholder="left column" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`joins.${joinIndex}.conditions.${condIndex}.op`}
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Operator</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                    value={field.value}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Operators</SelectLabel>
                        <SelectItem value="=">=</SelectItem>
                        <SelectItem value="!=">!=</SelectItem>
                        <SelectItem value=">">{">"}</SelectItem>
                        <SelectItem value="<">{"<"}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`joins.${joinIndex}.conditions.${condIndex}.right`}
            render={({ field }) => (
              <FormItem className="col-span-3">
                <FormLabel>Right Column</FormLabel>
                <FormControl>
                  <Input placeholder="right column" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="button"
            variant="ghost"
            onClick={() => remove(condIndex)}
          >
            ✕
          </Button>
        </div>
      ))}
    </div>
  );
};
const FunctionArgs = ({
  control,
  name,
}: {
  control: Control<any>;
  name: string;
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: name,
  });

  return (
    <div className="space-y-2 flex flex-col gap-1">
      <div className="flex w-full justify-between items-center">
        <FormLabel>Arguments (optional)</FormLabel>
        <Button
          type="button"
          variant="outline"
          className="h-5"
          onClick={() => append("")}
        >
          + Add Function Argument
        </Button>
      </div>
      <div className="flex gap-2 mt-2">
        {fields.map((condition, condIndex) => (
          <div key={condition.id} className="flex items-center">
            <FormField
              control={control}
              //name={`select.${index}.function.args`}
              name={`${name}.${condIndex}`}
              render={({ field }) => (
                <FormItem className="col-span-4">
                  {/* <FormLabel>Argument {condIndex + 1}</FormLabel> */}
                  <FormControl>
                    <Input placeholder="argument" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => remove(condIndex)}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

const CreateMaterializedView = ({ setTabName }: Props) => {
  const { token } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);

  /** select item */
  const SelectItemSchema = z.object({
    column: z.string().optional(),
    alias: z.string().optional(),
    aggregate: z.enum(["COUNT", "SUM", "AVG", "MIN", "MAX"]).optional(),
    function: z
      .object({
        name: z.string().optional(),
        args: z.array(z.string()).optional(),
      })
      .optional(),
    distinct: z.boolean().optional(),
  });

  /** FROM clause */
  const FromSchema = z.object({
    schema: z.string().min(1, "Schema is required"),
    table: z.string().min(1, "Table is required"),
    alias: z.string().optional(),
  });

  /** GROUP BY item */
  const GroupBySchema = z.object({
    column: z.string().optional(),
    function: z
      .object({
        name: z.string().optional(),
        args: z.array(z.string()).optional(),
      })
      .optional(),
  });

  const JoinConditionSchema = z.object({
    left: z.string(),
    op: z.string(),
    right: z.string(),
  });

  /** Joins item */
  const Joins = z.object({
    type: z.string(),
    schema: z.string(),
    table: z.string(),
    alias: z.string(),
    conditions: z
      .array(JoinConditionSchema)
      .min(1, "At least one condition is required"),
  });

  /** Main form schema */
  const formSchema = z.object({
    from: FromSchema,
    mv_name: z.string().min(1, "Materialized view name is required"),
    mv_schema: z.string().min(1, "Materialized view schema name is required"),

    select: z
      .array(SelectItemSchema)
      .min(2, "At least two select column is required"),
    group_by: z.array(GroupBySchema).min(2, "At least 2 columns is required"),
    joins: z.array(Joins),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mv_name: "",
      mv_schema: "",
      select: [],
      from: { schema: "", table: "" },
      group_by: [],
      joins: [],
    },
  });

  const {
    fields: selectFields,
    prepend: addSelect,
    remove: removeSelect,
  } = useFieldArray({
    control: form.control,
    name: "select",
  });

  const {
    fields: groupByFields,
    prepend: addGroupBy,
    remove: removeGroupBy,
  } = useFieldArray({
    control: form.control,
    name: "group_by",
  });

  const {
    fields: joinsFields,
    prepend: addJoins,
    remove: removeJoins,
  } = useFieldArray({
    control: form.control,
    name: "joins",
  });
  console.log(joinsFields, "joinsFields");
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    const postMaterializedView = {
      baseURL: FLASK_URL,
      url: flaskApi.CreateMaterializedView,
      setLoading: setIsLoading,
      payload: values,
      isToast: true,
      accessToken: token.access_token,
    };

    const res = await postData(postMaterializedView);
    if (res.status === 201) {
      setTabName("createAggregateTable");
    }
    form.reset();
  };
  return (
    <div className="">
      <Card className="w-full">
        <CardHeader>
          <CardDescription>
            Enter inputs for creating materialized view
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* From */}
              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="from.schema"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Schema</FormLabel>
                      <FormControl>
                        <Input placeholder="public" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="from.table"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Table</FormLabel>
                      <FormControl>
                        <Input placeholder="readings" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="from.alias"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Alias (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="o" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Materialized View Name */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="mv_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Materialized View Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Materialized View Name"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mv_schema"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Materialized View Schema Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Materialized View Schema Name"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <hr />
              {/* Select Columns */}
              <div className="flex flex-col gap-3">
                <div className="flex w-full justify-between items-center">
                  <FormLabel>Select Columns</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      addSelect({ column: "", aggregate: undefined, alias: "" })
                    }
                  >
                    + Add
                  </Button>
                </div>

                {selectFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-10 gap-3">
                    <div className="grid col-span-9 gap-3 border p-2 rounded shadow">
                      <div className="grid grid-cols-4 gap-3">
                        {/* Column */}
                        <FormField
                          control={form.control}
                          name={`select.${index}.column`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Column Name</FormLabel>
                              <FormControl>
                                <Input placeholder="column" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Aggregate */}
                        <FormField
                          control={form.control}
                          name={`select.${index}.aggregate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Aggregate (optional)</FormLabel>
                              <FormControl>
                                <select
                                  className="w-full border rounded px-2 py-2"
                                  {...field}
                                >
                                  <option value="">—</option>
                                  <option value="COUNT">COUNT</option>
                                  <option value="SUM">SUM</option>
                                  <option value="AVG">AVG</option>
                                  <option value="MIN">MIN</option>
                                  <option value="MAX">MAX</option>
                                </select>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {/* Alias */}
                        <FormField
                          control={form.control}
                          name={`select.${index}.alias`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Alias (optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="alias" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`select.${index}.distinct`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Distinct (optional)</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                }}
                                value={field.value?.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a distinct" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {[true, false].map((item, i) => (
                                    <SelectItem key={i} value={item.toString()}>
                                      {item.toString()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-4 col-span-1 gap-3">
                        {/* Function */}
                        <FormField
                          control={form.control}
                          name={`select.${index}.function.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Function Name (optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="date_trunc" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="col-span-3">
                          <FunctionArgs
                            control={form.control}
                            name={`select.${index}.function.args`}
                          />
                        </div>
                      </div>
                    </div>
                    {/* Remove */}
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeSelect(index)}
                      className="col-span-1"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <hr />
              {/* Group By Columns */}
              <div className="flex flex-col gap-3">
                <div className="flex w-full justify-between items-center">
                  <FormLabel>Group By Columns</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addGroupBy({ column: "" })}
                  >
                    + Add
                  </Button>
                </div>

                {groupByFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-10 gap-3">
                    <div className="grid col-span-9 gap-3 border p-2 rounded shadow">
                      <div className="">
                        <FormField
                          control={form.control}
                          name={`group_by.${index}.column`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Column Name</FormLabel>
                              <FormControl>
                                <Input placeholder="column" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-4 col-span-1 gap-3">
                        {/* Function */}
                        <FormField
                          control={form.control}
                          name={`group_by.${index}.function.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Function Name (optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="date_trunc" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="col-span-3">
                          <FunctionArgs
                            control={form.control}
                            name={`group_by.${index}.function.args`}
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeGroupBy(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <hr />
              {/* Joins */}
              <div className="flex flex-col gap-3">
                <div className="flex w-full justify-between items-center">
                  <FormLabel>Joins (optional)</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      addJoins({
                        type: "",
                        alias: "",
                        schema: "",
                        table: "",
                        conditions: [],
                      })
                    }
                  >
                    + Add
                  </Button>
                </div>

                {joinsFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-10 gap-3">
                    <div className="grid col-span-9 gap-3 border p-2 rounded shadow">
                      <div className="grid grid-cols-4 gap-3">
                        {/* Type */}
                        <FormField
                          control={form.control}
                          name={`joins.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Join Type</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                }}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Types</SelectLabel>
                                    <SelectItem value="LEFT">Left</SelectItem>
                                    <SelectItem value="RIGHT">Right</SelectItem>
                                    <SelectItem value="FULL">Full</SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Schema */}
                        <FormField
                          control={form.control}
                          name={`joins.${index}.schema`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Schema Table</FormLabel>
                              <FormControl>
                                <Input placeholder="public" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Table */}
                        <FormField
                          control={form.control}
                          name={`joins.${index}.table`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Table Name</FormLabel>
                              <FormControl>
                                <Input placeholder="orders" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {/* Alias */}
                        <FormField
                          control={form.control}
                          name={`joins.${index}.alias`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Alias</FormLabel>
                              <FormControl>
                                <Input placeholder="o" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-1">
                        {/* Conditions */}
                        <JoinConditions
                          control={form.control}
                          joinIndex={index}
                        />
                      </div>
                    </div>
                    {/* Remove */}
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeJoins(index)}
                      className="col-span-1"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <hr />
              {/* Submit */}
              <div className="flex w-full justify-center">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner size="25" color="white" /> : "Submit"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateMaterializedView;
