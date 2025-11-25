import CustomModal3 from "@/components/CustomModal/CustomModal3";
import { X } from "lucide-react";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ring } from "ldrs";
import { Textarea } from "@/components/ui/textarea";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { postData, putData } from "@/Utility/funtion";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { IManageControlEnvironments } from "@/types/interfaces/manageControlEnvironments.interface";
interface IManageAccessModelProps {
  setOpenAddModal: React.Dispatch<React.SetStateAction<boolean>>;
  action: string;
  selectedItem?: IManageControlEnvironments;
  setSelectedItem: React.Dispatch<
    React.SetStateAction<IManageControlEnvironments[]>
  >;
  setStateChange: React.Dispatch<React.SetStateAction<number>>;
}
const AddControlEnvironment: FC<IManageAccessModelProps> = ({
  setOpenAddModal,
  action,
  selectedItem,
  setStateChange,
  setSelectedItem,
}) => {
  const { token } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);
  const FormSchema = z.object({
    name: z.string(),
    description: z.string(),
  });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: action === "Edit" ? selectedItem?.name : "",
      description: action === "Edit" ? selectedItem?.description : "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const controlData = {
      name: data.name,
      description: data.description,
    };
    const postControlEnvironment = {
      baseURL: FLASK_URL,
      url: flaskApi.DefControlEnvironments,
      setLoading: setIsLoading,
      payload: controlData,
      isToast: true,
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    };
    const putControlEnvironment = {
      baseURL: FLASK_URL,
      url:
        flaskApi.DefControlEnvironments +
        "?control_environment_id=" +
        selectedItem?.control_environment_id,
      setLoading: setIsLoading,
      payload: controlData,
      isToast: true,
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    };

    const res =
      action === "Add"
        ? await postData(postControlEnvironment)
        : await putData(putControlEnvironment);

    if (res.status === 200 || res.status === 201) {
      setStateChange((prev) => prev + Math.random());
      setSelectedItem([]);
      setOpenAddModal(false);
    }
  }

  ring.register();
  return (
    <CustomModal3>
      <div className="flex justify-between p-2 bg-slate-300 rounded-t-lg">
        <h2 className="text-lg font-bold">{action} Environment</h2>
        <X
          onClick={() => {
            setOpenAddModal(false);
          }}
          className="cursor-pointer"
        />
      </div>
      <div className="px-6 py-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 gap-2">
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
                      <Textarea required placeholder="Description" {...field} />
                    </FormControl>
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
      </div>
    </CustomModal3>
  );
};
export default AddControlEnvironment;
