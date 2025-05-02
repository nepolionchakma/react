import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { IEnterprisesTypes } from "@/types/interfaces/users.interface";
import { X } from "lucide-react";
import React, { useState } from "react";
interface ICustomModalTypes {
  action: string;
  tabName: string;
  selectedEnterpriseRows?: IEnterprisesTypes[];
  setStateChanged: React.Dispatch<React.SetStateAction<number>>;
  handleCloseModal: () => void;
}
const EnterpriseCreateAndEditModal = ({
  action,
  tabName,
  selectedEnterpriseRows,
  setStateChanged,
  handleCloseModal,
}: ICustomModalTypes) => {
  const api = useAxiosPrivate();
  const [enterpriseName, setEnterpriseName] = useState<string>(
    selectedEnterpriseRows && action === "edit"
      ? selectedEnterpriseRows[0].enterprise_name
      : ""
  );
  const [enterpriseType, setEnterpriseType] = useState<string>(
    selectedEnterpriseRows && action === "edit"
      ? selectedEnterpriseRows[0].enterprise_type
      : ""
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const data = {
        enterprise_name: enterpriseName,
        enterprise_type: enterpriseType,
      };

      if (action === "create") {
        const res = await api.post(
          `/def-tenant-enterprise-setup/${selectedEnterpriseRows?.[0].tenant_id}`,
          data
        );
        if (res) {
          toast({
            description: `${res.data.message}`,
          });
        }
      } else {
        const res = await api.put(
          `/def-tenant-enterprise-setup/${selectedEnterpriseRows?.[0].tenant_id}`,
          data
        );
        if (res) {
          toast({
            description: `${res.data.message}`,
          });
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      handleClose();
      setStateChanged(Math.random() + 23 * 3000);
    }
  };

  const handleClose = () => {
    setEnterpriseName("");
    setEnterpriseType("");
    handleCloseModal();
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
          <div className="flex justify-end">
            <Button type="submit">{isLoading ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </div>
    </CustomModal4>
  );
};

export default EnterpriseCreateAndEditModal;
