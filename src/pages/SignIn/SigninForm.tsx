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
import { NavLink, useLocation, useNavigate } from "react-router-dom";
// import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { AxiosError } from "axios";
import { NODE_URL } from "@/Api/Api";
// import useInitialUserInfo from "@/hooks/useInitialUserInfo";
import { v4 as uuidv4 } from "uuid";
import { postData } from "@/Utility/funtion";

const loginSchema = z.object({
  user: z.union([
    z.string().email("Invalid email"), // valid email
    z.string().min(1, "Username is required"), // non-empty string (for username)
  ]),
  password: z.string().min(5, "Password must be at least 5 characters"),
});

const SignInForm = () => {
  const {
    setToken,
    isLoading,
    setIsLoading,
    setPresentDevice,
    presentDevice,
    setSignonId,
    setMfaResponse,
    userIpAddress,
    userLocation,
  } = useGlobalContext();
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      user: "",
      password: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof loginSchema>) => {
    const deviceData = {
      ...presentDevice,
      ip_address: userIpAddress ? userIpAddress : "Unknown",
      location: userLocation ? userLocation : "Unknown (Location off)",
    };

    try {
      setIsLoading(true);
      const loginParams = {
        baseURL: NODE_URL,
        url: `/login`,
        setLoading: setIsLoading,
        payload: data,
        isToast: true,
      };
      const response = await postData(loginParams);

      if (!response.data) return;

      if (response?.data?.mfa_required) {
        setMfaResponse(response?.data);
        return;
      } else if (response.data && !response?.data?.mfa_required) {
        setToken(response.data);
        const newSignonID = uuidv4();
        const res = await postData({
          baseURL: NODE_URL,
          payload: {
            user_id: response.data.user_id,
            deviceInfo: deviceData,
            signon_audit: {
              signon_id: newSignonID,
              login: new Date(),
              logout: "",
              session_log: [],
            },
          },
          setLoading: setIsLoading,
          url: "/devices/add-device",
        });

        setSignonId(newSignonID);
        localStorage.setItem("signonId", newSignonID);

        if (res.status === 201 || res.status === 200) {
          localStorage.setItem("presentDevice", "true");
          localStorage.setItem("presentDeviceInfo", JSON.stringify(res.data));
          setPresentDevice(res.data);
          navigate(location?.state ? location?.state : "/", { replace: true });
        }
      }
    } catch (error) {
      console.log(error, "error");

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
            name="user"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-dark-400 ">
                  Email or Username
                </FormLabel>
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
          <NavLink
            to="/forgot-password"
            className="block text-right text-blue-600 font-medium underline"
          >
            Forgot Password?
          </NavLink>

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
