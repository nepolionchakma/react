import { zodResolver } from "@hookform/resolvers/zod";
import { ControllerRenderProps, useForm } from "react-hook-form";
import { z } from "zod";

import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import {
  IPrivilege,
  IPrivilegeAndRole,
  IRole,
} from "@/types/interfaces/users.interface";
import { FC, useEffect, useState } from "react";
import { hourglass } from "ldrs";

import { Check, ChevronDown, X } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
interface IAddPrivilegeAndRoleProps {
  selected: IPrivilegeAndRole;
  setStateChange: React.Dispatch<React.SetStateAction<number>>;
  handleCloseModal: () => void;
}
const EditPrivilegeAndRole: FC<IAddPrivilegeAndRoleProps> = ({
  selected,
  setStateChange,
  handleCloseModal,
}) => {
  const { token } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<IRole[]>([]);
  const [privileges, setPrivileges] = useState<IPrivilege[]>([]);

  const FormSchema = z.object({
    user_name: z.string(),
    tenant_id: z.string(),
    granted_roles: z.array(z.string()),
    granted_privileges: z.array(z.string()),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      user_name: selected.user_name,
      tenant_id: String(selected.tenant_id),
      granted_roles: selected.granted_roles.map((r) => r.role_name),
      granted_privileges: selected.granted_privileges.map(
        (p) => p.privilege_name
      ),
    },
  });

  const grantedRoles = form.watch("granted_roles");
  const grantedPrivileges = form.watch("granted_privileges");

  useEffect(() => {
    const fetchData = async () => {
      const rolesParams = {
        baseURL: FLASK_URL,
        url: flaskApi.DefRoles,
        accessToken: token.access_token as string,
      };
      const privilegesParams = {
        baseURL: FLASK_URL,
        url: flaskApi.DefPrivileges,
        accessToken: token.access_token as string,
      };

      /**  runs both API calls at the same time*/
      const [rolesRes, privilegesRes] = await Promise.all([
        loadData(rolesParams),
        loadData(privilegesParams),
      ]);

      if (rolesRes) setRoles(rolesRes);
      if (privilegesRes) setPrivileges(privilegesRes);
    };

    fetchData();
  }, [token.access_token]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const privilege_ids = privileges
      .filter((p) => data.granted_privileges.includes(p.privilege_name))
      .map((p) => p.privilege_id);

    const role_ids = roles
      .filter((r) => data.granted_roles.includes(r.role_name))
      .map((r) => r.role_id);

    const putPrivilegePayload = {
      user_id: selected.user_id,
      privilege_ids,
    };
    const putRolePayload = {
      user_id: selected.user_id,
      role_ids,
    };

    const putPrivilegeParams = {
      baseURL: FLASK_URL,
      url: `${flaskApi.DefUserGrantedPrivileges}?user_id=${selected.user_id}`,
      setLoading: setIsLoading,
      payload: putPrivilegePayload,
      isToast: true,
      accessToken: token.access_token,
    };
    const putRoleParams = {
      baseURL: FLASK_URL,
      url: `${flaskApi.DefUserGrantedRoles}?user_id=${selected.user_id}`,
      setLoading: setIsLoading,
      payload: putRolePayload,
      isToast: true,
      accessToken: token.access_token,
    };

    const [roleRes, privilegeRes] = await Promise.all([
      putData(putRoleParams),
      putData(putPrivilegeParams),
    ]);

    if (roleRes.status === 200 && privilegeRes.status === 200) {
      handleCloseModal();
      setStateChange((prev) => prev * Math.random());
    }
  };

  const onSelectRole = (
    roleName: string,
    field: ControllerRenderProps<z.infer<typeof FormSchema>, "granted_roles">
  ) => {
    const current = field.value ?? [];
    if (current.includes(roleName)) {
      field.onChange(current.filter((r) => r !== roleName));
    } else {
      field.onChange([...current, roleName]);
    }
  };
  const onSelectPrivilege = (
    privilegeName: string,
    field: ControllerRenderProps<
      z.infer<typeof FormSchema>,
      "granted_privileges"
    >
  ) => {
    const current = field.value ?? [];
    if (current.includes(privilegeName)) {
      field.onChange(current.filter((r) => r !== privilegeName));
    } else {
      field.onChange([...current, privilegeName]);
    }
  };

  hourglass.register();
  return (
    <div className="max-h-96">
      <div className="p-2 bg-slate-300 rounded-t mx-auto text-center font-bold flex justify-between">
        <h1>Edit Privileges and Roles</h1>

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
                        disabled
                      />
                    </FormControl>
                  </FormItem>
                )}
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
                      <Popover>
                        <PopoverTrigger className="border rounded px-3 py-2 text-left w-64 flex justify-between">
                          {field.value.length > 0
                            ? field.value.join(", ")
                            : "Select Roles"}
                          <ChevronDown size={20} color="gray" />
                        </PopoverTrigger>

                        <PopoverContent className="p-0 w-64">
                          <Command>
                            <CommandGroup>
                              {roles.map((r) => (
                                <CommandItem
                                  key={r.role_id}
                                  onSelect={() =>
                                    onSelectRole(r.role_name, field)
                                  }
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      field.value.includes(r.role_name)
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
              <FormField
                control={form.control}
                name="granted_privileges"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel className="font-normal">
                        Granted Privileges
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger className="capitalize border rounded px-3 py-2 text-left w-64 flex justify-between">
                          {field.value.length > 0
                            ? field.value.join(", ")
                            : "Select Privieges"}
                          <ChevronDown size={20} color="gray" />
                        </PopoverTrigger>

                        <PopoverContent className="p-0 w-64">
                          <Command>
                            <CommandGroup>
                              {privileges.map((p) => (
                                <CommandItem
                                  className="capitalize"
                                  key={p.privilege_id}
                                  onSelect={() =>
                                    onSelectPrivilege(p.privilege_name, field)
                                  }
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      field.value.includes(p.privilege_name)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    }`}
                                  />
                                  <span className="capitalize">
                                    {p.privilege_name}
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

            <div className="flex gap-4 pt-4 justify-end">
              <Button
                disabled={
                  isLoading ||
                  grantedPrivileges.length === 0 ||
                  grantedRoles.length === 0
                }
                type="submit"
                className="hover:shadow disabled:cursor-not-allowed"
              >
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
