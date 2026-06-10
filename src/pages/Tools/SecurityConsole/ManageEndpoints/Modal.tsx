import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { IAPIEndpoint } from "@/types/interfaces/apiEndpoints.interface";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/Spinner/Spinner";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { loadData, postData, putData } from "@/Utility/funtion";
import { IPrivilege } from "@/types/interfaces/users.interface";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toTitleCase } from "@/Utility/general";

interface Props {
  action: string;
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedItems: IAPIEndpoint[];
  setState: React.Dispatch<React.SetStateAction<number>>;
  privileges: IPrivilege[];
}

const Modal = ({
  openModal,
  action,
  selectedItems,
  setOpenModal,
  setState,
  privileges,
}: Props) => {
  const { token } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"];

  const ApiParameterSchema = z.object({
    name: z.string(),
    type: z.string(),
    location: z.enum(["path", "query", "body"]),
    required: z.boolean(),
  });

  const FormSchema = z.object({
    api_endpoint: z.string(),
    api_name: z.string(),
    parameters: z.array(ApiParameterSchema),
    method: z.string(),
    privilege_id: z.string(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      api_endpoint: action === "Edit" ? selectedItems[0]?.api_endpoint : "",
      api_name: action === "Edit" ? selectedItems[0]?.api_name : "",
      parameters: action === "Edit" ? selectedItems[0]?.parameters : [],
      method: action === "Edit" ? selectedItems[0]?.method : "",
      privilege_id:
        action === "Edit" ? selectedItems[0]?.privilege_id.toString() : "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "parameters",
  });

  const handleClose = () => {
    setOpenModal(false);
  };

  useEffect(() => {
    if (!openModal) return; // 🔥 KEY FIX

    if (action === "edit" && selectedItems[0]) {
      const fetchEndpoint = async () => {
        const res = await loadData({
          baseURL: FLASK_URL,
          url: `${flaskApi.APIEndpoints}?api_endpoint_id=${selectedItems[0].api_endpoint_id}`,
          setLoading: setIsLoading,
          accessToken: token.access_token,
        });

        form.reset({
          api_endpoint: res.result.api_endpoint,
          api_name: res.result.api_name,
          parameters: res.result.parameters || [],
          method: res.result.method,
          privilege_id: String(res.result.privilege_id),
        });
      };

      fetchEndpoint();
    }

    if (action === "add") {
      form.reset({
        api_endpoint: "",
        api_name: "",
        parameters: [],
        method: "",
        privilege_id: "",
      });
    }
  }, [action, selectedItems, token.access_token, openModal, form]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (action === "add") {
      const postParams = {
        baseURL: FLASK_URL,
        url: flaskApi.APIEndpoints,
        setLoading: setIsSubmitting,
        payload: {
          api_endpoint: data.api_endpoint,
          api_name: data.api_name,
          parameters: data.parameters,
          method: data.method,
          privilege_id: Number(data.privilege_id),
        },
        //   isConsole?: boolean;
        isToast: true,
        accessToken: token.access_token,
      };
      console.log(postParams);

      const res = await postData(postParams);
      if (res.status === 201) {
        form.reset();
        setState((prev) => prev + 1);
      }
    } else {
      const putParams = {
        baseURL: FLASK_URL,
        url: `${flaskApi.APIEndpoints}?api_endpoint_id=${selectedItems[0].api_endpoint_id}`,
        setLoading: setIsSubmitting,
        payload: {
          api_endpoint: data.api_endpoint,
          api_name: data.api_name,
          parameters: data.parameters,
          method: data.method,
          privilege_id: Number(data.privilege_id),
        },
        //   isConsole?: boolean;
        isToast: true,
        accessToken: token.access_token,
      };

      const res = await putData(putParams);
      if (res.status === 200) {
        setState((prev) => prev + 1);
      }
    }
  };
  return (
    <>
      {openModal && (
        <CustomModal4 className="w-[700px] h-auto">
          <div className="flex justify-between bg-[#CEDEF2] p-4">
            <h3 className="font-semibold capitalize">
              {toTitleCase(action)} API Endpoint
            </h3>
            <X onClick={handleClose} className="cursor-pointer" />
          </div>

          <div className="max-h-[90vh] overflow-auto scrollbar-thin">
            {isLoading ? (
              <div className="w-full flex justify-center p-4">
                <Spinner size="40" color="black" />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-2 p-4 gap-4">
                    <FormField
                      control={form.control}
                      name="api_endpoint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-normal">
                            Endpoint
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              autoFocus
                              type="text"
                              placeholder="Endpoint"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="api_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-normal">
                            Endpoint Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              autoFocus
                              type="text"
                              placeholder="Endpoint Name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-normal">Method</FormLabel>

                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                            }}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                              </SelectTrigger>
                            </FormControl>
                            <FormMessage />

                            <SelectContent>
                              {methods.map((item) => (
                                <SelectItem key={item} value={item}>
                                  {item}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="privilege_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-normal">
                            Privilege
                          </FormLabel>

                          <Select
                            value={field.value.toString()}
                            onValueChange={(value) => {
                              field.onChange(value);
                            }}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  className="capitalize"
                                  placeholder="Select Privilege"
                                />
                              </SelectTrigger>
                            </FormControl>
                            <FormMessage />

                            <SelectContent>
                              {privileges.map((item) => (
                                <SelectItem
                                  key={item.privilege_id}
                                  value={item.privilege_id.toString()}
                                >
                                  {item.privilege_name.toLocaleUpperCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* <div className="grid grid-cols-2 p-4 gap-4">
                    
                  </div> */}

                  <div className="mt-4 px-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold text-lg">Parameters</h2>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          append({
                            name: "",
                            type: "",
                            location: "query",
                            required: false,
                          })
                        }
                      >
                        Add Parameter
                      </Button>
                    </div>

                    <div className="border rounded-md">
                      {fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="col-span-2 p-4 space-y-4"
                        >
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">
                              Parameter {index + 1}
                            </h3>

                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() => remove(index)}
                            >
                              Delete
                            </Button>
                          </div>

                          <div className="grid grid-cols-4 gap-4">
                            {/* Name */}
                            <FormField
                              control={form.control}
                              name={`parameters.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="execution_id"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Type */}
                            <FormField
                              control={form.control}
                              name={`parameters.${index}.type`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Type</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="integer" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Location */}
                            <FormField
                              control={form.control}
                              name={`parameters.${index}.location`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Location</FormLabel>

                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <FormMessage />

                                    <SelectContent>
                                      <SelectItem value="path">Path</SelectItem>
                                      <SelectItem value="query">
                                        Query
                                      </SelectItem>
                                      <SelectItem value="body">Body</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />

                            {/* Required */}
                            <FormField
                              control={form.control}
                              name={`parameters.${index}.required`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Required</FormLabel>

                                  <Select
                                    value={field.value ? "true" : "false"}
                                    onValueChange={(value) =>
                                      field.onChange(value === "true")
                                    }
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <FormMessage />

                                    <SelectContent>
                                      <SelectItem value="true">Yes</SelectItem>
                                      <SelectItem value="false">No</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 justify-end">
                    <Button
                      disabled={isSubmitting}
                      type="submit"
                      className="hover:shadow disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <Spinner size="30" color="white" />
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </CustomModal4>
      )}
    </>
  );
};

export default Modal;
