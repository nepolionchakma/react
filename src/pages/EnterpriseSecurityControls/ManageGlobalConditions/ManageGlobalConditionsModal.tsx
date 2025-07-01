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
import { IManageGlobalConditionTypes } from "@/types/interfaces/ManageAccessEntitlements.interface";
import { FC, useEffect, useState } from "react";
import { ring } from "ldrs";
import { useAACContext } from "@/Context/ManageAccessEntitlements/AdvanceAccessControlsContext";
import CustomDropDown from "@/components/CustomDropDown/CustomDropDown";
interface IManageGlobalConditionProps {
  selectedItem?: IManageGlobalConditionTypes;
}
const ManageGlobalConditionsModal: FC<IManageGlobalConditionProps> = () => {
  // const { updateManageAccessEntitlements, isLoading, setSelected, table } =
  //   useManageAccessEntitlementsContext();
  const {
    createManageGlobalCondition,
    manageGlobalConditions,
    isLoading,
    dataSources,
  } = useAACContext();
  const [datasourceOption, setDatasourceOption] = useState("Select an option");
  const [datasourceNames, setDatasourceNames] = useState<string[]>([]);
  const maxId = Math.max(
    ...manageGlobalConditions.map((item) => item.def_global_condition_id)
  );

  useEffect(() => {
    setDatasourceNames(dataSources.map((item) => item.datasource_name));
  }, [dataSources]);

  const FormSchema = z.object({
    name: z.string(),
    description: z.string(),
    datasource: z.string(),
    status: z.string().min(3, {
      message: "Select a option",
    }),
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
    const postData = {
      def_global_condition_id: maxId,
      name: data.name,
      description: data.description,
      datasource: datasourceOption,
      status: data.status,
    };
    const res = await createManageGlobalCondition(postData);
    if (res) {
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
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  required
                  value={field.value} // Use value instead of defaultValue
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
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
