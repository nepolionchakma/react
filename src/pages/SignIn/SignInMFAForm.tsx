import { api, NODE_URL } from "@/Api/Api";
import Spinner from "@/components/Spinner/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import useUserIP from "@/hooks/useUserIP";
import { Token } from "@/types/interfaces/users.interface";
import { postData } from "@/Utility/funtion";
import { maskEmail } from "@/Utility/general";
import { getUserLocation } from "@/Utility/locationUtils";
import { AxiosError } from "axios";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
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
  const [isTryAnotherWay, setIsTryAnotherWay] = useState(false);
  const [viaEmailOrSms, setviaEmailOrSms] = useState<"EMAIL" | "SMS" | "">("");
  const [codeSentEmail, setCodeSentEmail] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);

  const clearAllFields = () => {
    setCode("");
    setIsTryAnotherWay(false);
    setviaEmailOrSms("");
    setCodeSentEmail("");
    setIsSendingCode(false);
    setMfaResponse(undefined);
  };

  useEffect(() => {
    (async () => {
      if (viaEmailOrSms === "EMAIL") {
        const res = await postData({
          baseURL: NODE_URL,
          payload: { mfa_token: mfaResponse?.mfa_token || "" },
          url: `/login/send-email-mfa-code`,
          setLoading: setIsSendingCode,
        });
        // console.log(res, "res");
        setCodeSentEmail(res.data.email);
      }
    })();
  }, [viaEmailOrSms]);

  const handleSetTokenData = async (response: Token) => {
    clearAllFields();
    setToken(response);
    toast({ description: response.message });
    const ipAddress = await userIp();
    const userLocation = await getUserLocation();
    const deviceData = {
      ...presentDevice,
      ip_address: ipAddress ? ipAddress : "Unknown",
      location: userLocation ? userLocation : "Unknown (Location off)",
    };

    const newSignonID = uuidv4();
    const res = await api.post("/devices/add-device", {
      user_id: response.user_id,
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
  };

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
      // console.log(response, "res");
      if (response.status === 200) {
        handleSetTokenData(response.data);
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

  const handleEmailOTPCodeSubmit = async () => {
    try {
      const response = await postData({
        baseURL: NODE_URL,
        payload: { mfa_token: mfaResponse?.mfa_token || "", otp: Number(code) },
        url: `/login/verify-email-mfa-code`,
        setLoading: setIsLoading,
      });
      if (response.status === 200) {
        handleSetTokenData(response.data);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error);
        toast({
          description: `Error : ${error.response?.data.message}`,
          variant: "destructive",
        });
      }
    }
  };

  const handelResendCode = async () => {
    const res = await postData({
      baseURL: NODE_URL,
      payload: { mfa_token: mfaResponse?.mfa_token || "" },
      url: `/login/send-email-mfa-code`,
      setLoading: setIsSendingCode,
    });
    if (res.status === 200) {
      setTimeLeft(5 * 60);
      setIsResendCode(true);
      setResendCodeCounter(resendCodeCounter - 1);
      toast({
        description: res.data.message,
        variant: "default",
      });
    }
  };
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [isResendCode, setIsResendCode] = useState(false);
  const [resendCodeCounter, setResendCodeCounter] = useState(3);
  // console.log(timeLeft, "timeleft");
  useEffect(() => {
    if (codeSentEmail.length > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime === 0) {
            clearInterval(interval); // Stop the timer when time runs out
            return 0;
          }
          if (isResendCode) {
            clearInterval(interval);
            setIsResendCode(false);
          }
          return prevTime - 1;
        });
      }, 1000);

      // Cleanup interval when the component is unmounted
      return () => clearInterval(interval);
    }
  }, [codeSentEmail.length, isResendCode]);

  // Convert seconds into MM:SS format
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
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
        {!isTryAnotherWay && (
          <div className="flex flex-col gap-5">
            <p>Please enter the 6 digits MFA TOTP code </p>
            <Input
              placeholder="Enter code"
              onChange={(e) => setCode(e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                variant="link"
                className="text-blue-500 cursor-pointer"
                onClick={() => setIsTryAnotherWay(true)}
              >
                Try another way
              </Button>
            </div>
            <Button
              disabled={isLoading || code.length === 0}
              onClick={() => handleEnableCode()}
            >
              {isLoading ? (
                <l-tailspin size="15" stroke="3" speed="0.9" color="white" />
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        )}
        {isTryAnotherWay && !viaEmailOrSms && (
          <div className="flex flex-col gap-5">
            <p>Try another way to verify your identity</p>
            <Button variant="outline" onClick={() => setviaEmailOrSms("EMAIL")}>
              Use Email
            </Button>
            <Button
              disabled
              variant="outline"
              onClick={() => setviaEmailOrSms("SMS")}
            >
              Use SMS
            </Button>
          </div>
        )}
        {isSendingCode && (
          <div className="flex flex-col h-[60%] justify-center items-center">
            <Spinner size="100" color="red"></Spinner>
          </div>
        )}
        {isTryAnotherWay && viaEmailOrSms && !isSendingCode && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-5">
              <p>The OTP code has been sent to {maskEmail(codeSentEmail)}</p>
              <Input
                required
                placeholder="Enter code"
                onChange={(e) => setCode(e.target.value)}
              />
              <div className="flex justify-between items-center">
                <span>left - {resendCodeCounter}</span>
                <span>
                  {String(minutes).padStart(2, "0")}:
                  {String(seconds).padStart(2, "0")}
                </span>
                <Button
                  disabled={timeLeft > 0 || resendCodeCounter === 0}
                  variant="link"
                  className="text-blue-500 cursor-pointer"
                  onClick={() => handelResendCode()}
                >
                  Resend Code
                </Button>
              </div>
              <Button
                disabled={isLoading || code.length === 0}
                onClick={() => handleEmailOTPCodeSubmit()}
              >
                {isLoading ? (
                  <l-tailspin size="15" stroke="3" speed="0.9" color="white" />
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default SignInMFAForm;
