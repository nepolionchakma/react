import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Control, FieldPath } from "react-hook-form";
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
import { useEffect, useState } from "react";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { getFirstMiddleLast, loadData, postData } from "@/Utility/funtion";
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
import { IColumns, ISchema } from "@/types/interfaces/tables.interface";

interface selectedTable {
  id: number;
  name: string;
  alias: string;
}

// interface Props {
//   setTabName: React.Dispatch<React.SetStateAction<string>>;
// }
// const JoinConditions = ({
//   control,
//   joinIndex,
// }: {
//   control: Control<any>;
//   joinIndex: number;
// }) => {
//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: `joins.${joinIndex}.conditions`,
//   });

//   return (
//     <div className="space-y-2">
//       <div className="flex justify-between items-center">
//         <FormLabel className="uppercase">On Conditions</FormLabel>
//         <Button
//           type="button"
//           variant="outline"
//           onClick={() => append({ left: "", op: "=", right: "" })}
//         >
//           + Add Condition
//         </Button>
//       </div>
//       {fields.map((condition, condIndex) => (
//         <div key={condition.id} className="grid grid-cols-10 gap-2">
//           <FormField
//             control={control}
//             name={`joins.${joinIndex}.conditions.${condIndex}.left`}
//             render={({ field }) => (
//               <FormItem className="col-span-4">
//                 <FormLabel>Left Column</FormLabel>
//                 <FormControl>
//                   <Input placeholder="left column" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={control}
//             name={`joins.${joinIndex}.conditions.${condIndex}.op`}
//             render={({ field }) => (
//               <FormItem className="col-span-2">
//                 <FormLabel>Operator</FormLabel>
//                 <FormControl>
//                   <Select
//                     onValueChange={(value) => {
//                       field.onChange(value);
//                     }}
//                     value={field.value}
//                   >
//                     <SelectTrigger className="w-[180px]">
//                       <SelectValue placeholder="Select a Operator" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectGroup>
//                         <SelectLabel>Operators</SelectLabel>
//                         <SelectItem value="=">=</SelectItem>
//                         <SelectItem value="!=">!=</SelectItem>
//                         <SelectItem value=">">{">"}</SelectItem>
//                         <SelectItem value="<">{"<"}</SelectItem>
//                       </SelectGroup>
//                     </SelectContent>
//                   </Select>
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={control}
//             name={`joins.${joinIndex}.conditions.${condIndex}.right`}
//             render={({ field }) => (
//               <FormItem className="col-span-3">
//                 <FormLabel>Right Column</FormLabel>
//                 <FormControl>
//                   <Input placeholder="right column" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <Button
//             type="button"
//             variant="ghost"
//             onClick={() => remove(condIndex)}
//           >
//             ✕
//           </Button>
//         </div>
//       ))}
//     </div>
//   );
// };

/** select item */
const SelectItemSchema = z.object({
  table: z.string().optional(),
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
  alias: z.string().min(1, "Alias is required"),
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

const CreateMaterializedView = () => {
  const { token } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);
  const [schemas, setSchemas] = useState<ISchema[]>([]);
  const [rightSchemaName, setRightSchemaName] = useState<string>();
  const [leftSchemaName, setLeftSchemaName] = useState<string>();
  const [schemaName, setSchemaName] = useState<string>();
  const [tables, setTables] = useState<string[]>([]);
  const [tableName, setTableName] = useState<string>();
  const [leftTableName, setLeftTableName] = useState<{
    index: number;
    name: string;
  }>();
  const [rightTableName, setRightTableName] = useState<{
    index: number;
    name: string;
  }>();
  const [leftTables, setLeftTables] = useState<string[]>([]);
  const [rightTables, setRightTables] = useState<string[]>([]);
  const [columns, setColumns] = useState<IColumns[]>([]);
  const [rightColumns, setRightColumns] = useState<Record<number, IColumns[]>>(
    {}
  );
  const [leftColumns, setLeftColumns] = useState<Record<number, IColumns[]>>(
    {}
  );
  const [selectColumns, setSelectColumns] = useState<IColumns[]>([]);
  const [selectColumnName, setSelectColumnName] = useState<string>();
  const [selectedTables, setSelectedTables] = useState<selectedTable[]>([]);
  const [leftJoinAlias, setLeftJoinAlias] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mv_name: "",
      mv_schema: "",
      select: [],
      from: { schema: "", table: "", alias: "" },
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
    append: addJoins,
    remove: removeJoins,
  } = useFieldArray({
    control: form.control,
    name: "joins",
  });

  /** Schemas  */
  useEffect(() => {
    const fetchSchema = async () => {
      const fetchSchemaParams = {
        baseURL: FLASK_URL,
        url: `${flaskApi.Table}`,
        accessToken: token.access_token,
      };

      const res = await loadData(fetchSchemaParams);
      setSchemas(res.schemas);
    };
    fetchSchema();
  }, [token.access_token]);

  /** from tables */
  useEffect(() => {
    if (!schemaName) return;
    const fetchTables = async () => {
      const fetchTableParams = {
        baseURL: FLASK_URL,
        url: `${flaskApi.Table}?schema=${schemaName}`,
        accessToken: token.access_token,
      };

      const res = await loadData(fetchTableParams);
      setTables(res.schemas[0].tables);
    };
    fetchTables();
  }, [token.access_token, schemaName]);

  /** left tables (Joins)*/
  useEffect(() => {
    if (!leftSchemaName) return;
    const fetchTables = async () => {
      const fetchTableParams = {
        baseURL: FLASK_URL,
        url: `${flaskApi.Table}?schema=${leftSchemaName}`,
        accessToken: token.access_token,
      };
      const res = await loadData(fetchTableParams);
      console.log(res, "sdfs");
      setLeftTables(res.schemas[0].tables);
    };
    fetchTables();
  }, [token.access_token, leftSchemaName]);

  /** right tables (Joins)*/
  useEffect(() => {
    if (!rightSchemaName) return;
    const fetchTables = async () => {
      const fetchTableParams = {
        baseURL: FLASK_URL,
        url: `${flaskApi.Table}?schema=${rightSchemaName}`,
        accessToken: token.access_token,
      };

      const res = await loadData(fetchTableParams);
      setRightTables(res.schemas[0].tables);
    };
    fetchTables();
  }, [token.access_token, rightSchemaName]);

  /** left columns (joins)*/
  useEffect(() => {
    if (!leftTableName?.name) return;
    const fetchColumns = async () => {
      const fetchColumnParams = {
        baseURL: FLASK_URL,
        url: `${flaskApi.Table}?table=${leftTableName.name}`,
        accessToken: token.access_token,
      };

      const res = await loadData(fetchColumnParams);
      setLeftColumns((prev) => ({
        ...prev,
        [leftTableName.index]: res.columns,
      }));
    };
    fetchColumns();
  }, [token.access_token, leftTableName]);

  /** right columns */
  useEffect(() => {
    if (!rightTableName?.name) return;
    const fetchColumns = async () => {
      const fetchColumnParams = {
        baseURL: FLASK_URL,
        url: `${flaskApi.Table}?table=${rightTableName.name}`,
        accessToken: token.access_token,
      };

      const res = await loadData(fetchColumnParams);
      setRightColumns((prev) => ({
        ...prev,
        [rightTableName.index]: res.columns,
      }));
    };
    fetchColumns();
  }, [token.access_token, rightTableName]);

  /** select columns */
  useEffect(() => {
    if (!selectColumnName) return;
    const fetchColumns = async () => {
      const fetchColumnParams = {
        baseURL: FLASK_URL,
        url: `${flaskApi.Table}?table=${selectColumnName}`,
        accessToken: token.access_token,
      };

      const res = await loadData(fetchColumnParams);
      setSelectColumns(res.columns);
    };
    fetchColumns();
  }, [token.access_token, selectColumnName]);

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

    // await postData(postMaterializedView);

    // form.reset();
  };

  const handleSelectedTable = (value: selectedTable) => {
    setSelectedTables((prev) => {
      const exists = prev.some((t) => t.id === value.id);

      if (exists) {
        // update existing
        return prev.map((t) =>
          t.id === value.id
            ? { ...t, alias: value.alias, id: value.id, name: value.name }
            : t
        );
      }

      // add new
      return [
        ...prev,
        {
          id: value.id,
          name: value.name,
          alias: value.alias,
        },
      ];
    });
  };

  // const handleAlias = (values: z.infer<typeof FromSchema>) => {
  //   setSelectedTables((prev) =>
  //     prev.map((t) =>
  //       t.name === values.table ? { ...t, alias: values.alias } : t
  //     )
  //   );
  // };

  console.log(selectedTables, "selected");

  return (
    <div>
      <Card>
        <CardHeader>
          <CardDescription>
            Enter inputs for creating materialized view
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              {/* From Schema */}
              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="from.schema"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Schema</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          setSchemaName(value);
                          field.onChange(value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a Schema" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Schema Name</SelectLabel>
                            {schemas?.map((item, i) => (
                              <SelectItem key={i} value={item.schema}>
                                {item.schema}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
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
                      <Select
                        onValueChange={(value) => {
                          // const alias = getFirstMiddleLast(value);
                          setTableName(value);
                          handleSelectedTable({
                            id: 1,
                            name: value,
                            alias: form.getValues("from.alias"),
                          });
                          field.onChange(value);
                          // form.setValue("from.alias", alias);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a table" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Table Name</SelectLabel>
                            {tables?.map((item, i) => (
                              <SelectItem key={i} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="from.alias"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Alias</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="o"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);

                            handleSelectedTable({
                              id: 1,
                              alias: e.target.value,
                              name: form.getValues("from.table"),
                            });
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                        {/* Left Table */}
                        <FormField
                          name={""}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Left Table</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  setLeftTableName({ index, name: value });
                                  field.onChange(value);
                                }}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a table" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Table Name</SelectLabel>
                                    {selectedTables?.map((item, i) => (
                                      <SelectItem key={i} value={item.name}>
                                        {item.name}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Right Schema */}
                        <FormField
                          control={form.control}
                          name={`joins.${index}.schema`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Right Table Schema</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  setRightSchemaName(value);
                                  field.onChange(value);
                                }}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a Schema" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Schema Name</SelectLabel>
                                    {schemas?.map((item, i) => (
                                      <SelectItem key={i} value={item.schema}>
                                        {item.schema}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Right Table */}
                        <FormField
                          control={form.control}
                          name={`joins.${index}.table`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Right Table Name</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  // const alias = getFirstMiddleLast(value);
                                  setRightTableName({ index, name: value });
                                  handleSelectedTable({
                                    id: index + 2,
                                    name: value,
                                    alias: form.getValues(
                                      `joins.${index}.alias`
                                    ),
                                  });
                                  field.onChange(value);
                                  // form.setValue(`joins.${index}.alias`, alias);
                                }}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a table" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Table Name</SelectLabel>
                                    {rightTables?.map((item, i) => (
                                      <SelectItem key={i} value={item}>
                                        {item}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {/* left Alias */}
                        <FormField
                          name=""
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Left Alias</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="o"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    setLeftJoinAlias(e.target.value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {/* right Alias */}
                        <FormField
                          control={form.control}
                          name={`joins.${index}.alias`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Right Alias</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="o"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);

                                    handleSelectedTable({
                                      id: index + 2,
                                      alias: e.target.value,
                                      name: form.getValues(
                                        `joins.${index}.table`
                                      ),
                                    });
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div>
                        {/* Conditions */}
                        <FormLabel className="uppercase">
                          On Conditions
                        </FormLabel>
                        <div className="grid grid-cols-3 gap-3">
                          <FormField
                            control={form.control}
                            name={`joins.${index}.conditions.${0}.left`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Left Column</FormLabel>
                                <Select
                                  onValueChange={(value) => {
                                    const left = `${leftJoinAlias}.${value}`;
                                    field.onChange(left);
                                  }}
                                  value={field.value?.split(".")[1]}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select left column" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectGroup>
                                      <SelectLabel>Column Name</SelectLabel>
                                      {leftColumns[index]?.map((item, i) => (
                                        <SelectItem key={i} value={item.name}>
                                          {item.name}
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`joins.${index}.conditions.${0}.op`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Operator</FormLabel>
                                <FormControl>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select an  Operator" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectGroup>
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
                            control={form.control}
                            name={`joins.${index}.conditions.${0}.right`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Right Column</FormLabel>
                                <Select
                                  onValueChange={(value) => {
                                    const alias = form.getValues(
                                      `joins.${index}.alias`
                                    );
                                    const right = `${alias}.${value}`;

                                    field.onChange(right);
                                  }}
                                  value={field.value?.split(".")[1]}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a column name" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectGroup>
                                      <SelectLabel>Column Name</SelectLabel>
                                      {rightColumns[index]?.map((item, i) => (
                                        <SelectItem key={i} value={item.name}>
                                          {item.name}
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
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

              {/* Select Columns */}
              <div className="flex flex-col gap-3">
                <div className="flex w-full justify-between items-center">
                  <FormLabel>Select Columns</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      addSelect({
                        column: "",
                        aggregate: undefined,
                        alias: "",
                      });
                      form.trigger("select");
                    }}
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
                          name={`select.${index}.table`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Table Name</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  setSelectColumnName(value);
                                }}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a Table" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Table Name</SelectLabel>
                                    {selectedTables?.map((item, i) => (
                                      <SelectItem key={i} value={item.name}>
                                        {item.name}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`select.${index}.column`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Column Name</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  const alias = form.getValues("from.alias");
                                  const column = `${alias}.${value}`;
                                  field.onChange(column);
                                }}
                                value={field.value?.split(".")[1]}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a column name" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Column Name</SelectLabel>
                                    {selectColumns?.map((item, i) => (
                                      <SelectItem key={i} value={item.name}>
                                        {item.name}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
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
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                  }}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select an Aggregate" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectGroup>
                                      <SelectLabel>Aggregate Name</SelectLabel>
                                      <SelectItem value="COUNT">
                                        COUNT
                                      </SelectItem>
                                      <SelectItem value="SUM">SUM</SelectItem>
                                      <SelectItem value="AVG">AVG</SelectItem>
                                      <SelectItem value="MIN">MIN</SelectItem>
                                      <SelectItem value="MAX">MAX</SelectItem>
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
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
                                  field.onChange(
                                    value === "true" ? true : false
                                  );
                                }}
                                value={field.value?.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a distinct" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {["true", "false"].map((item, i) => (
                                    <SelectItem key={i} value={item}>
                                      {item}
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
                      onClick={() => {
                        removeSelect(index);
                        form.trigger("select");
                      }}
                      className="col-span-1"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              {form.formState.errors.select?.root?.message && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.select.root.message}
                </p>
              )}
              <hr />

              {/* Group By Columns */}
              <div className="flex flex-col gap-3">
                <div className="flex w-full justify-between items-center">
                  <FormLabel>Group By Columns</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      addGroupBy({ column: "" });
                      form.trigger("group_by");
                    }}
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
                              <Select
                                onValueChange={(value) => {
                                  const alias = form.getValues("from.alias");
                                  const column = `${alias}.${value}`;
                                  field.onChange(column);
                                }}
                                value={field.value?.split(".")[1]}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a column name" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Column Name</SelectLabel>
                                    {columns?.map((item, i) => (
                                      <SelectItem key={i} value={item.name}>
                                        {item.name}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
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
                      onClick={() => {
                        removeGroupBy(index);
                        form.trigger("group_by");
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              {form.formState.errors.group_by?.root?.message && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.group_by.root.message}
                </p>
              )}
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
