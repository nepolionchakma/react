import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
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
import { IApplicationType } from "@/types/interfaces/datasource.interface";
import { toTitleCase } from "@/Utility/general";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { loadData, postData, putData } from "@/Utility/funtion";
import Spinner from "@/components/Spinner/Spinner";
import { Button } from "@/components/ui/button";

interface Props {
  action: string;
  setAction: React.Dispatch<React.SetStateAction<string>>;
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedItems: IApplicationType[];
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

  const applicationTypeSchema = z.object({
    application_type: z.string().min(1, "Application type is required"),
    versions: z
      .array(
        z.object({
          value: z.string().min(1, "Version is required"),
        })
      )
      .min(1, "At least one version is required"),
    description: z.string().optional(),
  });

  type ApplicationTypeForm = z.infer<typeof applicationTypeSchema>;

  const form = useForm<ApplicationTypeForm>({
    resolver: zodResolver(applicationTypeSchema),
    defaultValues: {
      application_type:
        action === "edit" ? selectedItems[0].application_type : "",
      versions:
        action === "edit" && selectedItems[0].versions.length > 0
          ? selectedItems[0].versions.map((v) => ({ value: v }))
          : [{ value: "" }],
      description: action === "edit" ? selectedItems[0].description : "",
    },
  });

  const { fields, append, remove } = useFieldArray<
    ApplicationTypeForm,
    "versions"
  >({
    control: form.control,
    name: "versions",
  });

  useEffect(() => {
    if (action === "edit") {
      const fetchApplicationType = async () => {
        if (selectedItems[0]) {
          const loadParams = {
            baseURL: FLASK_URL,
            url: `${flaskApi.ApplicationTypes}?def_application_type_id=${selectedItems[0].def_application_type_id}`,
            setLoading: setIsLoading,
            accessToken: token.access_token,
            // isToast?: boolean;
          };

          const res = await loadData(loadParams);

          form.reset({
            application_type: res.result.application_type,
            versions: res.result.versions.map((v: string) => ({ value: v })),
            description: res.result.description,
          });

          // Sync form with fetched data
        } else return;
      };
      fetchApplicationType();
    }
  }, [action, form, selectedItems, token.access_token]);

  const handleClose = () => {
    setAction("");
    setOpenModal(false);
  };

  const onSubmit = async (data: ApplicationTypeForm) => {
    const payload = {
      application_type: data.application_type,
      versions: data.versions.map((v) => v.value),
      description: data.description,
    };

    const params = {
      baseURL: FLASK_URL,
      url:
        action === "add"
          ? flaskApi.ApplicationTypes
          : `${flaskApi.ApplicationTypes}?def_application_type_id=${selectedItems[0].def_application_type_id}`,
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
        <CustomModal4 className="w-[500px] h-auto">
          <div className="flex justify-between bg-[#CEDEF2] p-4">
            <h3 className="font-semibold capitalize">
              {toTitleCase(action)} Application Type
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
                  <div className="flex flex-col gap-4">
                    <FormField
                      control={form.control}
                      name="application_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-normal">
                            Application Type
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              required
                              autoFocus
                              type="text"
                              placeholder="application type"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="versions"
                      render={() => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="font-normal">
                              Versions
                            </FormLabel>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => append({ value: "" })}
                            >
                              + Add Version
                            </Button>
                          </div>

                          <div className="mt-2 flex flex-col gap-2">
                            {fields.map((item, index) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-2"
                              >
                                <Input
                                  placeholder={`Version ${index + 1}`}
                                  {...form.register(
                                    `versions.${index}.value` as const
                                  )}
                                />

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => remove(index)}
                                  disabled={fields.length === 1}
                                >
                                  ✕
                                </Button>
                              </div>
                            ))}
                          </div>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <label>Description</label>
                          <FormControl>
                            <Input {...field} type="text" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <Spinner size="20" color="white" />
                        ) : (
                          "Submit"
                        )}
                      </Button>
                    </div>
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
