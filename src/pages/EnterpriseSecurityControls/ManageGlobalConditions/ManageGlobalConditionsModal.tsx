import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { IManageGlobalConditionTypes } from "@/types/interfaces/ManageAccessEntitlements.interface";
import { FC, useEffect, useState } from "react";
import { ring } from "ldrs";
import { useAACContext } from "@/Context/ManageAccessEntitlements/AdvanceAccessControlsContext";
import CustomDropDown from "@/components/CustomDropDown/CustomDropDown";
import { postData } from "@/Utility/funtion";
import { FLASK_URL } from "@/Api/Api";
import { flaskApi } from "@/Api/Api";
interface IManageGlobalConditionProps {
  selectedItem?: IManageGlobalConditionTypes;
}

const statusData = ["Active", "Inactive"];

const ManageGlobalConditionsModal: FC<IManageGlobalConditionProps> = () => {
  const {
    setIsOpenManageGlobalConditionModal,
    isLoading,
    setIsLoading,
    setStateChange,
    dataSources,
  } = useAACContext();
  const [datasourceOption, setDatasourceOption] = useState("Select an option");
  const [status, setStatus] = useState("Select an option");
  const [datasourceNames, setDatasourceNames] = useState<string[]>([]);

  useEffect(() => {
    setDatasourceNames(dataSources.map((item) => item.datasource_name));
  }, [dataSources]);

  const FormSchema = z.object({
    name: z.string(),
    description: z.string(),
    datasource: z.string(),
    status: z.string(),
  });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      description: "",
      datasource: "",
      status: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const postPayload = {
      name: data.name,
      description: data.description,
      datasource: datasourceOption,
      status: status,
    };
    const postParams = {
      baseURL: FLASK_URL,
      url: flaskApi.DefGlobalConditions,
      setLoading: setIsLoading,
      payload: postPayload,
    };

    const res = await postData(postParams);
    // const res = await createManageGlobalCondition(postData);
    if (res) {
      setStateChange((prev) => prev + 1);
      setIsOpenManageGlobalConditionModal(false);
      form.reset();
    }
  }

  ring.register();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2"
      >
        <div className="grid grid-cols-2 gap-2 p-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input required placeholder="Name" {...field} />
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
                  <Input required placeholder="Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="datasource"
            render={() => (
              <FormItem>
                <FormLabel>Datasource</FormLabel>
                <CustomDropDown
                  data={datasourceNames}
                  option={datasourceOption}
                  setOption={setDatasourceOption}
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={() => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <CustomDropDown
                  data={statusData}
                  option={status}
                  setOption={setStatus}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit">
            {isLoading ? (
              <l-ring
                size="20"
                stroke="5"
                bg-opacity="0"
                speed="2"
                color="white"
              ></l-ring>
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
export default ManageGlobalConditionsModal;
