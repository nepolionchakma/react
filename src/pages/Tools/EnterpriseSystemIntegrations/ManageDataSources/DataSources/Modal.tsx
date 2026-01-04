import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
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
import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { toTitleCase } from "@/Utility/general";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

interface IDataSourceAddDataTypes {
  action: string;
  setAction: React.Dispatch<React.SetStateAction<string>>;
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedDataSourceItem: IDataSourceTypes | undefined;
  setSave: Dispatch<SetStateAction<number>>;
  setSelectedDataSourceItem: React.Dispatch<
    React.SetStateAction<IDataSourceTypes | undefined>
  >;
  connectorProperties: IDataSourceConnectorProperties | undefined;
}
const Modal: FC<IDataSourceAddDataTypes> = ({
  action,
  selectedDataSourceItem,
  setSave,
  setSelectedDataSourceItem,
  connectorProperties,
  setAction,
  openModal,
  setOpenModal,
}) => {
  const { token } = useGlobalContext();
  const [applicationTypes, setApplicationTypes] = useState<IApplicationType[]>(
    []
  );
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

  console.log(selectedDataSourceItem);

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

  const dataSourceForm = useForm<z.infer<typeof dataSourceSchema>>({
    resolver: zodResolver(dataSourceSchema),
    defaultValues: {
      datasource_name:
        action === "edit" ? selectedDataSourceItem?.datasource_name : "",
      description: action === "edit" ? selectedDataSourceItem?.description : "",
      application_type:
        action === "edit" ? selectedDataSourceItem?.application_type : "",
      application_type_version:
        action === "edit"
          ? selectedDataSourceItem?.application_type_version
          : "",
      last_access_synchronization_date:
        action === "edit"
          ? selectedDataSourceItem?.last_access_synchronization_date
          : new Date(),
      last_access_synchronization_status:
        action === "edit"
          ? selectedDataSourceItem?.last_access_synchronization_status
          : "COMPLETED",
      last_transaction_synchronization_date:
        action === "edit"
          ? selectedDataSourceItem?.last_transaction_synchronization_date
          : new Date(),
      last_transaction_synchronization_status:
        action === "edit"
          ? selectedDataSourceItem?.last_transaction_synchronization_status
          : "COMPLETED",
      default_datasource:
        action === "edit"
          ? selectedDataSourceItem?.default_datasource
          : "false",
      connection_type:
        action === "edit" ? connectorProperties?.connection_type : "",
      host: action === "edit" ? connectorProperties?.host : "",
      database_name:
        action === "edit" ? connectorProperties?.database_name : "",
      port: action === "edit" ? connectorProperties?.port?.toString() : "",
      username: action === "edit" ? connectorProperties?.username : "",
      password: action === "edit" ? connectorProperties?.password : "",
      additional_params:
        action === "edit"
          ? mapAdditionalParamsToArray(connectorProperties?.additional_params)
          : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: dataSourceForm.control,
    name: "additional_params",
  });

  useEffect(() => {
    if (action === "edit") {
      const fetchDataFromAPI = async () => {
        if (selectedDataSourceItem) {
          const response = await loadData({
            baseURL: FLASK_URL,
            url: `${flaskApi.DefDataSources}?def_data_source_id=${selectedDataSourceItem.def_data_source_id}`,
            accessToken: token.access_token,
          });
          console.log(response, "response");
          dataSourceForm.reset({
            datasource_name: response.result.datasource_name ?? "",
            description: response.result.description ?? "",
            application_type: response.result.application_type ?? "",
            application_type_version:
              response.result.application_type_version ?? "",
            default_datasource: response.result.default_datasource ?? "false",
            last_access_synchronization_date: new Date(
              response.result.last_access_synchronization_date
            ),
            last_access_synchronization_status:
              response.result.last_access_synchronization_status ?? "COMPLETED",
            last_transaction_synchronization_date: new Date(
              response.result.last_transaction_synchronization_date
            ),
            last_transaction_synchronization_status:
              response.result.last_transaction_synchronization_status ??
              "COMPLETED",

            // connector properties (merge here)
            connection_type: connectorProperties?.connection_type ?? "",
            host: connectorProperties?.host ?? "",
            username: connectorProperties?.username ?? "",
            password: connectorProperties?.password ?? "",
            database_name: connectorProperties?.database_name ?? "",
            port: connectorProperties?.port?.toString() ?? "",
            additional_params:
              mapAdditionalParamsToArray(
                connectorProperties?.additional_params
              ) ?? [],
          });

          // Sync form with fetched data
        } else return;
      };
      fetchDataFromAPI();
    }
  }, [
    action,
    selectedDataSourceItem,
    dataSourceForm,
    connectorProperties,
    token.access_token,
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
          setSelectedDataSourceItem(undefined);
          dataSourceForm.reset();
        }
      }
    } else {
      const dataSourcePutParams = {
        baseURL: FLASK_URL,
        url: `${flaskApi.DefDataSources}?def_data_source_id=${selectedDataSourceItem?.def_data_source_id}`,
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
          setSelectedDataSourceItem(undefined);
          dataSourceForm.reset();
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

  const handleClose = () => {
    setAction("");
    setOpenModal(false);
  };
  return (
    <>
      {openModal && action && (
        <CustomModal4 className="w-[700px] h-auto">
          <div className="flex justify-between bg-[#CEDEF2] p-4">
            <h3 className="font-semibold capitalize">
              {toTitleCase(action)} Data Source
            </h3>
            <X onClick={handleClose} className="cursor-pointer" />
          </div>

          <Form {...dataSourceForm}>
            <form onSubmit={dataSourceForm.handleSubmit(onSubmit)}>
              <div className="max-h-[75vh] overflow-auto scrollbar-thin p-4">
                <div className="flex justify-between">
                  <div className="flex flex-col gap-3 w-[48%]">
                    <FormField
                      control={dataSourceForm.control}
                      name="datasource_name"
                      render={({ field }) => (
                        <FormItem>
                          <label>* Datasource Name</label>
                          <FormControl>
                            <Input {...field} required type="text" autoFocus />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={dataSourceForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <label>* Description</label>
                          <FormControl>
                            <Textarea {...field} required />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={dataSourceForm.control}
                      name="application_type"
                      render={({ field }) => (
                        <FormItem>
                          <label>* Application Type</label>
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
                        <FormItem>
                          <label>* Application Type Version</label>
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
                          <label>Default Source</label>
                          <FormControl>
                            <Input
                              {...field}
                              type="checkbox"
                              checked={field.value === "true"}
                              onChange={(e) => {
                                field.onChange(
                                  e.target.checked ? "true" : "false"
                                );
                              }}
                              className="h-4 w-4 mt-0"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-3 items-center">
                      <label>Connector Type:</label>
                      <p>Default</p>
                    </div>
                    <div className="flex gap-3 items-center">
                      <label>Synchronization Type:</label>
                      <p>Transaction, Access</p>
                    </div>
                  </div>
                  <Separator orientation="vertical" />

                  {/* <div className="bg-gray-300 w-[0.5px]  py-4"></div> */}

                  {/* Connector Properties */}
                  <div className="flex flex-col gap-3 w-[48%]">
                    <FormField
                      control={dataSourceForm.control}
                      name="connection_type"
                      render={({ field }) => (
                        <FormItem>
                          <label>* Connection Type</label>
                          <FormControl>
                            <Input {...field} type="text" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={dataSourceForm.control}
                      name="host"
                      render={({ field }) => (
                        <FormItem>
                          <label>* Hostname</label>
                          <FormControl>
                            <Input {...field} type="text" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={dataSourceForm.control}
                      name="database_name"
                      render={({ field }) => (
                        <FormItem>
                          <label>Database Name</label>
                          <FormControl>
                            <Input {...field} type="text" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={dataSourceForm.control}
                      name="port" // Renamed to "password" to match field name
                      render={({ field }) => (
                        <FormItem>
                          <label>Port</label>
                          <FormControl>
                            <Input {...field} type="text" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={dataSourceForm.control}
                      name="username" // Renamed to "password" to match field name
                      render={({ field }) => (
                        <FormItem>
                          <label>Username</label>
                          <FormControl>
                            <Input {...field} type="text" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={dataSourceForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <label>* Password</label>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <label>Additional Parameters</label>
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

                <div className="flex justify-end gap-3 mt-4">
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
                </div>
              </div>
            </form>
          </Form>
        </CustomModal4>
      )}
    </>
  );
};

export default Modal;
