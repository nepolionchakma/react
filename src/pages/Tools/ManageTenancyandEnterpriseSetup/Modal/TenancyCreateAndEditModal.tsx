import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ITenantsTypes } from "@/types/interfaces/users.interface";
import { X } from "lucide-react";
import React, { useState } from "react";
import { postData, putData } from "@/Utility/funtion";
interface ICustomModalTypes {
  action: string;
  tabName: string;
  selectedTenancyRows?: ITenantsTypes[];
  setSelectedTenancyRows: React.Dispatch<React.SetStateAction<ITenantsTypes[]>>;
  setStateChanged: React.Dispatch<React.SetStateAction<number>>;
  handleCloseModal: () => void;
}
const TenancyCreateAndEditModal = ({
  action,
  tabName,
  selectedTenancyRows,
  setStateChanged,
  handleCloseModal,
  setSelectedTenancyRows,
}: ICustomModalTypes) => {
  console.log(tabName, "tabneame");
  const [tenantName, setTenantName] = useState<string>(
    selectedTenancyRows && action === "edit"
      ? selectedTenancyRows[0].tenant_name
      : ""
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const flaskUrl = import.meta.env.VITE_FLASK_ENDPOINT_URL;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (action === "add") {
        const postParams = {
          baseURL: flaskUrl,
          url: "/tenants",
          setLoading: setIsLoading,
          payload: {
            tenant_name: tenantName,
          },
          isConsole: true,
        };

        await postData(postParams);
      } else {
        const putParams = {
          baseURL: flaskUrl,
          url: `/tenants/${selectedTenancyRows?.[0].tenant_id}`,
          setLoading: setIsLoading,
          payload: { tenant_name: tenantName },
          isConsole: true,
        };
        const res = await putData(putParams);
        if (res) {
          setSelectedTenancyRows([]);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
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
            <Button type="submit">
              {" "}
              {isLoading ? (
                <l-tailspin
                  size="24"
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

export default TenancyCreateAndEditModal;
