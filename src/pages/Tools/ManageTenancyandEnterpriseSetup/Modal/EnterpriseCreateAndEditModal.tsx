import { FLASK_URL, flaskApi } from "@/Api/Api";
import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { IEnterprisesTypes } from "@/types/interfaces/users.interface";
import { postData } from "@/Utility/funtion";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
interface ICustomModalTypes {
  action: string;
  tabName: string;
  selectedEnterpriseRows?: IEnterprisesTypes[];
  setSelectedEnterpriseRows: React.Dispatch<
    React.SetStateAction<IEnterprisesTypes[]>
  >;
  setStateChanged: React.Dispatch<React.SetStateAction<number>>;
  handleCloseModal: () => void;
}

interface Validity {
  amount: number;
  unit: string;
}
const EnterpriseCreateAndEditModal = ({
  action,
  tabName,
  setStateChanged,
  handleCloseModal,
}: ICustomModalTypes) => {
  // const api = useAxiosPrivate();
  const { enterpriseSetting, token, setEnterpriseSetting } = useGlobalContext();
  const [enterpriseName, setEnterpriseName] = useState<string>(
    enterpriseSetting && action === "edit"
      ? enterpriseSetting.enterprise_name
      : ""
  );
  const [enterpriseType, setEnterpriseType] = useState<string>(
    enterpriseSetting && action === "edit"
      ? enterpriseSetting.enterprise_type
      : ""
  );
  const [userInvitationValidity, setUserInvitationValidity] =
    useState<Validity>({ amount: 1, unit: "h" });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const parseValidity = (value: string): Validity => {
    const match = value.match(/^(\d+)([a-zA-Z]+)$/);
    if (!match) {
      throw new Error(`Invalid validity format: ${value}`);
    }

    return {
      amount: parseInt(match[1], 10),
      unit: match[2],
    };
  };

  useEffect(() => {
    if (enterpriseSetting?.user_invitation_validity) {
      const res = parseValidity(enterpriseSetting?.user_invitation_validity);
      setUserInvitationValidity({
        amount: res.amount,
        unit: res.unit,
      });
    }
  }, [enterpriseSetting?.user_invitation_validity]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = {
      enterprise_name: enterpriseName,
      enterprise_type: enterpriseType,
      user_invitation_validity:
        userInvitationValidity.amount + userInvitationValidity.unit,
    };

    const params = {
      baseURL: FLASK_URL,
      url: `${flaskApi.EnterpriseSetup}?tenant_id=${enterpriseSetting?.tenant_id}`,
      setLoading: setIsLoading,
      payload: data,
      // isConsole?: boolean;
      isToast: true,
      accessToken: token.access_token,
    };

    const res = await postData(params);
    if (res.status === 200 || res.status === 201) {
      setEnterpriseSetting(res.data.result);
      handleClose();
      setStateChanged(Math.random() + 23 * 3000);
    }
  };

  const handleClose = () => {
    setEnterpriseName("");
    setEnterpriseType("");
    handleCloseModal();
  };

  const inputRef = React.useRef(null);

  const handleClick = () => {
    if (inputRef.current) {
      (inputRef.current as HTMLInputElement).select();
    }
  };

  return (
    <CustomModal4 className="w-[400px] h-auto">
      <div className="flex justify-between bg-[#CEDEF2] p-2">
        <h3 className="font-semibold capitalize">
          {action} {tabName}
        </h3>
        <X onClick={handleClose} className="cursor-pointer" />
      </div>
      <div className="p-4 h-full flex flex-col justify-between">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="enterprise_name">Enterprise Name</label>
            <Input
              type="text"
              name="enterprise_name"
              id="enterprise_name"
              value={enterpriseName}
              autoFocus
              onChange={(e) => setEnterpriseName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="enterprise_type">Enterprise Type</label>
            <Input
              type="text"
              name="enterprise_type"
              id="enterprise_type"
              value={enterpriseType}
              onChange={(e) => setEnterpriseType(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="enterprise_type">User Invitation Validity</label>
            <div className="flex items-center gap-2">
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Time Amount
                </label>
                <Input
                  type="number"
                  placeholder="1,2,3 etc...."
                  className=""
                  value={userInvitationValidity.amount}
                  onChange={(e) =>
                    setUserInvitationValidity((prev) => ({
                      ...prev,
                      amount: Number(e.target.value),
                    }))
                  }
                  min={1}
                  ref={inputRef}
                  onClick={handleClick}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Time Unit
                </label>
                <Select
                  value={userInvitationValidity.unit}
                  onValueChange={(value) =>
                    setUserInvitationValidity({
                      ...userInvitationValidity,
                      unit: value,
                    })
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="m">Minutes</SelectItem>
                    <SelectItem value="h">Hours</SelectItem>
                    <SelectItem value="d">Days</SelectItem>
                    <SelectItem value="w">Weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">
              {" "}
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
      </div>
    </CustomModal4>
  );
};

export default EnterpriseCreateAndEditModal;
