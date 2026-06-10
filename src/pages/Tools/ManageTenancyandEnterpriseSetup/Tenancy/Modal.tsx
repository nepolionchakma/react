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
import { ITenantsTypes } from "@/types/interfaces/users.interface";
import { useForm } from "react-hook-form";

interface Props {
  action: string;
  setAction: React.Dispatch<React.SetStateAction<string>>;
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedItems: ITenantsTypes[];
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
  const { token } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const jobTitleSchema = z.object({
    tenant_name: z.string(),
  });

  type jobTitleForm = z.infer<typeof jobTitleSchema>;

  const form = useForm<jobTitleForm>({
    resolver: zodResolver(jobTitleSchema),
    defaultValues: {
      tenant_name: action === "edit" ? selectedItems[0].tenant_name : "",
    },
  });

  useEffect(() => {
    if (!openModal) return; // 🔥 KEY FIX

    if (action === "edit" && selectedItems[0]) {
      const fetchRole = async () => {
        const res = await loadData({
          baseURL: FLASK_URL,
          url: `tenants/${selectedItems[0].tenant_id}`,
          setLoading: setIsLoading,
          accessToken: token.access_token,
        });

        form.reset({
          tenant_name: res.tenant_name,
        });
      };

      fetchRole();
    }

    if (action === "add") {
      form.reset({
        tenant_name: "",
      });
    }
  }, [action, selectedItems, token.access_token, openModal, form]);

  const handleClose = () => {
    setOpenModal(false);
    setAction("");
  };

  const onSubmit = async (data: jobTitleForm) => {
    if (action === "add") {
      const payload = {
        tenant_name: data.tenant_name,
      };

      const params = {
        baseURL: FLASK_URL,
        url: `${flaskApi.DefTenants}`,
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
      const payload = {
        tenant_name: data.tenant_name,
      };

      const params = {
        baseURL: FLASK_URL,
        url: `${flaskApi.DefTenants}?tenant_id=${selectedItems[0].tenant_id}`,
        setLoading: setIsSubmitting,
        payload,
        isToast: true,
        accessToken: token.access_token,
      };
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
        <CustomModal4 className="w-[400px] h-auto">
          <div className="flex justify-between bg-[#CEDEF2] p-4">
            <h3 className="font-semibold capitalize">
              {toTitleCase(action)} Tenant
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
                  <div>
                    <FormField
                      control={form.control}
                      name="tenant_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-normal">
                            Tenant Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              required
                              autoFocus
                              type="text"
                              placeholder="Tenant Name"
                            />
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
