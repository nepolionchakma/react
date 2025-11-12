import { NODE_URL, nodeApi } from "@/Api/Api";
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
import { loadData, putData } from "@/Utility/funtion";
import { decrypt } from "@/utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon, LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";

type UserInfo = {
  request_id: number;
  request_by: number;
  email: string;
  temporary_password: string;
  access_token: string;
  created_by: number;
  creation_date: Date;
  last_updated_by: string;
  last_updated_date: Date;
};

interface IVerifyUser {
  valid: boolean;
  message: string;
  result: UserInfo;
}

const formSchema = z
  .object({
    temporary_password: z.string().min(6, "Type your temporary Password"),
    password: z.string().min(8, "Type at least 8 character"),
    confirm: z.string().min(8, "Type at least 8 character"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

const ResetPassword = () => {
  const { request_id, user_id, token } = useParams();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTemporaryPassword, setShowTemporaryPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verifyUser, setVerifyUser] = useState<IVerifyUser>();

  const decryptedRequestId = decrypt(request_id as string);
  const decryptedToken = decrypt(token as string);
  const decryptedUserId = decrypt(user_id as string);

  useEffect(() => {
    const verifyUser = async () => {
      const params = {
        baseURL: NODE_URL,
        url: `${nodeApi.ForgotPassword}/verify?request_id=${decryptedRequestId}&token=${decryptedToken}`,
        setLoading: setIsLoading,
      };
      try {
        const res = await loadData(params);
        if (res.valid === true) {
          setVerifyUser(res);
        }
      } catch (error) {
        console.log(error);
      }
    };
    verifyUser();
  }, [decryptedToken, decryptedRequestId]);

  /** Define form */
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      temporary_password: "",
      password: "",
      confirm: "",
    },
  });

  /** Update function */
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    const passwordPayload = {
      request_id: decryptedRequestId,
      temporary_password: values.temporary_password,
      password: values.password,
    };
    const putParams = {
      baseURL: NODE_URL,
      url: `${nodeApi.ResetPassword}/${decryptedUserId}`,
      setLoading: setIsLoading,
      payload: passwordPayload,
      isToast: true,
    };
    const res = await putData(putParams);
    if (res) {
      form.reset();
    }
  };

  const handleShowTemporaryPassword = () => {
    if (showTemporaryPassword) {
      setShowTemporaryPassword(false);
    } else {
      setShowTemporaryPassword(true);
    }
  };
  const handleShowPassword = () => {
    if (showPassword) {
      setShowPassword(false);
    } else {
      setShowPassword(true);
    }
  };

  const handleShowConfirmPassword = () => {
    if (showConfirmPassword) {
      setShowConfirmPassword(false);
    } else {
      setShowConfirmPassword(true);
    }
  };
  return (
    <div className="flex justify-center items-center h-screen">
      {verifyUser?.valid ? (
        <Card className="w-2/5">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <div className="rounded-full p-2 bg-NAVY-100 flex justify-center items-center">
                  <LockKeyhole size={24} color="black" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-base font-semibold text-red-600">
                    Reset Password
                  </p>
                  <p className="text-[13px] font-normal text-red-600">
                    Reset your account password.
                  </p>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="flex flex-col gap-3">
                  <FormField
                    control={form.control}
                    name="temporary_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-gray-500 font-normal">
                          Temporary Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={handleShowTemporaryPassword}
                              className="absolute right-4 top-2 cursor-pointer"
                            >
                              {showTemporaryPassword ? (
                                <EyeOffIcon size={20} color="#6b7280" />
                              ) : (
                                <EyeIcon size={20} color="#6b7280" />
                              )}
                            </button>
                            <Input
                              className="bg-[#F6F7FB]"
                              type={showTemporaryPassword ? "text" : "password"}
                              placeholder="Enter your temporary password"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-gray-500 font-normal">
                          New Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={handleShowPassword}
                              className="absolute right-4 top-2 cursor-pointer"
                            >
                              {showPassword ? (
                                <EyeOffIcon size={20} color="#6b7280" />
                              ) : (
                                <EyeIcon size={20} color="#6b7280" />
                              )}
                            </button>
                            <Input
                              className="bg-[#F6F7FB]"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your new password"
                              {...field}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {/* <PasswordStrength rules={rules} strength={strength} /> */}

                  <FormField
                    control={form.control}
                    name="confirm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-gray-500 font-normal">
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={handleShowConfirmPassword}
                              className="absolute right-4 top-2 cursor-pointer"
                            >
                              {showConfirmPassword ? (
                                <EyeOffIcon size={20} color="#6b7280" />
                              ) : (
                                <EyeIcon size={20} color="#6b7280" />
                              )}
                            </button>
                            <Input
                              className="bg-[#F6F7FB]"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Enter your confirm password"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-center mt-11">
                  <Button type="submit">
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
      ) : (
        <p className="text-xl font-bold text-red-700">{verifyUser?.message}.</p>
      )}
    </div>
  );
};

export default ResetPassword;
