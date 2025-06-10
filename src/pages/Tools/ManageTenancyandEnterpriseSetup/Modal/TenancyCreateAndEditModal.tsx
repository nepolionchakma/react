import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { ITenantsTypes } from "@/types/interfaces/users.interface";
import { X } from "lucide-react";
import React, { useState } from "react";
interface ICustomModalTypes {
  action: string;
  tabName: string;
  selectedTenancyRows?: ITenantsTypes[];
  setStateChanged: React.Dispatch<React.SetStateAction<number>>;
  handleCloseModal: () => void;
}
const TenancyCreateAndEditModal = ({
  action,
  tabName,
  selectedTenancyRows,
  setStateChanged,
  handleCloseModal,
}: ICustomModalTypes) => {
  const api = useAxiosPrivate();
  const [tenantName, setTenantName] = useState<string>(
    selectedTenancyRows && action === "edit"
      ? selectedTenancyRows[0].tenant_name
      : ""
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (action === "create") {
        const res = await api.post(`/def-tenants`, { tenant_name: tenantName });
        if (res) {
          toast({
            description: `${res.data.message}`,
          });
        }
      } else {
        const res = await api.put(
          `/def-tenants/${selectedTenancyRows?.[0].tenant_id}`,
          { tenant_name: tenantName }
        );
        if (res) {
          toast({
            description: `${res.data.message}`,
          });
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
      handleClose();
      setStateChanged(Math.random() + 23 * 3000);
    }
  };

  const handleClose = () => {
    setTenantName("");
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
            <label htmlFor="tenant_name">Tenancy Name</label>
            <Input
              type="text"
              name="tenant_name"
              id="tenant_name"
              value={tenantName}
              autoFocus
              onChange={(e) => setTenantName(e.target.value)}
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

export default TenancyCreateAndEditModal;
