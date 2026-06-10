import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import Spinner from "@/components/Spinner/Spinner";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { loadData, postData, putData } from "@/Utility/funtion";
import { toTitleCase } from "@/Utility/general";
import { ITaskGroup } from "@/types/interfaces/ARM.interface";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  action: string;
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedItems: ITaskGroup[];
  setState: React.Dispatch<React.SetStateAction<number>>;
}

const Modal = ({
  openModal,
  action,
  selectedItems,
  setOpenModal,
  setState,
}: Props) => {
  const { token } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const FormSchema = z.object({
    group_name: z.string(),
    description: z.string(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      group_name: action === "Edit" ? selectedItems[0]?.group_name : "",
      description: action === "Edit" ? selectedItems[0]?.description : "",
    },
  });

  const handleClose = () => {
    setOpenModal(false);
  };

  useEffect(() => {
    if (!openModal) return; // 🔥 KEY FIX

    if (action === "edit" && selectedItems[0]) {
      const fetchTaskGroup = async () => {
        const res = await loadData({
          baseURL: FLASK_URL,
          url: `${flaskApi.TaskGroups}?group_id=${selectedItems[0].group_id}`,
          setLoading: setIsLoading,
          accessToken: token.access_token,
        });

        form.reset({
          group_name: res.result[0].group_name,
          description: res.result[0].description,
        });
      };

      fetchTaskGroup();
    }

    if (action === "add") {
      form.reset({
        group_name: "",
        description: "",
      });
    }
  }, [action, selectedItems, token.access_token, openModal, form]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (action === "add") {
      const postParams = {
        baseURL: FLASK_URL,
        url: flaskApi.TaskGroups,
        setLoading: setIsSubmitting,
        payload: {
          group_name: data.group_name,
          description: data.description,
        },
        //   isConsole?: boolean;
        isToast: true,
        accessToken: token.access_token,
      };

      const res = await postData(postParams);
      if (res.status === 201) {
        form.reset();
        setState((prev) => prev + 1);
      }
    } else {
      const putParams = {
        baseURL: FLASK_URL,
        url: `${flaskApi.TaskGroups}?group_id=${selectedItems[0].group_id}`,
        setLoading: setIsSubmitting,
        payload: {
          group_name: data.group_name,
          description: data.description,
        },
        //   isConsole?: boolean;
        isToast: true,
        accessToken: token.access_token,
      };

      const res = await putData(putParams);
      if (res.status === 200) {
        setState((prev) => prev + 1);
      }
    }
  };
  return (
    <>
      {openModal && (
        <CustomModal4 className="w-[700px] h-auto">
          <div className="flex justify-between bg-[#CEDEF2] p-4">
            <h3 className="font-semibold capitalize">
              {toTitleCase(action)} Task Group
            </h3>
            <X onClick={handleClose} className="cursor-pointer" />
          </div>

          <div className="max-h-[90vh] overflow-auto scrollbar-thin">
            {isLoading ? (
              <div className="w-full flex justify-center p-4">
                <Spinner size="40" color="black" />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="p-4 space-y-4">
                    <FormField
                      control={form.control}
                      name="group_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-normal">
                            Task Group Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              autoFocus
                              type="text"
                              placeholder="Task Group Name"
                            />
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
                          <FormLabel className="font-normal">
                            Description
                          </FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-4 p-4 justify-end">
                    <Button
                      disabled={isSubmitting}
                      type="submit"
                      className="hover:shadow disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <Spinner size="30" color="white" />
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
