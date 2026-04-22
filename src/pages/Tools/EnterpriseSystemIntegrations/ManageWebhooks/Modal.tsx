import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toTitleCase } from "@/Utility/general";
import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { loadData, postData, putData } from "@/Utility/funtion";
import Spinner from "@/components/Spinner/Spinner";
import { Button } from "@/components/ui/button";
import { IWebhook } from "@/types/interfaces/webhook.interface";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { ControllerRenderProps, useForm } from "react-hook-form";

interface Props {
  action: string;
  setAction: React.Dispatch<React.SetStateAction<string>>;
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedItems: IWebhook[];
  setState: React.Dispatch<React.SetStateAction<number>>;
}

const Modal = ({
  action,
  setAction,
  openModal,
  setOpenModal,
  selectedItems,
  setState,
}: Props) => {
  const { token, enterpriseSetting } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tables, setTables] = useState<string[]>([]);
  const httpMethods = ["POST", "PUT", "DELETE"];
  const activeOptions = ["Y", "N"];

  const weebhookSchema = z.object({
    webhook_name: z.string(),
    webhook_url: z.string(),
    table_name: z.string(),
    http_methods: z.array(z.string()),
    secret_key: z.string().nullable().optional(),
    is_active: z.string(),
    max_retries: z.coerce.number(),
  });

  type webhookForm = z.infer<typeof weebhookSchema>;

  const form = useForm<webhookForm>({
    resolver: zodResolver(weebhookSchema),
    defaultValues: {
      webhook_name: action === "edit" ? selectedItems[0].webhook_name : "",
      webhook_url: action === "edit" ? selectedItems[0].webhook_url : "",
      table_name: action === "edit" ? selectedItems[0].table_name : "",
      http_methods:
        action === "edit" && selectedItems[0].http_methods.length > 0
          ? selectedItems[0].http_methods.map((v) => v)
          : [],
      secret_key: action === "edit" ? (selectedItems[0].secret_key ?? "") : "",
      is_active: action === "edit" ? selectedItems[0].is_active : "",
      max_retries: action === "edit" ? selectedItems[0].max_retries : 0,
    },
  });

  const selectedMethods = form.watch("http_methods");

  useEffect(() => {
    const fetchTables = async () => {
      const loadParams = {
        baseURL: FLASK_URL,
        url: `/datasource/metadata?datasource_name=PRO_CG`,
        setLoading: setIsLoading,
        accessToken: token.access_token,
        // isToast?: boolean;
      };

      const res = await loadData(loadParams);
      if (res) {
        const appSchema = res.result.find(
          (item: any) => item.schema === "apps",
        );
        setTables(appSchema.tables);
      }
    };

    fetchTables();
  }, [token.access_token]);

  useEffect(() => {
    if (!openModal) return; // 🔥 KEY FIX

    if (action === "edit" && selectedItems[0]) {
      const fetchWebhook = async () => {
        const res = await loadData({
          baseURL: FLASK_URL,
          url: `${flaskApi.Webhook}?webhook_id=${selectedItems[0].webhook_id}`,
          setLoading: setIsLoading,
          accessToken: token.access_token,
        });

        form.reset({
          webhook_name: res.result.webhook_name,
          webhook_url: res.result.webhook_url,
          table_name: res.result.table_name,
          http_methods: res.result.http_methods || [],
          secret_key: res.result.secret_key ?? "",
          is_active: res.result.is_active,
          max_retries: res.result.max_retries,
        });
      };

      fetchWebhook();
    }

    if (action === "add") {
      form.reset({
        webhook_name: "",
        webhook_url: "",
        table_name: "",
        http_methods: [],
        secret_key: "",
        is_active: "",
        max_retries: 0,
      });
    }
  }, [action, selectedItems, token.access_token, openModal]);

  const handleClose = () => {
    setOpenModal(false);
    setAction("");
  };

  const onSelectMethod = (
    method: string,
    field: ControllerRenderProps<
      z.infer<typeof weebhookSchema>,
      "http_methods"
    >,
  ) => {
    const current = field.value ?? [];
    if (current.includes(method)) {
      field.onChange(current.filter((m) => m !== method));
    } else {
      field.onChange([...current, method]);
    }
  };

  const onSubmit = async (data: webhookForm) => {
    console.log(data);
    const payload = {
      webhook_name: data.webhook_name,
      webhook_url: data.webhook_url,
      table_name: data.table_name,
      tenant_id: enterpriseSetting?.tenant_id,
      http_methods: data.http_methods,
      secret_key: data.secret_key,
      is_active: data.is_active,
      max_retries: Number(data.max_retries),
    };

    const params = {
      baseURL: FLASK_URL,
      url:
        action === "add"
          ? flaskApi.Webhook
          : `${flaskApi.Webhook}?webhook_id=${selectedItems[0].webhook_id}`,
      setLoading: setIsSubmitting,
      payload,
      isToast: true,
      accessToken: token.access_token,
    };

    if (action === "add") {
      const res = await postData(params);
      if (res.status === 201) {
        setState((prev) => prev + 1);
        form.reset();
        handleClose();
      }
    } else {
      const res = await putData(params);
      if (res.status === 200) {
        setState((prev) => prev + 1);
        form.reset();
        handleClose();
      }
    }
  };

  return (
    <>
      {action && openModal && (
        <CustomModal4 className="w-[800px] h-auto">
          <div className="flex justify-between bg-[#CEDEF2] p-4">
            <h3 className="font-semibold capitalize">
              {toTitleCase(action)} Webhook
            </h3>
            <X onClick={handleClose} className="cursor-pointer" />
          </div>

          <div className="max-h-[90vh] p-4 overflow-auto scrollbar-thin">
            {isLoading ? (
              <div className="w-full flex justify-center">
                <Spinner size="40" color="black" />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="webhook_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-normal">
                            Webhook Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              required
                              autoFocus
                              type="text"
                              placeholder="Webhook Name"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="webhook_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-normal">
                            Webhook URL
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              required
                              autoFocus
                              type="text"
                              placeholder="Webhook URL"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="table_name"
                      render={({ field }) => (
                        <FormItem>
                          <label>Table Name</label>
                          <FormControl>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a Table Name" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-[250px]">
                                <SelectGroup>
                                  {tables?.sort().map((item) => (
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
                      control={form.control}
                      name="http_methods"
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormLabel className="font-normal">
                              HTTP Methods
                            </FormLabel>
                            <Popover>
                              <PopoverTrigger className="border rounded px-3 py-2 text-left flex justify-between">
                                {field.value.length > 0
                                  ? field.value.join(", ")
                                  : "Select Roles"}
                                <ChevronDown size={20} color="gray" />
                              </PopoverTrigger>

                              <PopoverContent className="p-0 w-64">
                                <Command>
                                  <CommandGroup>
                                    {httpMethods.map((m) => (
                                      <CommandItem
                                        key={m}
                                        onSelect={() =>
                                          onSelectMethod(m, field)
                                        }
                                      >
                                        <Check
                                          className={`mr-2 h-4 w-4 ${
                                            field.value.includes(m)
                                              ? "opacity-100"
                                              : "opacity-0"
                                          }`}
                                        />
                                        <span className="capitalize">{m}</span>
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
                      name="secret_key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-normal">
                            Secret Key
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? undefined
                                    : e.target.value,
                                )
                              }
                              type="password"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem>
                          <label>Is Active</label>
                          <FormControl>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Is Active" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectGroup>
                                  {activeOptions.map((item) => (
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
                      control={form.control}
                      name="max_retries"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-normal">
                            Max Retries
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              required
                              autoFocus
                              type="number"
                              placeholder="Max Retries"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting || selectedMethods.length === 0}
                    >
                      {isSubmitting ? (
                        <Spinner size="20" color="white" />
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
