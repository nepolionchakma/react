import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { toTitleCase } from "@/Utility/general";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { loadData, postData, putData } from "@/Utility/funtion";
import Spinner from "@/components/Spinner/Spinner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ILookup,
  ILookupValue,
} from "@/types/interfaces/orchestration.interface";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";

interface Props {
  action: string;
  setAction: React.Dispatch<React.SetStateAction<string>>;
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedItems: ILookupValue[];
  setState: React.Dispatch<React.SetStateAction<number>>;
  selectedLookup: ILookup | undefined;
}

const Modal = ({
  action,
  setAction,
  openModal,
  setOpenModal,
  selectedItems,
  setState,
  selectedLookup,
}: Props) => {
  const { token } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const LookupValueSchema = z.object({
    value_code: z.string().min(1),
    value_label: z.string().min(1),
    description: z.string(),
    active_yn: z.enum(["Y", "N"]),
  });

  type lookupValueForm = z.infer<typeof LookupValueSchema>;

  const form = useForm<lookupValueForm>({
    resolver: zodResolver(LookupValueSchema),
    defaultValues: {
      value_code: action === "edit" ? selectedItems[0].value_code : "",
      value_label: action === "edit" ? selectedItems[0].value_label : "",
      description: action === "edit" ? selectedItems[0].description : "",
      active_yn: action === "edit" ? selectedItems[0].active_yn : "N",
    },
  });

  useEffect(() => {
    if (!openModal) return; // 🔥 KEY FIX

    if (action === "edit" && selectedItems[0]) {
      const fetchLookup = async () => {
        const res = await loadData({
          baseURL: FLASK_URL,
          url: `${flaskApi.LookupValue}?lookup_value_id=${selectedItems[0].lookup_value_id}`,
          setLoading: setIsLoading,
          accessToken: token.access_token,
        });

        form.reset({
          value_code: res.result.value_code,
          value_label: res.result.value_label,
          description: res.result.description,
          active_yn: res.result.active_yn || "N",
        });
      };

      fetchLookup();
    }

    if (action === "add") {
      form.reset({
        value_code: "",
        value_label: "",
        description: "",
        active_yn: "N",
      });
    }
  }, [action, selectedItems, token.access_token, openModal, form]);

  const handleClose = () => {
    setOpenModal(false);
    setAction("");
  };

  const onSubmit = async (data: lookupValueForm) => {
    const payload = {
      lookup_id: selectedLookup?.lookup_id,
      value_code: data.value_code,
      value_label: data.value_label,
      description: data.description,
      active_yn: data.active_yn,
    };
    if (action === "add") {
      const params = {
        baseURL: FLASK_URL,
        url: `${flaskApi.LookupValue}`,
        setLoading: setIsSubmitting,
        payload,
        isToast: true,
        accessToken: token.access_token,
      };
      const res = await postData(params);
      if (res.status === 201) {
        setState((prev) => prev + 1);
        form.reset();
        handleClose();
      }
    } else {
      const params = {
        baseURL: FLASK_URL,
        url: `${flaskApi.LookupValue}?lookup_value_id=${selectedItems[0].lookup_value_id}`,
        setLoading: setIsSubmitting,
        payload,
        isToast: true,
        accessToken: token.access_token,
      };
      console.log(params);
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
        <CustomModal4 className="w-[800px] overflow-hidden">
          <div className="flex justify-between bg-[#CEDEF2] p-4">
            <h3 className="font-semibold capitalize">
              {toTitleCase(action)} Lookup
            </h3>
            <X onClick={handleClose} className="cursor-pointer" />
          </div>

          <div className="max-h-[70vh] p-4 overflow-auto scrollbar-thin">
            {isLoading ? (
              <div className="w-full flex justify-center">
                <Spinner size="40" color="black" />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="value_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Value Code</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="value_label"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Value Label</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="active_yn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Active</FormLabel>

                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>

                            <SelectContent>
                              <SelectItem value="Y">Yes</SelectItem>
                              <SelectItem value="N">No</SelectItem>
                            </SelectContent>
                          </Select>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="col-span-3">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button type="submit" disabled={isSubmitting}>
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
