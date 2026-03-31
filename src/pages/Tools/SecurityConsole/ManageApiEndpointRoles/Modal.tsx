import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { IAPIEndpointRole } from "@/types/interfaces/apiEndpoints.interface";
import { Check, ChevronDown, X } from "lucide-react";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ControllerRenderProps, useForm } from "react-hook-form";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IRole } from "@/types/interfaces/users.interface";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";

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
    role_ids: z.array(z.number()), // ✅ change to number[]
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      api_endpoint_id:
        action === "Edit" ? selectedEndPointRoles[0]?.api_endpoint_id : 0,
      role_ids:
        action === "Edit"
          ? selectedEndPointRoles[0]?.assigned_roles?.map(
              (item) => item.role_id,
            )
          : [],
    },
  });

  const handleClose = () => {
    setShowModal(false);
  };

  const onSelectRole = (
    roleId: number,
    field: ControllerRenderProps<z.infer<typeof FormSchema>, "role_ids">,
  ) => {
    const current = field.value ?? [];

    if (current.includes(roleId)) {
      field.onChange(current.filter((id) => id !== roleId));
    } else {
      field.onChange([...current, roleId]);
    }
  };

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (action === "Add") {
      const postParams = {
        baseURL: FLASK_URL,
        url: flaskApi.APIEndpointRoles,
        setLoading: setIsLoading,
        payload: {
          api_endpoint_id: Number(data.api_endpoint_id),
          role_ids: data.role_ids,
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
        url: `${flaskApi.APIEndpointRoles}?api_endpoint_id=${data.api_endpoint_id}`,
        setLoading: setIsLoading,
        payload: {
          role_ids: data.role_ids,
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
            <div className="felx flex-col p-4 gap-4 max-h-[70vh] overflow-auto">
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
                name="role_ids"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel className="font-normal">Roles</FormLabel>
                      <Popover>
                        <PopoverTrigger className="border rounded px-3 py-2 text-left flex justify-between w-full">
                          {field.value.length > 0
                            ? field.value
                                .map(
                                  (id) =>
                                    roles.find((r) => r.role_id === id)
                                      ?.role_name,
                                )
                                .join(", ")
                            : "Select Roles"}
                          <ChevronDown size={20} color="gray" />
                        </PopoverTrigger>

                        <PopoverContent className="p-0 w-full">
                          <Command>
                            <CommandGroup>
                              {roles.map((r) => (
                                <CommandItem
                                  key={r.role_id}
                                  onSelect={() =>
                                    onSelectRole(r.role_id, field)
                                  } // ✅ use ID
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      field.value.includes(r.role_id)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    }`}
                                  />
                                  <span className="capitalize">
                                    {r.role_name}
                                  </span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  );
                }}
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
