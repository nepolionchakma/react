import { NODE_URL, nodeApi } from "@/Api/Api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { postData } from "@/Utility/funtion";

const formSchema = z.object({
  user_name: z.string().min(2, "Type at least 2 character"),
  email_address: z.string().email("Enter valid email"),
  date_of_birth: z.string().date(),
});

export const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_name: "",
      email_address: "",
      date_of_birth: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const forgotPasswordPayload = {
      user_name: values.user_name,
      email_address: values.email_address,
      date_of_birth: values.date_of_birth,
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
                <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-normal">
                        Date of Birth
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="bg-background"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
