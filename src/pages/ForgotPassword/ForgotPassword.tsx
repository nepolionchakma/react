import { FLASK_URL, flaskApi, NODE_URL, nodeApi } from "@/Api/Api";
import CustomDropDown from "@/components/CustomDropDown/CustomDropDown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
// import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { IJobTitle, ITenantsTypes } from "@/types/interfaces/users.interface";
import { loadData, postData } from "@/Utility/funtion";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  user_name: z.string().min(2, "Type at least 2 character"),
  email_address: z.string().email("Enter valid email"),
});

export const ForgotPassword = () => {
  //   const { enterpriseSetting } = useGlobalContext();
  const [tenants, setTenants] = useState<ITenantsTypes[]>([]);
  const [jobTitles, setJobTitles] = useState<IJobTitle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tenantName, setTenantName] = useState("Select your tenant");
  const [jobTitleName, setJobTitleName] = useState("Select your job Title");

  /** Define form */
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_name: "",
      email_address: "",
    },
  });

  const selectedTenantId = tenants.find(
    (t) => t.tenant_name === tenantName
  )?.tenant_id;

  useEffect(() => {
    const fetchTenantsData = async () => {
      const params = {
        baseURL: FLASK_URL,
        url: flaskApi.DefTenants,
      };
      const res = await loadData(params);
      if (res) {
        setTenants(res);
      }
    };
    fetchTenantsData();
  }, []);

  useEffect(() => {
    if (!selectedTenantId) return;
    const jobTitlesParams = {
      baseURL: FLASK_URL,
      url: `${flaskApi.JobTitles}?tenant_id=${selectedTenantId}`,
    };
    const fetchJobTitleNames = async () => {
      const res = await loadData(jobTitlesParams);
      if (res.length > 0) {
        setJobTitles(res);
      } else {
        setJobTitles([]);
        setJobTitleName("Select your job Title");
      }
    };
    fetchJobTitleNames();
  }, [selectedTenantId]);

  /** Submit function */
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const forgotPasswordPayload = {
      user_name: values.user_name,
      email_address: values.email_address,
      tenant_id: selectedTenantId,
      job_title: jobTitleName,
      validity: "1h",
    };

    const postParams = {
      baseURL: NODE_URL,
      url: `${nodeApi.ForgotPassword}`,
      setLoading: setIsLoading,
      payload: forgotPasswordPayload,
      isToast: true,
    };
    const res = await postData(postParams);
    if (res.length > 0) {
      form.reset();
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-[500px]">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <div className="rounded-full p-2 bg-NAVY-100 flex justify-center items-center">
                <KeyRound size={24} color="black" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-base font-semibold">Forgot your password?</p>
                <p className="text-[13px] font-normal">
                  Sent request for new password.
                </p>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-col gap-3">
                <FormField
                  control={form.control}
                  name="user_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className=" font-normal">Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-normal">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-between gap-2">
                  <div className="flex flex-col gap-2 w-full">
                    <p className="text-sm">Tenant Name</p>
                    <CustomDropDown
                      data={tenants.map(
                        (item: ITenantsTypes) => item.tenant_name
                      )}
                      option={tenantName}
                      setOption={setTenantName}
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <p className="text-sm">JobTitle Name</p>
                    <CustomDropDown
                      data={jobTitles?.map(
                        (item: IJobTitle) => item.job_title_name
                      )}
                      option={jobTitleName}
                      setOption={setJobTitleName}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-5">
                <Button type="submit" className="w-1/3">
                  {isLoading ? (
                    <l-tailspin
                      size="30"
                      stroke="5"
                      speed="0.9"
                      color="white"
                    ></l-tailspin>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
