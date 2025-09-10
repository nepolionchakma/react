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
import { ring } from "ldrs";
import { postData, putData } from "@/Utility/funtion";
import { FLASK_URL } from "@/Api/Api";
import { flaskApi } from "@/Api/Api";
import { useState } from "react";
import CustomModal3 from "@/components/CustomModal/CustomModal3";
import { X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { IManageControlEnvironments } from "@/types/interfaces/manageControlEnvironments.interface";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";

interface Props {
  modalType: string;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  controlEnvironment?: IManageControlEnvironments;
  setControlEnvironments: React.Dispatch<
    React.SetStateAction<IManageControlEnvironments[]>
  >;
  setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>;
  setState: React.Dispatch<React.SetStateAction<number>>;
  setSelectedItems: React.Dispatch<
    React.SetStateAction<IManageControlEnvironments[]>
  >;
}

const Modal = ({
  modalType,
  setShowModal,
  controlEnvironment,
  setControlEnvironments,
  setSelectedIds,
  setState,
  setSelectedItems,
}: Props) => {
  const { token } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);

  const FormSchema = z.object({
    name: z.string(),
    description: z.string(),
  });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: modalType === "Add" ? "" : controlEnvironment?.name,
      description: modalType === "Add" ? "" : controlEnvironment?.description,
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const payload = {
      name: data.name,
      description: data.description,
    };

    const postParams = {
      baseURL: FLASK_URL,
      url: flaskApi.DefControlEnvironments,
      setLoading: setIsLoading,
      payload: payload,
      isToast: true,
      accessToken: token.access_token,
    };

    const putParams = {
      baseURL: FLASK_URL,
      url: `${flaskApi.DefControlEnvironments}?control_environment_id=${controlEnvironment?.control_environment_id}`,
      setLoading: setIsLoading,
      payload: payload,
      isToast: true,
      accessToken: token.access_token,
    };

    if (modalType === "Add") {
      const res = await postData(postParams);

      if (res.status === 201) {
        // setControlEnvironments((prev) => [res.data.result, ...prev]);
        form.reset();
        setState((prev) => prev + 1);
        setShowModal(false);
        setSelectedIds([]);
        setSelectedItems([]);
      }
    }

    if (modalType === "Edit") {
      const res = await putData(putParams);

      if (res.status === 200) {
        setControlEnvironments((prev) => {
          const newEnvironments = prev.filter(
            (item) =>
              item.control_environment_id !==
              res.data.result.control_environment_id
          );
          return [res.data.result, ...newEnvironments];
        });
        form.reset();
        // setState((prev) => prev + 1);
        setShowModal(false);
        setSelectedIds([]);
        setSelectedItems([]);
      }
    }

    // const res = await createManageGlobalCondition(postData);
  }

  ring.register();

  return (
    <CustomModal3>
      <div className="flex justify-between p-2 bg-slate-300 rounded-t-lg">
        <h2 className="font-bold">{modalType} Control Environment</h2>
        <X onClick={() => setShowModal(false)} className="cursor-pointer" />
      </div>
      <div className="px-6 py-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-2"
          >
            <div className="flex flex-col gap-4">
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
      </div>
    </CustomModal3>
  );
};
export default Modal;
