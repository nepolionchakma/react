import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import {
  IApplicationType,
  IDataSourceConnectorProperties,
  IDataSourceTypes,
} from "@/types/interfaces/datasource.interface";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { loadData, postData, putData } from "@/Utility/funtion";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Spinner from "@/components/Spinner/Spinner";
import { AlertDialogCancel } from "@/components/ui/alert-dialog";

interface IDataSourceAddDataTypes {
  action: string;
  maxID?: number;
  selected: IDataSourceTypes[];
  editAble?: boolean;
  setSave: Dispatch<SetStateAction<number>>;
  setRowSelection: Dispatch<SetStateAction<Record<string, never>>>;
  setSelectedDataSourceItems: React.Dispatch<
    React.SetStateAction<IDataSourceTypes[]>
  >;
  connectorProperties: IDataSourceConnectorProperties | undefined;
}
const Modal: FC<IDataSourceAddDataTypes> = ({
  action,
  selected,
  editAble,
  setSave,
  // setRowSelection,
  setSelectedDataSourceItems,
  connectorProperties,
}) => {
  const { fetchDataSource, token } = useGlobalContext();
  const [applicationTypes, setApplicationTypes] = useState<IApplicationType[]>(
    []
  );
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [versions, setVersions] = useState<string[]>([]);

  const mapAdditionalParamsToArray = (
    params?: Record<string, string | number | boolean>
  ) => {
    if (!params) return [];

    return Object.entries(params).map(([key, value]) => ({
      key,
      value: String(value),
    }));
  };

  const getAdditionalParams = () => {
    const params = dataSourceForm.getValues("additional_params");

    const paramsObject = params?.reduce((acc, cur) => {
      acc[cur.key] = cur.value;
      return acc;
    }, {} as Record<string, string>);

    return paramsObject;
  };

  const dataSourceSchema = z.object({
    datasource_name: z
      .string()
      .min(2, { message: "Datasource Name must be at least 2 characters." }),
    description: z
      .string()
      .min(2, { message: "Description must be at least 2 characters." }),
    application_type: z
      .string()
      .min(2, { message: "Application Type must be at least 2 characters." }),
    application_type_version: z.string().min(2, {
      message: "Application Type Version must be at least 2 characters.",
    }),
    last_access_synchronization_date: z.date(),
    last_access_synchronization_status: z.string().min(2, {
      message:
        "Last Access Synchronization Status must be at least 2 characters.",
    }),
    last_transaction_synchronization_date: z.date(),
    last_transaction_synchronization_status: z.string().min(2, {
      message:
        "Last Transaction Synchronization Status must be at least 2 characters.",
    }),
    default_datasource: z
      .string()
      .min(2, { message: "Default Datasource must be at least 2 characters." }),
    connection_type: z
      .string()
      .min(2, { message: "Database Type must be at least 2 characters." }),
    host: z
      .string()
      .min(2, { message: "Host Name must be at least 2 characters." }),
    database_name: z.string().optional(),
    port: z.string().optional(),
    username: z
      .string()
      .min(2, { message: "Username must be at least 2 characters." }),
    password: z
      .string()
      .min(2, { message: "Password must be at least 2 characters." }),
    additional_params: z
      .array(
        z.object({
          key: z.string().min(1, "Key is required"),
          value: z.string().min(1, "Value is required"),
        })
      )
      .optional(),
  });

  // const connectorSchema = z.object({

  // });
  // const connectorForm = useForm<z.infer<typeof connectorSchema>>({
  //   resolver: zodResolver(connectorSchema),
  //   defaultValues: {

  //   },
  // });
  const dataSourceForm = useForm<z.infer<typeof dataSourceSchema>>({
    resolver: zodResolver(dataSourceSchema),
    defaultValues: {
      datasource_name: action === "update" ? selected[0]?.datasource_name : "",
      description: action === "update" ? selected[0]?.description : "",
      application_type: action === "update" ? selected[0].application_type : "",
      application_type_version:
        action === "update" ? selected[0].application_type_version : "",
      last_access_synchronization_date:
        action === "update"
          ? selected[0].last_access_synchronization_date
          : new Date(),
      last_access_synchronization_status:
        action === "update"
          ? selected[0].last_access_synchronization_status
          : "COMPLETED",
      last_transaction_synchronization_date:
        action === "update"
          ? selected[0].last_transaction_synchronization_date
          : new Date(),
      last_transaction_synchronization_status:
        action === "update"
          ? selected[0].last_transaction_synchronization_status
          : "COMPLETED",
      default_datasource:
        action === "update" ? selected[0].default_datasource : "false",
      connection_type:
        action === "update" ? connectorProperties?.connection_type : "",
      host: action === "update" ? connectorProperties?.host : "",
      database_name:
        action === "update" ? connectorProperties?.database_name : "",
      port: action === "update" ? connectorProperties?.port?.toString() : "",
      username: action === "update" ? connectorProperties?.username : "",
      password: action === "update" ? connectorProperties?.password : "",
      additional_params:
        action === "update"
          ? mapAdditionalParamsToArray(connectorProperties?.additional_params)
          : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: dataSourceForm.control,
    name: "additional_params",
  });

  useEffect(() => {
    if (action === "update") {
      const fetchDataFromAPI = async () => {
        if (selected[0]) {
          const result = await fetchDataSource(selected[0].def_data_source_id);
          dataSourceForm.reset(result);
          if (connectorProperties) {
            dataSourceForm.reset({
              ...dataSourceForm,
              connection_type: connectorProperties.connection_type,
              host: connectorProperties.host,
              username: connectorProperties.username,
              password: connectorProperties.password,
              database_name: connectorProperties.database_name,
              port: connectorProperties.port?.toString(),
              additional_params: mapAdditionalParamsToArray(
                connectorProperties.additional_params
              ),
            });
          }
          // Sync form with fetched data
        } else return;
      };
      fetchDataFromAPI();
    }
  }, [
    editAble,
    action,
    selected,
    fetchDataSource,
    dataSourceForm,
    connectorProperties,
  ]);

  useEffect(() => {
    const fetchApplicationType = async () => {
      const loadParams = {
        baseURL: FLASK_URL,
        url: `${flaskApi.ApplicationTypes}`,
        accessToken: token.access_token,
        // setLoading: setIsLoading,
      };

      const res = await loadData(loadParams);
      setApplicationTypes(res.result);
    };
    fetchApplicationType();
  }, [token.access_token]);

  const applicationType = dataSourceForm.watch("application_type");
  useEffect(() => {
    console.log(applicationType);
    const fetchVersions = async () => {
      const loadParams = {
        baseURL: FLASK_URL,
        url: `${flaskApi.ApplicationTypes}?application_type=${applicationType}`,
        accessToken: token.access_token,
        // setLoading: setIsLoading,
      };

      const res = await loadData(loadParams);
      setVersions(res.result[0].versions);
    };
    fetchVersions();
  }, [token.access_token, applicationType]);

  const onSubmit = async (data: z.infer<typeof dataSourceSchema>) => {
    // setRowSelection({});
    const dataSourcePayload = {
      datasource_name: data.datasource_name,
      description: data.description,
      application_type: data.application_type,
      application_type_version: data.application_type_version,
      last_access_synchronization_date: data.last_access_synchronization_date,
      last_access_synchronization_status:
        data.last_access_synchronization_status,
      last_transaction_synchronization_date:
        data.last_transaction_synchronization_date,
      last_transaction_synchronization_status:
        data.last_transaction_synchronization_status,
      default_datasource: data.default_datasource,
    };

    if (action === "add") {
      const dataSourcePostParams = {
        baseURL: FLASK_URL,
        url: flaskApi.DefDataSources,
        setLoading: setIsLoading,
        payload: dataSourcePayload,
        isConsole: false,
        accessToken: token.access_token,
      };

      const res = await postData(dataSourcePostParams);
      if (res.status === 201) {
        const propertyPayload = {
          def_data_source_id: res.data.result.def_data_source_id,
          connection_type: data.connection_type,
          host: data.host,
          database_name: data.database_name,
          port: data.port ? Number(data.port) : null,
          username: data.username,
          password: data.password,
          additional_params: getAdditionalParams(),
        };

        const propertyPostParams = {
          baseURL: FLASK_URL,
          url: flaskApi.DatasourceConnectorProperties,
          setLoading: setIsLoading,
          payload: propertyPayload,
          isToast: true,
          accessToken: token.access_token,
          isConsole: true,
        };

        const propertyRes = await postData(propertyPostParams);
        if (propertyRes.status === 201) {
          setSave((prevSave) => prevSave + 1);
          setSelectedDataSourceItems([]);
        }
      }
    } else {
      const dataSourcePutParams = {
        baseURL: FLASK_URL,
        url: `${flaskApi.DefDataSources}?def_data_source_id=${selected[0].def_data_source_id}`,
        setLoading: setIsLoading,
        payload: dataSourcePayload,
        isConsole: false,
        isToast: true,
        accessToken: token.access_token,
      };

      const dataSourceRes = await putData(dataSourcePutParams);
      if (dataSourceRes.status === 200) {
        const propertyPayload = {
          def_data_source_id: connectorProperties?.def_data_source_id,
          connection_type: data.connection_type,
          host: data.host,
          database_name: data.database_name,
          port: data.port ? Number(data.port) : null,
          username: data.username,
          password: data.password,
          additional_params: getAdditionalParams(),
        };
        const propertyPutParams = {
          baseURL: FLASK_URL,
          url: `${flaskApi.DatasourceConnectorProperties}?def_connection_id=${connectorProperties?.def_connection_id}`,
          setLoading: setIsLoading,
          payload: propertyPayload,
          isConsole: false,
          isToast: true,
          accessToken: token.access_token,
        };
        const propertyRes = await putData(propertyPutParams);
        if (propertyRes.status === 200) {
          setSave((prevSave) => prevSave + 1);
          setSelectedDataSourceItems([]);
        }
      }
    }
  };

  const handleTestConnection = async () => {
    const payoload = {
      connection_type: dataSourceForm.getValues("connection_type"),
      host: dataSourceForm.getValues("host"),
      database_name: dataSourceForm.getValues("database_name"),
      port: dataSourceForm.getValues("port"),
      username: dataSourceForm.getValues("username"),
      password: dataSourceForm.getValues("password"),
      additional_params: getAdditionalParams(),
    };

    const postParams = {
      baseURL: FLASK_URL,
      url: `/test_connection`,
      setLoading: setIsTesting,
      payload: payoload,
      isToast: true,
      accessToken: token.access_token,
    };
    await postData(postParams);
  };

  const openProperties = () => {
    setOpen(!open);
  };
  const handleCancel = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 8000);
  };
  return (
    <div className="max-h-[75vh] overflow-auto scrollbar-thin">
      <Form {...dataSourceForm}>
        <form onSubmit={dataSourceForm.handleSubmit(onSubmit)}>
          <div className="flex gap-3 pb-2">
            <Button
              type="button"
              disabled={isTesting}
              onClick={handleTestConnection}
              className="bg-slate-400"
            >
              {isTesting ? (
                <Spinner color="white" size="20" />
              ) : (
                <p>Test Connection</p>
              )}
            </Button>

            <Button
              disabled={
                dataSourceForm.getValues().datasource_name === "" ||
                dataSourceForm.getValues().description === "" ||
                isLoading
              }
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 hover:text-white text-white"
            >
              {isLoading ? <Spinner size="20" color="white" /> : "Submit"}
            </Button>
            <AlertDialogCancel disabled={isLoading} onClick={handleCancel}>
              Close
            </AlertDialogCancel>
          </div>
          <h5>*Indicates required field</h5>

          <FormField
            control={dataSourceForm.control}
            name="datasource_name"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <label className="w-[50%] text-right mt-1 text-amber-800">
                  * Datasource Name
                </label>
                <FormControl>
                  <Input
                    {...field}
                    required
                    type="text"
                    autoFocus
                    className="py-3 h-0 w-[50%]"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={dataSourceForm.control}
            name="description"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <label className="w-[50%] text-right mt-1 text-amber-800">
                  Description
                </label>
                <FormControl>
                  <Input
                    {...field}
                    required
                    type="text"
                    className="py-3 h-0 w-[50%]"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={dataSourceForm.control}
            name="application_type"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <label className="w-[50%] text-right mt-1 text-amber-800">
                  Application Type
                </label>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an Application Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {applicationTypes.map((item) => (
                          <SelectItem
                            key={item.def_application_type_id}
                            value={item.application_type}
                          >
                            {item.application_type}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={dataSourceForm.control}
            name="application_type_version"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <label className="w-[50%] text-right mt-1 text-amber-800">
                  Application Type Versions
                </label>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an Application Type Version" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {versions.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={dataSourceForm.control}
            name="default_datasource"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <label className="w-[49%] text-right text-amber-800">
                  Default Source
                </label>
                <FormControl>
                  <Input
                    {...field}
                    type="checkbox"
                    checked={field.value === "true"}
                    onChange={(e) => {
                      field.onChange(e.target.checked ? "true" : "false");
                    }}
                    className="h-4 w-4 mt-0"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="flex gap-3 items-center justify-center">
            <label className="w-[50%] text-right text-amber-800">
              Connector Type
            </label>
            <p className="w-[50%]">Default</p>
          </div>
          <div className="flex gap-3 items-center justify-center">
            <label className="w-[50%] text-right text-amber-800">
              Synchronization Type
            </label>
            <p className="w-[50%]">Transaction, Access</p>
          </div>

          {/* Connector Properties */}
          <div
            className={`${
              open ? "bg-slate-50" : ""
            } flex flex-col rounded p-2 mt-2`}
          >
            <div className="flex gap-3 font-bold">
              <ChevronDown
                onClick={openProperties}
                className={`p-1 shadow-2xl rounded shadow-slate-400 cursor-pointer ${
                  open ? "bg-slate-300" : "bg-slate-50"
                }`}
              />
              <h4>Connector Properties</h4>
            </div>
            <div className={`${open ? "block" : "hidden"}`}>
              <FormField
                control={dataSourceForm.control}
                name="connection_type"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <label className="w-[44%] text-right mt-1 text-amber-800">
                      Connection Type
                    </label>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        className="py-3 h-0 w-[50%]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={dataSourceForm.control}
                name="host"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <label className="w-[44%] text-right mt-1 text-amber-800">
                      Hostname
                    </label>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        className="py-3 h-0 w-[50%]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={dataSourceForm.control}
                name="database_name"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <label className="w-[44%] text-right mt-1 text-amber-800">
                      Database Name
                    </label>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        className="py-3 h-0 w-[50%]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={dataSourceForm.control}
                name="port" // Renamed to "password" to match field name
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <label className="w-[44%] text-right mt-1 text-amber-800">
                      Port
                    </label>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        className="py-3 h-0 w-[50%]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={dataSourceForm.control}
                name="username" // Renamed to "password" to match field name
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <label className="w-[44%] text-right mt-1 text-amber-800">
                      Username
                    </label>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        className="py-3 h-0 w-[50%]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={dataSourceForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <label className="w-[44%] text-right mt-1 text-amber-800">
                      * Password
                    </label>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        className="py-3 h-0 w-[50%]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-semibold text-slate-700">
                    Additional Parameters
                  </h5>
                  <button
                    type="button"
                    onClick={() => append({ key: "", value: "" })}
                    className="text-sm text-blue-600"
                  >
                    + Add
                  </button>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 mb-2">
                    <FormField
                      control={dataSourceForm.control}
                      name={`additional_params.${index}.key`}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Key"
                          className="w-[45%]"
                        />
                      )}
                    />

                    <FormField
                      control={dataSourceForm.control}
                      name={`additional_params.${index}.value`}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Value"
                          className="w-[45%]"
                        />
                      )}
                    />

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      </Form>

      {/* <Form {...datasource}>
        <form>
         
        </form>
      </Form> */}
    </div>
  );
};

export default Modal;
