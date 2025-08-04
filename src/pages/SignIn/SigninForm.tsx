import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { useLocation, useNavigate } from "react-router-dom";
// import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { AxiosError } from "axios";
import { api } from "@/Api/Api";
// import useInitialUserInfo from "@/hooks/useInitialUserInfo";
import { v4 as uuidv4 } from "uuid";
import useUserIP from "@/hooks/useUserIP";
import useUserLocationInfo from "@/hooks/useUserLocationInfo";

interface SignInFormProps {
  setIsWrongCredential: React.Dispatch<React.SetStateAction<boolean>>;
}

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(5, "Password must be at least 5 characters"),
});

const SignInForm = ({ setIsWrongCredential }: SignInFormProps) => {
  const {
    setToken,
    isLoading,
    setIsLoading,
    setPresentDevice,
    presentDevice,
    setSignonId,
  } = useGlobalContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { location: userLocation } = useUserLocationInfo();
  const userIp = useUserIP();
  // const initialUserInfo = useInitialUserInfo();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof loginSchema>) => {
    const ipAddress = await userIp();
    const deviceData = {
      ...presentDevice,
      ip_address: ipAddress ? ipAddress : "Unknown",
      location: userLocation ? userLocation : "Unknown (Location off)",
    };

    try {
      setIsLoading(true);
      const response = await api.post(`/login`, data);
      if (!response.data) return;

      setToken(response.data);
      setIsWrongCredential(false);

      if (response.data) {
        const newSignonID = uuidv4();
        const res = await api.post("/devices/add-device", {
          user_id: response.data.user_id,
          deviceInfo: deviceData,
          signon_audit: {
            signon_id: newSignonID,
            login: new Date(),
            logout: "",
          },
        });

        setSignonId(newSignonID);
        localStorage.setItem("signonId", newSignonID);

        if (res.status === 201 || res.status === 200) {
          console.log(res.data, "Device added successfully");
          localStorage.setItem("presentDevice", "true");
          localStorage.setItem("presentDeviceInfo", JSON.stringify(res.data));
          setPresentDevice(res.data);
          navigate(location?.state ? location?.state : "/", { replace: true });
        }
      }
    } catch (error) {
      setIsWrongCredential(true);
      if (error instanceof AxiosError && error.response) {
        console.log(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[496px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-dark-400 ">Email</FormLabel>
                <FormControl>
                  <input
                    type="text"
                    className="border h-8 outline-none rounded-md pl-2 text-dark-400"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-dark-400 ">Password</FormLabel>
                <FormControl>
                  <input
                    type="password"
                    className="border h-8 outline-none rounded-md pl-2 text-dark-400"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <button
            disabled={isLoading}
            type="submit"
            className={`${
              isLoading && "cursor-not-allowed"
            } w-full py-2 rounded-md bg-Red-200 hover:bg-Red-200/90 text-white`}
          >
            {isLoading ? (
              <l-tailspin size="15" stroke="3" speed="0.9" color="white" />
            ) : (
              "Log In"
            )}
          </button>
        </form>
      </Form>
    </div>
  );
};

export default SignInForm;
