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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { loadData, postData } from "@/Utility/funtion";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IJobTitle } from "@/types/interfaces/users.interface";

import { Eye, EyeOff } from "lucide-react";
import { flaskApi } from "@/Api/Api";

function InvitationRedirectPage() {
  // const fullUrl = window.location.origin + location.pathname + location.search;
  // console.log(fullUrl);
  const [isLoading, setIsLoading] = useState(false);
  // const nodeUrl = import.meta.env.VITE_NODE_ENDPOINT_URL;
  const flaskUrl = import.meta.env.VITE_FLASK_ENDPOINT_URL;
  const [isValid, setIsValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [tenantName, setTenantName] = useState<string | undefined>(undefined);
  const [response, setResponse] = useState("");
  const [state, setState] = useState(0);
  const navigate = useNavigate();
  // const [tenantId, setTenantId] = useState<number | null>(null);
  const [jobTitles, setJobTitles] = useState<IJobTitle[] | undefined>([]);

  const { encrypted_id } = useParams();

  const FormSchema = z
    .object({
      user_type: z.string(),
      user_name: z.string(),
      first_name: z.string(),
      middle_name: z.string().optional(),
      last_name: z.string().optional(),
      date_of_birth: z.string().date(),
      job_title_id: z.string(),
      tenant_id: z.string().optional(),
      email_address: z.string().email(),
      password: z.string().min(8, {
        message: "At least 8 characters.",
      }),
      confirm_password: z.string().min(8, {
        message: "At least 8 characters need.",
      }),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: "Passwords don't match",
      path: ["confirm_password"],
    });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      user_name: "",
      user_type: "person",
      email_address: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      date_of_birth: new Date().toISOString().split("T")[0],
      job_title_id: "",
      password: "",
      confirm_password: "",
    },
  });
  const { reset } = form;
  const handleReset = () => {
    reset();
  };

  useEffect(() => {
    if (!encrypted_id) return;
    (async () => {
      const loadParams = {
        baseURL: flaskUrl,
        url: `${flaskApi.Invitation}/${encrypted_id}`,
        setLoading: setIsLoading,
        // accessToken: decryptedToken,
      };

      const res = await loadData(loadParams);

      if (res.invited_by) {
        setIsValid(res.valid);
        setResponse(res.message);
        setJobTitles(res.job_titles);
        setTenantName(res.tenant_name);
        form.setValue("email_address", res.email);
      } else {
        setIsValid(res.valid);
        setResponse(res.message);
      }
    })();
  }, [flaskUrl, encrypted_id, state, form]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const postPayload = {
      user_type: data.user_type,
      user_name: data.user_name,
      email_address: data.email_address,
      first_name: data.first_name,
      middle_name: data.middle_name,
      last_name: data.last_name,
      date_of_birth: data.date_of_birth,
      job_title_id: data.job_title_id,
      password: data.password,
    };

    // console.log(postPayload);
    const params = {
      baseURL: flaskUrl,
      url: `${flaskApi.Invitation}/accept/${encrypted_id}`,
      setLoading: setIsLoading,
      payload: postPayload,
      // isConsole?: boolean;
      isToast: true,
    };

    try {
      const res = await postData(params);
      if (res.status === 201) {
        setState((prev) => prev + 9749.27529);
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
    } finally {
      reset();
    }
  };

  // useEffect(() => {
  //   const loadJobTitles = async () => {
  //     if (!decryptedTenantId) return;
  //     const params = {
  //       baseURL: FLASK_URL,
  //       url: `${flaskApi.JobTitles}?tenant_id=${Number(decryptedTenantId)}`,
  //       accessToken: decryptedToken as string,
  //     };

  //     const res = await loadData(params);

  //     if (res.length > 0) {
  //       setJobTitles(res);
  //     } else {
  //       form.resetField("job_title_id");
  //       setJobTitles([]);
  //     }
  //   };
  //   loadJobTitles();
  // }, [form]);

  useEffect(() => {
    const isMobile =
      /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        navigator.userAgent,
      );
    if (isValid && isMobile) {
      const appLink = `PROCG://invitation/${encrypted_id}`;

      const openApp = () => {
        window.location.href = appLink;
      };

      openApp();

      // setTimeout(() => {
      //   if (/android/i.test(navigator.userAgent)) {
      //     window.location.href =
      //       "https://play.google.com/store/apps/details?id=gov.bbg.voa";
      //   } else if (/iphone|ipad/i.test(navigator.userAgent)) {
      //     window.location.href = "https://apps.apple.com/app/myapp/id123456789";
      //   } else {
      //     window.location.href =
      //       "https://play.google.com/store/apps/details?id=gov.bbg.voa";
      //   }
      // }, 1000);
    }
  }, [encrypted_id, isValid]);

  return (
    <div className="flex justify-center items-center h-screen">
      {isLoading ? (
        "Loading..."
      ) : (
        <div>
          <div>
            {isValid ? (
              <div className="flex flex-col gap-2">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-2 gap-3">
                      {/* <FormField
                        control={form.control}
                        name="user_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-normal">
                              User Type
                            </FormLabel>
                            <Select
                              required
                              onValueChange={(value) => {
                                setUserType(value);
                                field.onChange(value);
                              }}
                              value={field.value}
                            >
                          </FormItem>
                        )}
                      /> */}

                      <FormField
                        control={form.control}
                        name="user_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-normal">
                              Username
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                required
                                autoFocus
                                type="text"
                                placeholder="Username"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        disabled={true}
                        // control={form.control}
                        name="tenant_id"
                        render={() => (
                          <FormItem>
                            <FormLabel className="font-normal">
                              Tenant Name
                            </FormLabel>
                            <Input
                              required
                              disabled
                              type="text"
                              placeholder="Tenant Name"
                              value={tenantName}
                            />
                          </FormItem>
                        )}
                      />
                      {/* <FormField
                        disabled={true}
                        control={form.control}
                        name="tenant_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-normal">
                              Tenant Name
                            </FormLabel>

                            <Select
                              required
                              onValueChange={(value) => {
                                field.onChange(value);
                              }}
                              defaultValue={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger disabled>
                                  <SelectValue placeholder="Select a Tenant" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {tenants?.map((tenant) => (
                                  <SelectItem
                                    value={String(tenant.tenant_id)}
                                    key={tenant.tenant_id}
                                  >
                                    {tenant.tenant_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      /> */}

                      <FormField
                        control={form.control}
                        name="job_title_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-normal">
                              Job Title
                            </FormLabel>
                            <Select
                              required
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a Job Title" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {jobTitles?.map((job) => (
                                  <SelectItem
                                    value={String(job.job_title_id)}
                                    key={job.job_title_id}
                                  >
                                    {job.job_title_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-normal">
                              First Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                required
                                type="text"
                                placeholder="First Name"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="middle_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-normal">
                              Middle Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                placeholder="Middle Name"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-normal">
                              Last Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                placeholder="Last Name"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="date_of_birth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-normal">
                              Date of Birth
                            </FormLabel>
                            <FormControl>
                              <Input {...field} type="date" />
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
                              <Input
                                {...field}
                                disabled
                                // defaultValue={invitedEmail || ""}
                                type="text"
                                placeholder="example@email.com"
                                multiple={true}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel className="font-normal">
                                Password
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    {...field}
                                    required
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowPassword((prev) => !prev)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 bg-white"
                                  >
                                    {showPassword ? <EyeOff /> : <Eye />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        control={form.control}
                        name="confirm_password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-normal">
                              Confirm Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  required
                                  type={showPassword2 ? "text" : "password"}
                                  placeholder="••••••••"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowPassword2((prev) => !prev)
                                  }
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 bg-white"
                                >
                                  {showPassword2 ? <EyeOff /> : <Eye />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {/* {userType === "system" ? (
                      <p className="text-red-500 text-center py-2 flex justify-center items-center gap-2">
                        <l-hourglass
                          size="20"
                          bg-opacity="0.1"
                          speed="1.75"
                          color="red"
                        ></l-hourglass>{" "}
                        Login as a Admin.
                      </p>
                    ) : (
                      ""
                    )} */}
                    <div className="flex gap-4 pt-4 justify-end">
                      <Button
                        className="bg-white text-red-400 hover:text-Red-100 font-bold hover:bg-white border hover:shadow"
                        onClick={handleReset}
                      >
                        Reset Form
                      </Button>
                      <Button type="submit" className="hover:shadow">
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
              </div>
            ) : (
              <div>
                <p>{response}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default InvitationRedirectPage;
