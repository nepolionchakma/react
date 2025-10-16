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
import { useParams } from "react-router-dom";
import { IJobTitle, ITenantsTypes } from "@/types/interfaces/users.interface";

import { Eye, EyeOff } from "lucide-react";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import CryptoJS from "crypto-js";

function InvitationRedirectPage() {
  // const fullUrl = window.location.origin + location.pathname + location.search;
  // console.log(fullUrl);
  const [isLoading, setIsLoading] = useState(false);
  const nodeUrl = import.meta.env.VITE_NODE_ENDPOINT_URL;
  const crptoSecretKey = import.meta.env.VITE_CRYPTO_SECRET_KEY;
  const [isValid, setIsValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  // const [userType, setUserType] = useState<string>("person");
  const [tenants, setTenants] = useState<ITenantsTypes[] | undefined>([]);
  const [response, setResponse] = useState("");
  const [state, setState] = useState(0);
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [jobTitles, setJobTitles] = useState<IJobTitle[] | undefined>([]);

  const { user_invitation_id, token } = useParams();

  const decrypt = (value: string) => {
    try {
      // Decode URL-safe string
      const decoded = decodeURIComponent(value);

      const bytes = CryptoJS.AES.decrypt(decoded, crptoSecretKey);
      const plaintext = bytes.toString(CryptoJS.enc.Utf8);

      return plaintext; // original string
    } catch (error) {
      console.error("Decryption failed:", error);
      return null;
    }
  };

  const decryptedUserInvitaitionId = decrypt(user_invitation_id as string);
  const decryptedToken = decrypt(token as string);

  const FormSchema = z
    .object({
      user_type: z.string(),
      user_name: z.string(),
      first_name: z.string(),
      middle_name: z.string().optional(),
      last_name: z.string().optional(),
      job_title: z.string(),
      tenant_id: z.string(),
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
      tenant_id: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      job_title: "",
      password: "",
      confirm_password: "",
    },
  });
  const { reset } = form;
  const handleReset = () => {
    reset();
  };

  // const urlParams = new URLSearchParams(window.location.search);
  // const token = urlParams.get("token");

  useEffect(() => {
    const fetchTenantsData = async () => {
      const params = {
        baseURL: FLASK_URL,
        url: flaskApi.DefTenants,
        setLoading: setIsLoading,
        accessToken: decryptedToken as string,
      };
      try {
        const res = await loadData(params);
        if (res) {
          setTenants(res);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchTenantsData();
  }, [decryptedToken]);

  useEffect(() => {
    if (!decryptedToken) return;
    (async () => {
      console.log(
        `/invitation/verify?user_invitation_id=${Number(
          decryptedUserInvitaitionId
        )}&token=${decryptedToken}`
      );
      const postParams = {
        baseURL: nodeUrl,
        url: `/invitation/verify?user_invitation_id=${Number(
          decryptedUserInvitaitionId
        )}&token=${decryptedToken}`,
        setLoading: setIsLoading,
        accessToken: decryptedToken,
      };

      const res = await loadData(postParams);
      console.log(res, "res");
      if (res) {
        setIsValid(res.valid);
        setResponse(res.message);
      }
    })();
  }, [nodeUrl, decryptedToken, decryptedUserInvitaitionId, state]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const postPayload = {
      user_type: data.user_type,
      user_name: data.user_name,
      email_address: data.email_address,

      tenant_id: Number(data.tenant_id),
      first_name: data.first_name,
      middle_name: data.middle_name,
      last_name: data.last_name,
      job_title: data.job_title,
      password: data.password,
      user_invitation_id: Number(decryptedUserInvitaitionId),
    };

    console.log(postPayload);
    const params = {
      baseURL: FLASK_URL,
      url: `/users`,
      setLoading: setIsLoading,
      payload: postPayload,
      // isConsole?: boolean;
      isToast: true,
      accessToken: decryptedToken as string,
    };

    try {
      const res = await postData(params);
      if (res.status === 201) {
        setState((prev) => prev + 9749.27529);
      }
    } catch (error) {
      console.log(error);
    } finally {
      reset();
    }
  };

  useEffect(() => {
    const loadJobTitles = async () => {
      if (!tenantId) return;
      const params = {
        baseURL: FLASK_URL,
        url: `${flaskApi.JobTitles}?tenant_id=${tenantId}`,
        accessToken: decryptedToken as string,
      };

      const res = await loadData(params);

      if (res.length > 0) {
        setJobTitles(res);
      } else {
        form.resetField("job_title");
        setJobTitles([]);
      }
    };
    loadJobTitles();
  }, [decryptedToken, tenantId, form]);

  useEffect(() => {
    if (token && isValid) {
      const appLink = `PROCG://invitation/${user_invitation_id}/${token}`;

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
  }, [isValid, token, user_invitation_id]);

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
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a User" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {UserTypes.map((user) => (
                                  <SelectItem
                                    value={user.user_type}
                                    key={user.user_type}
                                    onChange={() => setUserType(user.user_type)}
                                  >
                                    {user.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                        control={form.control}
                        name="tenant_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-normal">
                              Tenant ID
                            </FormLabel>

                            <Select
                              required
                              onValueChange={(value) => {
                                setTenantId(Number(value));
                                field.onChange(value);
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a Tenant" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {tenants?.map((tenant) => (
                                  <SelectItem
                                    value={String(tenant.tenant_id)}
                                    key={tenant.tenant_id}
                                    onChange={() =>
                                      setTenantId(tenant.tenant_id)
                                    }
                                  >
                                    {tenant.tenant_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="job_title"
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
                                    value={job.job_title_name}
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
                        name="email_address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-normal">Email</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                placeholder="example@email.com, example2@email.com"
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

                <p>To downlod the mobile app</p>
                <p>
                  Android:
                  <a
                    className="text-blue-600 underline"
                    href="https://play.google.com/store/apps/details?id=gov.bbg.voa
"
                  >
                    PROCG Onboarding App
                  </a>
                </p>
                <p>
                  IOS:
                  <a
                    className="text-blue-600 underline"
                    href="https://apps.apple.com/app/myapp/id123456789"
                  >
                    PROCG Onboarding App
                  </a>
                </p>
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
