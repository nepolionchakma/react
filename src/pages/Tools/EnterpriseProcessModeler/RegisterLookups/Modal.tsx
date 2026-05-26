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
import { FLASK_URL } from "@/Api/Api";
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
import { ILookup } from "@/types/interfaces/orchestration.interface";
import { Textarea } from "@/components/ui/textarea";
import { useFieldArray, useForm } from "react-hook-form";

interface Props {
  action: string;
  setAction: React.Dispatch<React.SetStateAction<string>>;
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedItems: ILookup[];
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

  const LookupValueSchema = z.object({
    value_code: z.string().min(1),
    value_label: z.string().min(1),
    description: z.string(),
    active_yn: z.enum(["Y", "N"]),
    lookup_value_id: z.number().optional().nullable(),
  });

  const LookupSchema = z.object({
    lookup_code: z.string().min(1),
    lookup_name: z.string().min(1),
    description: z.string(),
    active_yn: z.enum(["Y", "N"]),

    values: z
      .array(LookupValueSchema)
      .max(3, "Values can not contain more than 3 items"),
  });

  type lookupForm = z.infer<typeof LookupSchema>;

  const form = useForm<lookupForm>({
    resolver: zodResolver(LookupSchema),
    defaultValues: {
      lookup_code: action === "edit" ? selectedItems[0].lookup_code : "",
      lookup_name: action === "edit" ? selectedItems[0].lookup_name : "",
      description: action === "edit" ? selectedItems[0].description : "",
      active_yn: action === "edit" ? selectedItems[0].active_yn : "N",
      values:
        action === "edit" && selectedItems[0].values.length > 0
          ? selectedItems[0].values
          : [],
    },
  });

  const {
    fields: valueFields,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: "values",
  });

  useEffect(() => {
    if (!openModal) return; // 🔥 KEY FIX

    if (action === "edit" && selectedItems[0]) {
      const fetchLookup = async () => {
        const res = await loadData({
          baseURL: FLASK_URL,
          url: `/lookup_with_values?lookup_id=${selectedItems[0].lookup_id}`,
          setLoading: setIsLoading,
          accessToken: token.access_token,
        });

        form.reset({
          lookup_code: res.result.lookup_code,
          lookup_name: res.result.lookup_name,
          description: res.result.description,
          active_yn: res.result.active_yn || "N",
          values: res.result.values || [],
        });
      };

      fetchLookup();
    }

    if (action === "add") {
      form.reset({
        lookup_code: "",
        lookup_name: "",
        description: "",
        active_yn: "N",
        values: [],
      });
    }
  }, [action, selectedItems, token.access_token, openModal, form]);

  const handleClose = () => {
    setOpenModal(false);
    setAction("");
  };

  const onSubmit = async (data: lookupForm) => {
    const payload = {
      lookup_code: data.lookup_code,
      lookup_name: data.lookup_name,
      description: data.description,
      active_yn: data.active_yn,
      values: data.values,
    };
    if (action === "add") {
      const params = {
        baseURL: FLASK_URL,
        url: `/def_lookup_with_values`,
        setLoading: setIsSubmitting,
        payload,
        isToast: true,
        accessToken: token.access_token,
      };
      console.log(params);
      const res = await postData(params);
      if (res.status === 201) {
        console.log("succesful");
        setState((prev) => prev + 1);
        form.reset();
        handleClose();
      }
    } else {
      const params = {
        baseURL: FLASK_URL,
        url: `def_lookup_with_values?lookup_id=${selectedItems[0].lookup_id}`,
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
                      name="lookup_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lookup Code</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lookup_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lookup Name</FormLabel>
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

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold text-lg">Values</h2>

                      <Button
                        type="button"
                        variant="outline"
                        disabled={valueFields.length >= 3}
                        onClick={() =>
                          append({
                            lookup_value_id: null,
                            value_code: "",
                            value_label: "",
                            description: "",
                            active_yn: "Y",
                          })
                        }
                      >
                        Add Value
                      </Button>
                    </div>

                    {valueFields.map((item, index) => (
                      <div
                        key={item.id}
                        className="border rounded-lg p-4 space-y-4"
                      >
                        <div className="grid grid-cols-4 gap-4">
                          <FormField
                            control={form.control}
                            name={`values.${index}.lookup_value_id`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Value Id</FormLabel>
                                <FormControl>
                                  <Input
                                    disabled
                                    {...field}
                                    value={field.value ?? ""}
                                    onChange={(e) =>
                                      field.onChange(
                                        e.target.value === null
                                          ? null
                                          : Number(e.target.value),
                                      )
                                    }
                                    type="number"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`values.${index}.value_code`}
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
                            name={`values.${index}.value_label`}
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
                            name={`values.${index}.active_yn`}
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
                            name={`values.${index}.description`}
                            render={({ field }) => (
                              <FormItem className="col-span-4">
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="destructive"
                            disabled={valueFields.length === 1}
                            onClick={() => remove(index)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
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
