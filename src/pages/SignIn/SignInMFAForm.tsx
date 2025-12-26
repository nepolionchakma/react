import { api, NODE_URL } from "@/Api/Api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import useUserIP from "@/hooks/useUserIP";
import { postData } from "@/Utility/funtion";
import { getUserLocation } from "@/Utility/locationUtils";
import { AxiosError } from "axios";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

function SignInMFAForm() {
  const {
    setToken,
    isLoading,
    setIsLoading,
    setPresentDevice,
    presentDevice,
    setSignonId,
    mfaResponse,
    setMfaResponse,
  } = useGlobalContext();
  const navigate = useNavigate();
  const location = useLocation();
  const userIp = useUserIP();

  const [code, setCode] = useState("");

  const handleEnableCode = async () => {
    try {
      const response = await postData({
        baseURL: NODE_URL,
        url: `/login/verify-mfa-login`,
        setLoading: setIsLoading,
        payload: {
          otp: Number(code),
          mfa_id: mfaResponse?.mfa_methods[0].mfa_id,
          mfa_token: mfaResponse?.mfa_token,
        },
        // isConsole: true,
        // isToast: true,
        // accessToken: token.access_token,
      });
      console.log(response, "res");
      if (response.status === 200) {
        setToken(response.data);
        toast({ description: response.data.message });
        const ipAddress = await userIp();
        const userLocation = await getUserLocation();
        const deviceData = {
          ...presentDevice,
          ip_address: ipAddress ? ipAddress : "Unknown",
          location: userLocation ? userLocation : "Unknown (Location off)",
        };

        const newSignonID = uuidv4();
        const res = await api.post("/devices/add-device", {
          user_id: response.data.user_id,
          deviceInfo: deviceData,
          signon_audit: {
            signon_id: newSignonID,
            login: new Date(),
            logout: "",
            session_log: [],
          },
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
      console.log(error);
      if (error instanceof AxiosError) {
        toast({
          description: `Error : ${error.response?.data.message}`,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="w-full h-full justify-center items-center flex">
      <div className="w-1/3 flex flex-col gap-5 border rounded p-5">
        <div
          className="flex cursor-pointer"
          onClick={() => setMfaResponse(undefined)}
        >
          <ArrowLeft />
          <span>Back</span>
        </div>
        <div className="flex flex-col gap-5">
          <p>Please enter the 6 digits MFA TOTP code </p>
          <Input
            placeholder="Enter code"
            onChange={(e) => setCode(e.target.value)}
          />
          <Button onClick={() => handleEnableCode()}>
            {isLoading ? (
              <l-tailspin size="15" stroke="3" speed="0.9" color="white" />
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
export default SignInMFAForm;
