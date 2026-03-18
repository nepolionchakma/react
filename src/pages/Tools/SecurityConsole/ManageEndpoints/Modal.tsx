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

interface Props {
  action: string;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedEndPoints: IAPIEndpoint[];
  setReloadController: React.Dispatch<React.SetStateAction<number>>;
}

const Modal = ({
  action,
  selectedEndPoints,
  setShowModal,
  setReloadController,
}: Props) => {
  const { token } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);
  const methods = ["GET", "POST", "DELETE", "PUT"];
  const [privileges, setPrivileges] = useState<IPrivilege[]>([]);
  const FormSchema = z.object({
    api_endpoint_id: z.number(),
    api_endpoint: z.string(),
    parameter1: z.string(),
    parameter2: z.string(),
    method: z.string(),
    privilege_id: z.number(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      api_endpoint_id:
        action === "Edit" ? selectedEndPoints[0]?.api_endpoint_id : 0,
      api_endpoint: action === "Edit" ? selectedEndPoints[0]?.api_endpoint : "",
      parameter1: action === "Edit" ? selectedEndPoints[0]?.parameter1 : "",
      parameter2: action === "Edit" ? selectedEndPoints[0]?.parameter2 : "",
      method: action === "Edit" ? selectedEndPoints[0]?.method : "",
      privilege_id: action === "Edit" ? selectedEndPoints[0]?.privilege_id : 0,
    },
  });
  useEffect(() => {
    const fetchData = async () => {
      const privilegesParams = {
        baseURL: FLASK_URL,
        url: flaskApi.DefPrivileges,
        accessToken: token.access_token as string,
      };
      const privilegesRes = await loadData(privilegesParams);
      if (privilegesRes) {
        setPrivileges(privilegesRes);
      }
    };

    fetchData();
  }, [token.access_token]);

  const handleClose = () => {
    setShowModal(false);
  };

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (action === "Add") {
      const postParams = {
        baseURL: FLASK_URL,
        url: flaskApi.APIEndpoints,
        setLoading: setIsLoading,
        payload: {
          api_endpoint_id: Number(data.api_endpoint_id),
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

      const res = await postData(postParams);
      if (res.status === 201) {
        form.reset();
        setReloadController((prev) => prev + 1);
      }
    } else {
      const putParams = {
        baseURL: FLASK_URL,
        url: `${flaskApi.APIEndpoints}?api_endpoint_id=${data.api_endpoint_id}`,
        setLoading: setIsLoading,
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
        setReloadController((prev) => prev + 1);
      }
    }
  };
  return (
    <CustomModal4 className="w-[400px] h-auto">
      <div className="flex justify-between bg-[#CEDEF2] p-2">
        <h3 className="font-semibold capitalize">{action} Endpoint</h3>
        <X onClick={handleClose} className="cursor-pointer" />
      </div>

      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 p-4 gap-4 max-h-[70vh] overflow-auto">
              <FormField
                control={form.control}
                name="api_endpoint_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-normal">Endpoint Id</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Endpoint Id"
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="api_endpoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-normal">Endpoint Name</FormLabel>
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

              <FormField
                control={form.control}
                name="parameter1"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel className="font-normal">Parameter 1</FormLabel>
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
                      <FormLabel className="font-normal">Parameter 2</FormLabel>
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
                    <FormLabel className="font-normal">Privilege Id</FormLabel>

                    <Select
                      value={field.value.toString()}
                      onValueChange={(value) => {
                        field.onChange(Number(value));
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Privilege Id" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {privileges.map((item) => (
                          <SelectItem
                            key={item.privilege_id}
                            value={item.privilege_id.toString()}
                          >
                            {item.privilege_id}
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
                disabled={isLoading}
                type="submit"
                className="hover:shadow disabled:cursor-not-allowed"
              >
                {isLoading ? <Spinner size="30" color="white" /> : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </CustomModal4>
  );
};

export default Modal;
