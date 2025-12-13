import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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

interface Props {
  setTabName: React.Dispatch<React.SetStateAction<string>>;
}

const CreateMaterializedView = ({ setTabName }: Props) => {
  const { token } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);

  /** select item */
  const SelectItemSchema = z.object({
    column: z.string(),
    alias: z.string().optional(),
    aggregate: z.enum(["COUNT", "SUM", "AVG", "MIN", "MAX"]).optional(),
  });

  /** FROM clause */
  const FromSchema = z.object({
    schema: z.string(),
    table: z.string(),
  });

  /** GROUP BY item */
  const GroupBySchema = z.object({
    column: z.string(),
  });

  /** Main form schema */
  const formSchema = z.object({
    mv_name: z.string().min(1, "Materialized view name is required"),
    mv_schema: z.string().min(1, "Materialized view schema name is required"),

    select: z
      .array(SelectItemSchema)
      .min(2, "At least two select column is required"),

    from: FromSchema,

    group_by: z.array(GroupBySchema).min(2, "At least 2 columns is required"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mv_name: "",
      mv_schema: "",
      select: [],
      from: { schema: "", table: "" },
      group_by: [],
    },
  });

  const {
    fields: selectFields,
    append: addSelect,
    remove: removeSelect,
  } = useFieldArray({
    control: form.control,
    name: "select",
  });

  const {
    fields: groupByFields,
    append: addGroupBy,
    remove: removeGroupBy,
  } = useFieldArray({
    control: form.control,
    name: "group_by",
  });

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
    <div>
      <Card className="w-full">
        <CardHeader>
          <CardDescription>
            Enter inputs for creating materialized view
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
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
                </div>
              </div>
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
                    <div className="grid grid-cols-3 gap-3 col-span-9">
                      {/* Column */}
                      <FormField
                        control={form.control}
                        name={`select.${index}.column`}
                        render={({ field }) => (
                          <FormItem>
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
                            <FormControl>
                              <Input placeholder="alias" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    {/* Remove */}
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeSelect(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

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
                  <div key={field.id} className="flex gap-3">
                    <FormField
                      control={form.control}
                      name={`group_by.${index}.column`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="column" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
