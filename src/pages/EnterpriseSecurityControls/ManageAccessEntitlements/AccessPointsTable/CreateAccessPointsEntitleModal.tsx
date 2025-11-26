import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useManageAccessEntitlementsContext } from "@/Context/ManageAccessEntitlements/ManageAccessEntitlementsContext";
import { useEffect, useState } from "react";
import { IDataSourceTypes } from "@/types/interfaces/datasource.interface";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { loadData, postData } from "@/Utility/funtion";
import { toast } from "@/components/ui/use-toast";
const AccessPointsEntitleModal = () => {
  const { selectedManageAccessEntitlements, fetchAccessPointsByEntitlementId } =
    useManageAccessEntitlementsContext();
  const { token, setIsOpenModal } = useGlobalContext();
  const [dataSources, setDataSources] = useState<IDataSourceTypes[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const res = async () => {
      const res = await loadData({
        baseURL: FLASK_URL,
        url: flaskApi.DefDataSources,
        accessToken: token.access_token,
        setLoading: () => {},
      });
      setDataSources(res.result);
    };
    res();
  }, [token.access_token]);

  const FormSchema = z.object({
    access_point_name: z.string().min(1, "Required"),
    description: z.string().min(1, "Required"),
    def_data_source_id: z.string().min(1, "Required"),
    platform: z.string().min(1, "Required"),
    access_point_type: z.string().min(1, "Required"),
    access_control: z.string().min(1, "Required"),
    change_control: z.string().min(1, "Required"),
    audit: z.string().min(1, "Required"),
  });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    defaultValues: {
      access_point_name: "",
      description: "",
      def_data_source_id: "",
      platform: "",
      access_point_type: "",
      access_control: "",
      change_control: "",
      audit: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!selectedManageAccessEntitlements) return;
    const postPayload = {
      def_data_source_id: Number(data.def_data_source_id),
      access_point_name: data.access_point_name,
      description: data.description,
      platform: data.platform,
      access_point_type: data.access_point_type,
      access_control: data.access_control,
      change_control: data.change_control,
      audit: data.audit,
      def_entitlement_id: selectedManageAccessEntitlements?.def_entitlement_id,
    };
    (async () => {
      const res = await postData({
        baseURL: FLASK_URL,
        url: flaskApi.DefAccessPoints,
        payload: postPayload,
        accessToken: token.access_token,
        setLoading: setIsLoading,
      });

      if (res.status === 201) {
        toast({
          description: `Added successfully.`,
        });
        fetchAccessPointsByEntitlementId(
          selectedManageAccessEntitlements?.def_entitlement_id
        );
        form.reset();
        setIsOpenModal("");
      }
    })();
    // await fetchAccessPointsEntitlement(selected[0]);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2"
      >
        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="access_point_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Access Point Name</FormLabel>
                <FormControl>
                  <Input placeholder="Access Point Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="def_data_source_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Datasource</FormLabel>
                <Select
                  required
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dataSources.length > 0 ? (
                      <>
                        {dataSources.map((datasource) => (
                          <SelectItem
                            key={datasource.def_data_source_id}
                            value={String(datasource.def_data_source_id)}
                          >
                            {datasource.datasource_name}
                          </SelectItem>
                        ))}
                      </>
                    ) : (
                      <span className="mx-2">No Item Found !!</span>
                    )}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="platform"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform</FormLabel>
                <FormControl>
                  <Input placeholder="Platform" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="access_point_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Access Point Type</FormLabel>
                <FormControl>
                  <Input placeholder="Access Point Type" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="access_control"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Access Control</FormLabel>
                <Select
                  required
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="change_control"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Change Control</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Change Control"
                    {...field}
                    maxLength={10}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="audit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Audit</FormLabel>
                <FormControl>
                  <Input placeholder="Audit" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!form.formState.isValid || isLoading}
            className={
              !form.formState.isValid || isLoading ? "cursor-not-allowed" : ""
            }
          >
            {isLoading ? (
              <l-tailspin
                size="20"
                stroke="5"
                speed="2"
                bg-opacity="0"
                color="white"
              />
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
export default AccessPointsEntitleModal;
