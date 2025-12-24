import { NODE_URL, nodeApi } from "@/Api/Api";
import CustomModal4 from "@/components/CustomModal/CustomModal4";
import Spinner from "@/components/Spinner/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { postData } from "@/Utility/funtion";
import { ArrowRight, Check, Copy, X } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useState } from "react";
interface Props {
  setTwoStepModal1: (value: boolean) => void;
}
function EnableMFA({ setTwoStepModal1 }: Props) {
  const { token } = useGlobalContext();
  const [isCopyURL, setIsCopyURL] = useState(false);
  const [mfa_type, setMfa_type] = useState("");
  const [mfa_id, setMfa_id] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [mfaEnableMessage, setMfaEnableMessage] = useState("");

  const handleSelectMfaType = async (type: string) => {
    setMfa_type(type);
    const res = await postData({
      baseURL: NODE_URL,
      url: `${nodeApi.MFA}/setup`,
      setLoading: setIsLoading,
      payload: {
        mfa_type: "TOTP",
      },
      // isConsole: true,
      // isToast: true,
      accessToken: token.access_token,
    });
    console.log(res, "res");
    if (res.status === 200) {
      setSecret(res.data.result.mfa_secret);
      setMfa_id(res.data.result.mfa_id);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(secret).then(
      () => {
        setIsCopyURL(true);
        toast({ description: "Text copied to clipboard!" });
      },
      (err) => {
        setIsCopyURL(false);
        toast({ description: "Failed to copy text!" });
        console.error("Error copying text: ", err);
      }
    );
  };

  const handleEnableCode = async () => {
    const res = await postData({
      baseURL: NODE_URL,
      url: `${nodeApi.MFA}/verify`,
      setLoading: setIsLoading,
      payload: {
        otp: Number(code),
        mfa_id,
        mfa_type,
      },
      // isConsole: true,
      // isToast: true,
      accessToken: token.access_token,
    });
    console.log(res, "res");
    if (res.status === 200) {
      setIsMfaEnabled(true);
      setMfaEnableMessage(res.data.message);
      toast({ description: res.data.message });
    }
  };

  return (
    <>
      <CustomModal4 className="w-[500px] h-[350px]">
        <div className="flex justify-between bg-[#CEDEF2] px-4 py-[10px]">
          <h3 className="font-semibold ">Enable Two-Step Authentication</h3>
          <X
            onClick={() => setTwoStepModal1(false)}
            className="cursor-pointer"
          />
        </div>
        {isLoading ? (
          <div className="flex flex-col h-[60%] justify-center items-center">
            <Spinner size="100" color="red"></Spinner>
          </div>
        ) : (
          <div>
            {/* Select type  */}
            {!mfa_type && (
              <div className="p-2 flex flex-col gap-2">
                {["TOTP", "EMAIL"].map((type, i) => {
                  return (
                    <div
                      key={i}
                      className="flex justify-between border rounded p-2 cursor-pointer hover:bg-[#cedef2]"
                      onClick={() => handleSelectMfaType(type)}
                    >
                      <h3>{type}</h3>
                      <ArrowRight />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Enter code */}
            {mfa_type && !isMfaEnabled && (
              <div className="p-4 flex flex-col gap-2">
                <div className="flex justify-center">
                  <QRCodeCanvas
                    value={JSON.stringify(secret)}
                    title={"Secret"}
                    size={150}
                    // imageSettings={{
                    //   src: "/favicon.svg",
                    //   x: undefined,
                    //   y: undefined,
                    //   height: 24,
                    //   width: 24,
                    //   opacity: 1,
                    //   excavate: true,
                    // }}
                  />
                </div>
                <div>
                  <p>Copy the secret and paste it into the app</p>
                  <div className="px-4 py-2 bg-white w-full flex justify-between border rounded">
                    <p>Secret:</p>
                    <p>{secret}</p>
                    {isCopyURL ? (
                      <Check
                        onClick={handleCopy}
                        className="cursor-pointer text-green-500"
                      />
                    ) : (
                      <Copy
                        onClick={handleCopy}
                        className="cursor-pointer text-red-500"
                      />
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    onChange={(e) => setCode(e.target.value)}
                  />
                  <Button onClick={() => handleEnableCode()}>Submit</Button>
                </div>
              </div>
            )}

            {/* Success */}
            {isMfaEnabled && (
              <div className="flex flex-col items-center p-2">
                <p>{mfaEnableMessage}</p>
                <Button onClick={() => setTwoStepModal1(false)}>Done</Button>
              </div>
            )}
          </div>
        )}
      </CustomModal4>
    </>
  );
}
export default EnableMFA;
