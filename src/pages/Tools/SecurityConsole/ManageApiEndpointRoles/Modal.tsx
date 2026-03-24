import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { IAPIEndpointRole } from "@/types/interfaces/apiEndpoints.interface";
import { X } from "lucide-react";
import React, { useState } from "react";
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
import { postData, putData } from "@/Utility/funtion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IRole } from "@/types/interfaces/users.interface";

interface Props {
  action: string;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedEndPointRoles: IAPIEndpointRole[];
  setReloadController: React.Dispatch<React.SetStateAction<number>>;
  roles: IRole[] | [];
}

const Modal = ({
  action,
  setShowModal,
  selectedEndPointRoles,
  setReloadController,
  roles,
}: Props) => {
  const { token } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);

  const FormSchema = z.object({
    api_endpoint_id: z.number(),
    role_id: z.number(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      api_endpoint_id:
        action === "Edit" ? selectedEndPointRoles[0]?.api_endpoint_id : 0,
      role_id: action === "Edit" ? selectedEndPointRoles[0]?.role_id : 0,
    },
  });

  const handleClose = () => {
    setShowModal(false);
  };

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (action === "Add") {
      const postParams = {
        baseURL: FLASK_URL,
        url: flaskApi.APIEndpointRoles,
        setLoading: setIsLoading,
        payload: {
          api_endpoint_id: Number(data.api_endpoint_id),
          role_id: Number(data.role_id),
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
        url: `${flaskApi.APIEndpointRoles}?api_endpoint_id=${data.api_endpoint_id}&role_id=${data.role_id}`,
        setLoading: setIsLoading,
        //   payload: {
        //     api_endpoint: data.api_endpoint,
        //     parameter1: data.parameter1,
        //     parameter2: data.parameter2,
        //     method: data.method,
        //     privilege_id: Number(data.privilege_id),
        //   },
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
                name="role_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-normal">Role Id</FormLabel>

                    <Select
                      value={field.value.toString()}
                      onValueChange={(value) => {
                        field.onChange(Number(value));
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Role Id" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {roles.map((item) => (
                          <SelectItem
                            key={item.role_id}
                            value={item.role_id.toString()}
                          >
                            {item.role_name}
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
