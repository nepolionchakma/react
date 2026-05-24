import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { IAPIEndpoint } from "@/types/interfaces/apiEndpoints.interface";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
  const methods = ["GET", "POST", "DELETE", "PUT"];

  const FormSchema = z.object({
    api_endpoint: z.string(),
    parameter1: z.string(),
    parameter2: z.string(),
    method: z.string(),
    privilege_id: z.string(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      api_endpoint: action === "Edit" ? selectedItems[0]?.api_endpoint : "",
      parameter1: action === "Edit" ? selectedItems[0]?.parameter1 : "",
      parameter2: action === "Edit" ? selectedItems[0]?.parameter2 : "",
      method: action === "Edit" ? selectedItems[0]?.method : "",
      privilege_id:
        action === "Edit" ? selectedItems[0]?.privilege_id.toString() : "",
    },
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
          parameter1: res.result.parameter1 || "",
          parameter2: res.result.parameter2 || "",
          method: res.result.method,
          privilege_id: res.result.privilege_id,
        });
      };

      fetchEndpoint();
    }

    if (action === "add") {
      form.reset({
        api_endpoint: "",
        parameter1: "",
        parameter2: "",
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
          parameter1: data.parameter1,
          parameter2: data.parameter2,
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
          parameter1: data.parameter1,
          parameter2: data.parameter2,
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
        <CustomModal4 className="w-[400px] h-auto">
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
                  <div className="px-4 mt-4">
                    <FormField
                      control={form.control}
                      name="api_endpoint"
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
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 p-4 gap-4 max-h-[70vh] overflow-auto">
                    <FormField
                      control={form.control}
                      name="parameter1"
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormLabel className="font-normal">
                              Parameter 1
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                autoFocus
                                type="text"
                                placeholder="Parameter 1"
                              />
                            </FormControl>
                          </FormItem>
                        );
                      }}
                    />
                    <FormField
                      control={form.control}
                      name="parameter2"
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormLabel className="font-normal">
                              Parameter 2
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                autoFocus
                                type="text"
                                placeholder="Parameter 2"
                              />
                            </FormControl>
                          </FormItem>
                        );
                      }}
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
                                <SelectValue placeholder="Select Privilege" />
                              </SelectTrigger>
                            </FormControl>

                            <SelectContent>
                              {privileges.map((item) => (
                                <SelectItem
                                  key={item.privilege_id}
                                  value={item.privilege_id.toString()}
                                  className="capitalize"
                                >
                                  {item.privilege_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
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
