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
import { IManageAccessModelsTypes } from "@/types/interfaces/ManageAccessEntitlements.interface";
import { FC } from "react";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { ring } from "ldrs";
import { useAACContext } from "@/Context/ManageAccessEntitlements/AdvanceAccessControlsContext";
interface IManageAccessEntitlementsProps {
  items: IManageAccessModelsTypes[];
  setOpenAddModal: React.Dispatch<React.SetStateAction<boolean>>;
}
const AddForm: FC<IManageAccessEntitlementsProps> = ({
  // items,
  setOpenAddModal,
}) => {
  const { createDefAccessModel, isLoading } = useAACContext();
  const { token } = useGlobalContext();
  // const maxId = Math.max(...items.map((data) => data.manage_access_model_id));

  const FormSchema = z.object({
    model_name: z.string(),
    description: z.string(),
    type: z.string(),
    state: z.string().min(3, {
      message: "Select a option",
    }),
  });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      model_name: "",
      description: "",
      type: "access",
      state: "approved",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const postData = {
      model_name: data.model_name,
      description: data.description,
      type: data.type,
      state: data.state,
      run_status: "Running",
      created_by: token?.user_id,
      last_updated_by: token?.user_id,
    };

    const res = await createDefAccessModel(postData);
    if (res) {
      setOpenAddModal(false);
      form.reset();
    }
  }

  ring.register();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="model_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model Name</FormLabel>
                <FormControl>
                  <Input required placeholder="Model Name" {...field} />
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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  required
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="access">Access</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <Select
                  required
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="disapproved">Disapproved</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end">
          <Button className="" type="submit">
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
export default AddForm;
