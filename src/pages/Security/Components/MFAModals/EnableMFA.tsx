import { NODE_URL, nodeApi } from "@/Api/Api";
import Alert from "@/components/Alert/Alert";
import CustomModal4 from "@/components/CustomModal/CustomModal4";
import Spinner from "@/components/Spinner/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { IMFAListType } from "@/types/interfaces/mfa.interface";
import { getDaysAgo } from "@/Utility/DaysCheck";
import { deleteData, loadData, postData } from "@/Utility/funtion";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Copy,
  Plus,
  ScanBarcode,
  X,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
interface Props {
  setTwoStepModal1: (value: boolean) => void;
  isMfaEnabled: boolean;
  setIsMfaEnabled: (value: boolean) => void;
}
function EnableMFA({ setTwoStepModal1, isMfaEnabled, setIsMfaEnabled }: Props) {
  const { token } = useGlobalContext();
  const [isCopyURL, setIsCopyURL] = useState(false);
  const [mfa_type, setMfa_type] = useState("");
  const [mfa_id, setMfa_id] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  // const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [isAddNewMFA, setIsAddNewMFA] = useState(false);
  const [mfaList, setMfaList] = useState<IMFAListType[]>([]);
  console.log(isMfaEnabled, "isMfaEnabled");
  useEffect(() => {
    (async () => {
      const res = await loadData({
        baseURL: NODE_URL,
        url: `${nodeApi.MFA}/list`,
        setLoading: setIsLoading,
        accessToken: token.access_token,
      });
      if (res.result) {
        setMfaList(res.result);
      }
    })();
  }, [token.access_token, isMfaEnabled]);

  const isMfaTypeMatch = (type: string) => {
    if (!mfaList || !Array.isArray(mfaList)) return false;
    const isMatch = mfaList.find((mfa: IMFAListType) => mfa?.mfa_type === type);

    if (!isMatch) return "";

    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <span>{getDaysAgo(isMatch.updated_at)}</span>
      </div>
    );
  };

  const handleSelectMfaType = async (type: string) => {
    setIsAddNewMFA(true);
    const res = await postData({
      baseURL: NODE_URL,
      url: `${nodeApi.MFA}/setup`,
      setLoading: setIsLoading,
      payload: {
        mfa_type: type,
      },
      // isConsole: true,
      // isToast: true,
      accessToken: token.access_token,
    });
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
        otp: code,
        mfa_id,
        mfa_type,
      },
      // isConsole: true,
      // isToast: true,
      accessToken: token.access_token,
    });
    if (res.status === 200) {
      setIsMfaEnabled(true);
      toast({ description: res.data.message });
    }
  };

  const mfaTypes = [
    { name: "Authenticator", value: "TOTP" },
    { name: "Phone", value: "SMS" },
  ];

  const handleMFADelete = async (mfa_id: number) => {
    const resDelete = await deleteData({
      baseURL: NODE_URL,
      url: `${nodeApi.MFA}/delete`,
      payload: {
        mfa_id,
      },
      accessToken: token.access_token,
    });
    console.log(resDelete, "delete");
    if (resDelete) {
      setMfaList([]);
      setIsMfaEnabled(false);
      setIsAddNewMFA(false);
      toast({ description: resDelete.data.message });
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
                {mfaTypes.map((type, i) => {
                  return (
                    <div
                      key={i}
                      className={`flex justify-between border rounded p-2 cursor-pointer hover:bg-[#cedef2]`}
                      onClick={() => setMfa_type(type.value)}
                    >
                      <h3>{type.name}</h3>
                      {isMfaTypeMatch(type.value)}
                      <ChevronRight />
                    </div>
                  );
                })}
              </div>
            )}

            {mfa_type === "TOTP" && (
              <div className="p-2 flex flex-col gap-2">
                <div
                  className="flex gap-2 items-center cursor-pointer"
                  onClick={() => setMfa_type("")}
                >
                  <ArrowLeft />
                  <p>Your authenticators</p>
                </div>
                {mfaList.length === 0 && !isAddNewMFA && (
                  <div>
                    <span
                      onClick={() => handleSelectMfaType("TOTP")}
                      className="flex gap-2 cursor-pointer"
                    >
                      <Plus /> <>Add</>
                    </span>
                  </div>
                )}
                {mfaList &&
                  mfaList.length > 0 &&
                  mfaList
                    .filter((mfa) => mfa.mfa_type === mfa_type)
                    .map((mfa) => {
                      return (
                        <div
                          key={mfa.mfa_id}
                          className="flex flex-col gap-2 p-3 border rounded"
                        >
                          <div className="flex gap-2 w-full justify-between items-center ">
                            <div className="flex gap-4 items-center">
                              <ScanBarcode />
                              <div className="flex flex-col">
                                <span>Authenticator</span>
                                <span>{isMfaTypeMatch(mfa.mfa_type)}</span>
                              </div>
                            </div>
                            <Alert
                              disabled={false}
                              tooltipTitle="Delete"
                              actionName="delete"
                              onContinue={() => handleMFADelete(mfa.mfa_id)}
                            />
                          </div>
                          <span className="cursor-not-allowed text-slate-300">
                            Change authenticator app
                          </span>
                        </div>
                      );
                    })}
              </div>
            )}

            {/* Enter code */}
            {mfa_type && isAddNewMFA && !isMfaEnabled && (
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
          </div>
        )}
      </CustomModal4>
    </>
  );
}
export default EnableMFA;
