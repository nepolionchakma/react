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
import { useEffect, useState } from "react";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { loadData, postData } from "@/Utility/funtion";
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
  id: string;
  name: string;
  alias: string;
}

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
  selectedTables,
  argTableName,
  setArgTableName,
  argColumns,
  handleFetchArgColumns,
  isColumnLoading,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  name: string;
  selectedTables: selectedTable[];
  argTableName: Record<string, string>;
  argColumns: Record<string, IColumns[]>;
  isColumnLoading: Record<string, boolean>;
  setArgTableName: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleFetchArgColumns: (fieldId: string, tableName: string) => Promise<void>;
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: name,
  });

  const [argTypes, setArgTypes] = useState<("input" | "column")[]>([]);

  const handleAddInputArg = () => {
    append("");
    setArgTypes((prev) => [...prev, "input"]);
  };

  const handleAddColumnArg = () => {
    append("");
    setArgTypes((prev) => [...prev, "column"]);
  };

  return (
    <div className="space-y-2 flex flex-col gap-1">
      <div className="flex w-full justify-between items-center">
        <FormLabel>Arguments (optional)</FormLabel>
        <div className="flex flex-col justify-center items-center">
          <Button
            type="button"
            variant="outline"
            className="h-5"
            onClick={handleAddInputArg}
          >
            + Add Function Argument
          </Button>
          <p>or</p>
          <Button
            type="button"
            variant="outline"
            className="h-5"
            onClick={handleAddColumnArg}
          >
            + Add column Argument
          </Button>
        </div>
      </div>
      <div className="flex gap-2 mt-2 flex-wrap">
        {fields.map((condition, condIndex) => (
          <div key={condition.id} className="flex">
            {argTypes[condIndex] === "input" ? (
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
            ) : (
              <div className="flex gap-2">
                <FormItem>
                  <Select
                    disabled={selectedTables.length < 1}
                    value={argTableName[condition.id] || ""}
                    onValueChange={(value) => {
                      setArgTableName((prev) => ({
                        ...prev,
                        [condition.id]: value,
                      }));
                      handleFetchArgColumns(condition.id, value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Table Name" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Table Name</SelectLabel>
                        {selectedTables?.map((item, index) => (
                          <SelectItem key={index} value={item.name}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>

                <FormField
                  control={control}
                  name={`${name}.${condIndex}`}
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        disabled={
                          !argTableName[condition.id] ||
                          isColumnLoading[condition.id]
                        }
                        value={field.value?.split(".")[1] || ""}
                        onValueChange={(value) => {
                          const selectedTableName =
                            argTableName?.[condition.id];
                          const table = selectedTables.find(
                            (t) => t.name === selectedTableName
                          );
                          const column = `${table?.alias}.${value}`;
                          field.onChange(column);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Column Name" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Column Name</SelectLabel>
                            {argColumns[condition.id]?.map((item, index) => (
                              <SelectItem key={index} value={item.name}>
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
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                remove(condIndex);
                setArgTypes((prev) => prev.filter((_, i) => i !== condIndex));
              }}
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
  const [schemaName, setSchemaName] = useState<string>();
  const [tables, setTables] = useState<string[]>([]);
  const [leftTableName, setLeftTableName] = useState<Record<number, string>>(
    {}
  );
  const [leftColumns, setLeftColumns] = useState<Record<number, IColumns[]>>(
    {}
  );
  const [rightSchemaName, setRightSchemaName] = useState<
    Record<string, string>
  >({});
  const [rightTables, setRightTables] = useState<Record<string, string[]>>({});
  const [rightTableName, setRightTableName] = useState<Record<string, string>>(
    {}
  );
  const [rightColumns, setRightColumns] = useState<Record<string, IColumns[]>>(
    {}
  );
  const [grouoByTableName, setGroupByTableName] = useState<
    Record<string, string>
  >({});
  const [groupByColumns, setGroupByColumns] = useState<
    Record<string, IColumns[]>
  >({});
  const [groupByArgTableName, setGroupByArgTableName] = useState<
    Record<string, string>
  >({});
  const [selectArgTableName, setSelectArgTableName] = useState<
    Record<string, string>
  >({});
  const [groupByArgColumns, setGroupByArgColumns] = useState<
    Record<string, IColumns[]>
  >({});
  const [selectArgColumns, setSelectArgColumns] = useState<
    Record<string, IColumns[]>
  >({});
  const [selectColumns, setSelectColumns] = useState<
    Record<string, IColumns[]>
  >({});
  const [selectedTables, setSelectedTables] = useState<selectedTable[]>([]);
  const [isFromLoading, setIsFromLoading] = useState(true);
  const [isLeftColumnLoading, setIsLeftColumnLoading] = useState<
    Record<string, boolean>
  >({});
  const [isRightTableLoading, setIsRightTableLoading] = useState<
    Record<string, boolean>
  >({});
  const [isRightColumnLoading, setIsRightColumnLoading] = useState<
    Record<string, boolean>
  >({});
  const [isSelectColumnLoading, setIsSelectColumnLoading] = useState<
    Record<string, boolean>
  >({});
  const [isSelectArgColumnLoading, setIsSelectArgColumnLoading] = useState<
    Record<string, boolean>
  >({});
  const [isGroupByColumnLoading, setIsGroupByColumnLoading] = useState<
    Record<string, boolean>
  >({});
  const [isGroupByArgColumnLoading, setIsGroupByArgColumnLoading] = useState<
    Record<string, boolean>
  >({});
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
        setLoading: setIsFromLoading,
      };

      const res = await loadData(fetchTableParams);
      setTables(res.schemas[0].tables);
    };
    fetchTables();
  }, [token.access_token, schemaName]);

  /** right tables (Joins)*/
  const fetchRightTables = async (fieldId: string, schema: string) => {
    if (!schema) return;
    setIsRightTableLoading((prev) => ({
      ...prev,
      [fieldId]: true,
    }));
    try {
      const fetchTableParams = {
        baseURL: FLASK_URL,
        url: `${flaskApi.Table}?schema=${schema}`,
        accessToken: token.access_token,
      };

      const res = await loadData(fetchTableParams);
      setRightTables((prev) => ({
        ...prev,
        [fieldId]: res.schemas[0].tables,
      }));
    } finally {
      setIsRightTableLoading((prev) => ({
        ...prev,
        [fieldId]: false,
      }));
    }
  };

  const handleFetchLeftColumn = async (index: number, tableName: string) => {
    setIsLeftColumnLoading((prev) => ({
      ...prev,
      [index]: true,
    }));

    try {
      const fetchColumnParams = {
        baseURL: FLASK_URL,
        url: `${flaskApi.Table}?table=${tableName}`,
        accessToken: token.access_token,
      };

      const res = await loadData(fetchColumnParams);

      setLeftColumns((prev) => ({
        ...prev,
        [index]: res.columns || [],
      }));
    } finally {
      setIsLeftColumnLoading((prev) => ({
        ...prev,
        [index]: false,
      }));
    }
  };
  const handleFetchRightColumns = async (
    fieldId: string,
    tableName: string
  ) => {
    setIsRightColumnLoading((prev) => ({
      ...prev,
      [fieldId]: true,
    }));

    try {
      const fetchColumnParams = {
        baseURL: FLASK_URL,
        url: `${flaskApi.Table}?table=${tableName}`,
        accessToken: token.access_token,
      };

      const res = await loadData(fetchColumnParams);

      setRightColumns((prev) => ({
        ...prev,
        [fieldId]: res.columns,
      }));
    } finally {
      setIsRightColumnLoading((prev) => ({
        ...prev,
        [fieldId]: false,
      }));
    }
  };

  const handleFetchSelectColumns = async (
    fieldId: string,
    tableName: string
  ) => {
    setIsSelectColumnLoading((prev) => ({
      ...prev,
      [fieldId]: true,
    }));
    if (!tableName) return;
    try {
      const fetchColumnParams = {
        baseURL: FLASK_URL,
        url: `${flaskApi.Table}?table=${tableName}`,
        accessToken: token.access_token,
      };

      const res = await loadData(fetchColumnParams);
      setSelectColumns((prev) => ({
        ...prev,
        [tableName]: res.columns,
      }));
    } finally {
      setIsSelectColumnLoading((prev) => ({
        ...prev,
        [fieldId]: false,
      }));
    }
  };
  const handleFetchGroupByColumns = async (
    fieldId: string,
    tableName: string
  ) => {
    if (!tableName) return;
    setIsGroupByColumnLoading((prev) => ({
      ...prev,
      [fieldId]: true,
    }));
    try {
      const fetchColumnParams = {
        baseURL: FLASK_URL,
        url: `${flaskApi.Table}?table=${tableName}`,
        accessToken: token.access_token,
      };

      const res = await loadData(fetchColumnParams);
      setGroupByColumns((prev) => ({
        ...prev,
        [fieldId]: res?.columns,
      }));
    } finally {
      setIsGroupByColumnLoading((prev) => ({
        ...prev,
        [fieldId]: false,
      }));
    }
  };

  const handleFetchGroupByArgColumns = async (
    fieldId: string,
    tableName: string
  ) => {
    if (!tableName) return;
    setIsGroupByArgColumnLoading((prev) => ({
      ...prev,
      [fieldId]: true,
    }));
    try {
      const fetchColumnParams = {
        baseURL: FLASK_URL,
        url: `${flaskApi.Table}?table=${tableName}`,
        accessToken: token.access_token,
      };

      const res = await loadData(fetchColumnParams);
      setGroupByArgColumns((prev) => ({
        ...prev,
        [fieldId]: res.columns,
      }));
    } finally {
      setIsGroupByArgColumnLoading((prev) => ({
        ...prev,
        [fieldId]: false,
      }));
    }
  };

  const handleFetchSelectArgColumns = async (
    fieldId: string,
    tableName: string
  ) => {
    setIsSelectArgColumnLoading((prev) => ({
      ...prev,
      [fieldId]: true,
    }));
    if (!tableName) return;
    try {
      const fetchColumnParams = {
        baseURL: FLASK_URL,
        url: `${flaskApi.Table}?table=${tableName}`,
        accessToken: token.access_token,
      };

      const res = await loadData(fetchColumnParams);
      setSelectArgColumns((prev) => ({
        ...prev,
        [fieldId]: res.columns,
      }));
    } finally {
      setIsSelectArgColumnLoading((prev) => ({
        ...prev,
        [fieldId]: false,
      }));
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const cleanedSelect = values.select.map((item) => {
      if (item.column === "") {
        const rest = { ...item };
        delete rest.column;
        return rest;
      }
      return item;
    });
    const cleanedGroupBy = values.group_by.map((item) => {
      if (item.column === "") {
        const rest = { ...item };
        delete rest.column;
        return rest;
      }
      return item;
    });
    const data = {
      ...values,
      select: cleanedSelect,
      group_by: cleanedGroupBy,
    };

    const postMaterializedView = {
      baseURL: FLASK_URL,
      url: flaskApi.CreateMaterializedView,
      setLoading: setIsLoading,
      payload: data,
      isToast: true,
      accessToken: token.access_token,
    };

    const res = await postData(postMaterializedView);

    if (res.status === 201) {
      form.reset();
    }
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

  console.log(selectedTables, "selectedTables");

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
                        disabled={schemaName == "" || isFromLoading}
                        onValueChange={(value) => {
                          handleSelectedTable({
                            id: "1",
                            name: value,
                            alias: form.getValues("from.alias"),
                          });
                          field.onChange(value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a table" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="overflow-y-auto max-h-[15rem]">
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
                              id: "1",
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
                        <FormItem>
                          <FormLabel>Left Table</FormLabel>
                          <Select
                            disabled={selectedTables.length < 1}
                            value={leftTableName[index] || ""}
                            onValueChange={(value) => {
                              setLeftTableName((prev) => ({
                                ...prev,
                                [index]: value,
                              }));
                              handleFetchLeftColumn(index, value);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a table" />
                            </SelectTrigger>

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

                        {/* Right Schema */}
                        <FormField
                          control={form.control}
                          name={`joins.${index}.schema`}
                          render={({ field: formfield }) => (
                            <FormItem>
                              <FormLabel>Right Table Schema</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  setRightSchemaName((prev) => ({
                                    ...prev,
                                    [field.id]: value,
                                  }));
                                  formfield.onChange(value);
                                  fetchRightTables(field.id, value);
                                }}
                                value={formfield.value}
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
                          render={({ field: formField }) => (
                            <FormItem>
                              <FormLabel>Right Table</FormLabel>
                              <Select
                                disabled={
                                  !rightSchemaName[field.id] ||
                                  isRightTableLoading[field.id]
                                }
                                onValueChange={(value) => {
                                  setRightTableName((prev) => ({
                                    ...prev,
                                    [field.id]: value,
                                  }));

                                  handleSelectedTable({
                                    id: field.id,
                                    name: value,
                                    alias: form.getValues(
                                      `joins.${index}.alias`
                                    ),
                                  });
                                  formField.onChange(value);
                                  handleFetchRightColumns(field.id, value);
                                }}
                                value={formField.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a table" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="overflow-y-auto max-h-[15rem]">
                                  <SelectGroup>
                                    <SelectLabel>Table Name</SelectLabel>
                                    {rightTables[field.id]?.map((item, i) => (
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

                        {/* right Alias */}
                        <FormField
                          control={form.control}
                          name={`joins.${index}.alias`}
                          render={({ field: formField }) => (
                            <FormItem>
                              <FormLabel>Alias</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="o"
                                  {...formField}
                                  onChange={(e) => {
                                    formField.onChange(e);

                                    handleSelectedTable({
                                      id: field.id,
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
                                  disabled={
                                    !leftTableName[index] ||
                                    isLeftColumnLoading[index]
                                  }
                                  onValueChange={(value) => {
                                    const column = selectedTables.find(
                                      (item) =>
                                        item.name === leftTableName[index]
                                    );
                                    const left = `${column?.alias}.${value}`;
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
                            render={({ field: formField }) => (
                              <FormItem>
                                <FormLabel>Right Column</FormLabel>
                                <Select
                                  disabled={
                                    !rightTableName[field.id] ||
                                    isRightColumnLoading[field.id]
                                  }
                                  onValueChange={(value) => {
                                    const alias = form.getValues(
                                      `joins.${index}.alias`
                                    );
                                    const right = `${alias}.${value}`;

                                    formField.onChange(right);
                                  }}
                                  value={formField.value?.split(".")[1]}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a column name" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectGroup>
                                      <SelectLabel>Column Name</SelectLabel>
                                      {rightColumns[field.id]?.map(
                                        (item, i) => (
                                          <SelectItem key={i} value={item.name}>
                                            {item.name}
                                          </SelectItem>
                                        )
                                      )}
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
                      onClick={() => {
                        const joinTableId = field.id;
                        setSelectedTables((prev) =>
                          prev.filter((item) => item.id !== joinTableId)
                        );
                        removeJoins(index);
                      }}
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
                        function: {
                          name: "",
                          args: [],
                        },
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
                          render={({ field: formField }) => (
                            <FormItem>
                              <FormLabel>Table Name</FormLabel>
                              <Select
                                disabled={selectedTables.length < 1}
                                onValueChange={(value) => {
                                  formField.onChange(value);
                                  handleFetchSelectColumns(field.id, value);
                                }}
                                value={formField.value}
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
                          render={({ field: formField }) => {
                            const tableName = form.watch(
                              `select.${index}.table`
                            );
                            const table = selectedTables.find(
                              (t) => t.name === tableName
                            );

                            return (
                              <FormItem>
                                <FormLabel>Column Name</FormLabel>
                                <Select
                                  disabled={
                                    !tableName ||
                                    isSelectColumnLoading[field.id]
                                  }
                                  value={formField.value?.split(".")[1] ?? ""}
                                  onValueChange={(value) => {
                                    formField.onChange(
                                      `${table?.alias}.${value}`
                                    );
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a column name" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectGroup>
                                      <SelectLabel>Column Name</SelectLabel>
                                      {tableName &&
                                        selectColumns[tableName]?.map((col) => (
                                          <SelectItem
                                            key={col.name}
                                            value={col.name}
                                          >
                                            {col.name}
                                          </SelectItem>
                                        ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            );
                          }}
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
                            selectedTables={selectedTables}
                            argTableName={selectArgTableName}
                            handleFetchArgColumns={handleFetchSelectArgColumns}
                            setArgTableName={setSelectArgTableName}
                            argColumns={selectArgColumns}
                            isColumnLoading={isSelectArgColumnLoading}
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
                      addGroupBy({
                        column: "",
                        function: {
                          name: "",
                          args: [],
                        },
                      });
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
                        <FormItem>
                          <FormLabel>Table Name</FormLabel>

                          <Select
                            disabled={selectedTables.length < 1}
                            value={grouoByTableName[field.id] || ""}
                            onValueChange={(value) => {
                              setGroupByTableName((prev) => ({
                                ...prev,
                                [field.id]: value,
                              }));
                              handleFetchGroupByColumns(field.id, value);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a table" />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Table Name</SelectLabel>
                                {selectedTables?.map((item) => (
                                  <SelectItem key={item.name} value={item.name}>
                                    {item.name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormItem>

                        <FormField
                          control={form.control}
                          name={`group_by.${index}.column`}
                          render={({ field: formField }) => {
                            const selectedTableName =
                              grouoByTableName[field.id];
                            const table = selectedTables.find(
                              (t) => t.name === selectedTableName
                            );

                            return (
                              <FormItem className="flex-1">
                                <FormLabel>Column Name</FormLabel>
                                <Select
                                  value={formField.value?.split(".")[1] || ""}
                                  onValueChange={(value) => {
                                    const column = `${table?.alias}.${value}`;
                                    formField.onChange(column);
                                  }}
                                  disabled={
                                    !selectedTableName ||
                                    isGroupByColumnLoading[field.id]
                                  }
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a column" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectGroup>
                                      <SelectLabel>Column Name</SelectLabel>
                                      {groupByColumns[field.id]?.map(
                                        (item, i) => (
                                          <SelectItem key={i} value={item.name}>
                                            {item.name}
                                          </SelectItem>
                                        )
                                      )}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
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
                            selectedTables={selectedTables}
                            argTableName={groupByArgTableName}
                            handleFetchArgColumns={handleFetchGroupByArgColumns}
                            setArgTableName={setGroupByArgTableName}
                            argColumns={groupByArgColumns}
                            isColumnLoading={isGroupByArgColumnLoading}
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
