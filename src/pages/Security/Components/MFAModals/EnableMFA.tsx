import { NODE_URL, nodeApi } from "@/Api/Api";
import Alert from "@/components/Alert/Alert";
import CustomModal4 from "@/components/CustomModal/CustomModal4";
import Spinner from "@/components/Spinner/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { IMFAListType } from "@/types/interfaces/mfa.interface";
import { getDaysAgo } from "@/Utility/DaysCheck";
import { deleteData, loadData, postData } from "@/Utility/funtion";
import { AxiosError } from "axios";
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
  // const [isAddNewMFA, setIsAddNewMFA] = useState(false);
  const [mfaList, setMfaList] = useState<IMFAListType[]>([]);
  const [isClickAddButton, setIsClickAddButton] = useState(false);
  const [password, setPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [identifierName, setIdentifierName] = useState("");

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
        <span>{getDaysAgo(isMatch.created_at)}</span>
      </div>
    );
  };

  const handleSelectMfaType = async (type: string) => {
    setIsClickAddButton(true);
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
      url: `${nodeApi.MFA}/verify-otp`,
      setLoading: setIsLoading,
      payload: {
        otp: code,
        mfa_id,
        mfa_type,
        identifier: identifierName,
      },
      // isConsole: true,
      // isToast: true,
      accessToken: token.access_token,
    });
    if (res.status === 200) {
      setIsMfaEnabled(true);
      setIsClickAddButton(false);
      setIsClickAddButton(false);
      setIsCopyURL(false);
      toast({ description: res.data.message });
    }
  };

  const handleEnterUserCurrentPassword = async () => {
    try {
      const res = await postData({
        baseURL: NODE_URL,
        payload: { password },
        url: `${nodeApi.MFA}/check-password`,
        setLoading: setIsLoading,
        accessToken: token.access_token,
      });
      // console.log(res, "res");
      if (res) {
        setIsPasswordValid(res.data.is_valid_password);
        await handleSelectMfaType(mfa_type);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error, "error");
        toast({
          description: `${error.response?.data?.message}`,
          variant: "destructive",
        });
      }
    }
  };

  const mfaTypes = [
    { name: "Authenticator App", value: "TOTP" },
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
    // console.log(resDelete, "delete");
    if (resDelete) {
      setMfaList([]);
      setIsMfaEnabled(false);
      setIsClickAddButton(false);
      setIsPasswordValid(false);
      toast({ description: resDelete.data.message });
    }
  };

  const handleBackClick = () => {
    setMfa_type("");
    setPassword("");
    setIsClickAddButton(false);
    setIsPasswordValid(false);
    setMfaList([]);
    setIsMfaEnabled(false);
    setIsCopyURL(false);
  };

  const switchFunc = async (mfa: IMFAListType) => {
    try {
      (async () => {
        const res = await postData({
          baseURL: NODE_URL,
          payload: { mfa_id: mfa.mfa_id, mfa_enabled: !mfa.mfa_enabled },
          url: `/mfa/switch-mfa`,
          setLoading: setIsLoading,
          accessToken: token.access_token,
        });

        if (res.status === 200) {
          setIsMfaEnabled(!mfa.mfa_enabled);
          toast({ description: res.data.message });
        }
      })();
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error, "error");
        toast({
          description: `${error.response?.data?.message}`,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <>
      <CustomModal4 className="w-[500px] min-h-[350px] max-h-auto">
        <div className="flex justify-between bg-[#CEDEF2] px-4 py-[10px]">
          <h3 className="font-semibold ">Multifactor Authentication</h3>
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
                    <button
                      disabled={type.value === "SMS"}
                      key={i}
                      className={`flex justify-between border rounded p-2  hover:bg-[#cedef2] ${
                        type.value === "SMS"
                          ? "bg-slate-100 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                      onClick={() => setMfa_type(type.value)}
                    >
                      <h3>{type.name}</h3>
                      {isMfaTypeMatch(type.value)}
                      <ChevronRight />
                    </button>
                  );
                })}
              </div>
            )}

            {mfa_type === "TOTP" && (
              <div className="p-2 flex flex-col gap-2">
                <div
                  className="flex gap-2 items-center cursor-pointer"
                  onClick={() => handleBackClick()}
                >
                  <ArrowLeft />
                  <p>back</p>
                </div>
                {mfaList.length === 0 &&
                  // !isClickAddButton &&
                  !isClickAddButton && (
                    <div>
                      <span
                        onClick={() => {
                          setIsClickAddButton(true);
                          setPassword("");
                        }}
                        // onClick={() => handleSelectMfaType(mfa_type)}
                        className="flex gap-2 cursor-pointer border rounded p-2 hover:bg-[#cedef2]"
                      >
                        <Plus /> <>Add</>
                      </span>
                    </div>
                  )}

                {isClickAddButton && !isPasswordValid && (
                  <div className="flex flex-col gap-5 mt-5 items-center justify-center">
                    <span>Please enter your current password</span>
                    <Input
                      value={password}
                      type="password"
                      placeholder="Enter current password"
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-[200px]"
                    />
                    <Button onClick={() => handleEnterUserCurrentPassword()}>
                      Submit
                    </Button>
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
                          className="flex flex-col gap-2 p-5 border rounded"
                        >
                          <div className="flex gap-2 w-full justify-between items-center ">
                            <div className="flex gap-4 items-center">
                              <ScanBarcode />
                              <div className="flex flex-col">
                                <span>{mfa.identifier}</span>
                                <span>{isMfaTypeMatch(mfa.mfa_type)}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Switch
                                className={`${
                                  mfa.mfa_enabled &&
                                  "data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300  transition-colors"
                                }`}
                                checked={
                                  mfa.mfa_enabled === true ? true : false
                                }
                                onCheckedChange={() => {
                                  switchFunc(mfa);
                                }}
                              />
                              <Alert
                                disabled={false}
                                tooltipTitle="Delete"
                                actionName="delete"
                                onContinue={() => handleMFADelete(mfa.mfa_id)}
                              />
                            </div>
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
            {mfa_type &&
              isClickAddButton &&
              !isMfaEnabled &&
              isPasswordValid && (
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
                      placeholder="Identifier name"
                      onChange={(e) => setIdentifierName(e.target.value)}
                    />
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
