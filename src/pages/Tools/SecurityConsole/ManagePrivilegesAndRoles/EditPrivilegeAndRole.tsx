import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import {
  IPrivilegeAndRole,
  ITenantsTypes,
} from "@/types/interfaces/users.interface";
import { FC, useEffect, useState } from "react";
import { hourglass } from "ldrs";

import { X } from "lucide-react";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { loadData, putData } from "@/Utility/funtion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
interface IAddPrivilegeAndRoleProps {
  selected: IPrivilegeAndRole;
  handleCloseModal: () => void;
}
const EditPrivilegeAndRole: FC<IAddPrivilegeAndRoleProps> = ({
  selected,
  handleCloseModal,
}) => {
  const { token } = useGlobalContext();
  const [tenants, setTenants] = useState<ITenantsTypes[] | undefined>([]);
  const [isLoading, setIsLoading] = useState(false);

  hourglass.register();

  useEffect(() => {
    const fetchTenantsData = async () => {
      const params = {
        baseURL: FLASK_URL,
        url: flaskApi.DefTenants,
        accessToken: token.access_token as string,
      };
      try {
        const res = await loadData(params);
        if (res) {
          setTenants(res);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchTenantsData();
  }, [token.access_token]);

  /** def roles */
  useEffect(() => {
    const fetchRoles = async () => {
      const params = {
        baseURL: FLASK_URL,
        url: flaskApi.DefRoles,
        accessToken: token.access_token as string,
      };
      try {
        const res = await loadData(params);
        if (res) {
          console.log(res);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchRoles();
  }, [token.access_token]);

  const FormSchema = z.object({
    user_name: z.string(),
    tenant_id: z.string(),
    granted_roles: z.string(),
    granted_privileges: z.string(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      user_name: selected.user_name,
      tenant_id: String(selected.tenant_id),
      granted_roles: "",
      granted_privileges: "",
    },
  });
  const { reset } = form;

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const putDataPayload = {
      user_name: data.user_name,
      tenant_id: data.tenant_id,
    };

    const putDataParams = {
      baseURL: FLASK_URL,
      url: `${flaskApi.Users}/${selected.user_id}`,
      setLoading: setIsLoading,
      payload: putDataPayload,
      // isConsole?: boolean;
      isToast: true,
      accessToken: token.access_token,
    };

    const res = await putData(putDataParams);
    if (res) {
      handleCloseModal();

      reset();
    }
  };

  const getTenantName = (id: string) => {
    const tenant = tenants?.find((t) => Number(t.tenant_id) === Number(id));
    return tenant ? tenant?.tenant_name : "Select a Tenant Name";
  };

  return (
    <div className="max-h-96">
      <div className="p-2 bg-slate-300 rounded-t mx-auto text-center font-bold flex justify-between">
        <h1>Edit Manage Privilege and Role</h1>

        <X onClick={() => handleCloseModal()} className="cursor-pointer" />
      </div>
      <div className="px-11 py-3">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="user_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-normal">Username</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoFocus
                        type="text"
                        placeholder="Username"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tenant_id"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel className="font-normal">Tenant Name</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={String(field.value || "")}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue>
                              {getTenantName(field.value)}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tenants?.map((item) => (
                            <SelectItem
                              value={String(item.tenant_id)}
                              key={item.tenant_id}
                            >
                              {item.tenant_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="granted_roles"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel className="font-normal">
                        Granted Roles
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={String(field.value || "")}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue>
                              {getTenantName(field.value)}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tenants?.map((item) => (
                            <SelectItem
                              value={String(item.tenant_id)}
                              key={item.tenant_id}
                            >
                              {item.tenant_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="granted_privileges"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel className="font-normal">
                        Granted Privileges
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={String(field.value || "")}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue>
                              {getTenantName(field.value)}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tenants?.map((item) => (
                            <SelectItem
                              value={String(item.tenant_id)}
                              key={item.tenant_id}
                            >
                              {item.tenant_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  );
                }}
              />
            </div>

            <div className="flex gap-4 pt-4 justify-end">
              <Button type="submit" className="hover:shadow">
                {isLoading ? (
                  <l-tailspin
                    size="30"
                    stroke="5"
                    speed="0.9"
                    color="white"
                  ></l-tailspin>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EditPrivilegeAndRole;
