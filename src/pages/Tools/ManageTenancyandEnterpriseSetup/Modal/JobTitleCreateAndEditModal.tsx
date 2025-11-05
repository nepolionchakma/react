import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IJobTitle, ITenantsTypes } from "@/types/interfaces/users.interface";
import { X } from "lucide-react";
import React, { useState } from "react";
import CustomDropDown from "@/components/CustomDropDown/CustomDropDown";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { flaskApi } from "@/Api/Api";
import { postData, putData } from "@/Utility/funtion";
interface ICustomModalTypes {
  action: string;
  tabName: string;
  selectedJobTitlesRows?: IJobTitle[];
  tenants: ITenantsTypes[];
  setSelectedJobTitlesRows: React.Dispatch<React.SetStateAction<IJobTitle[]>>;
  setStateChanged: React.Dispatch<React.SetStateAction<number>>;
  handleCloseModal: () => void;
}

const JobTitleCreateAndEditModal = ({
  action,
  selectedJobTitlesRows,
  setStateChanged,
  handleCloseModal,
  setSelectedJobTitlesRows,
  tenants,
}: ICustomModalTypes) => {
  const { token } = useGlobalContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const flaskUrl = import.meta.env.VITE_FLASK_ENDPOINT_URL;
  const [jobTitleName, setJobTitleName] = useState<string>(
    selectedJobTitlesRows && action === "edit"
      ? selectedJobTitlesRows[0].job_title_name
      : ""
  );
  const selectedTenantName =
    tenants.find((t) => t.tenant_id === selectedJobTitlesRows?.[0]?.tenant_id)
      ?.tenant_name || "Select Tenant Name";

  const [option, setOption] = useState<string>(
    selectedJobTitlesRows && action === "edit"
      ? selectedTenantName
      : "Select Tenant Name"
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const selectedTenant = tenants.find(
        (item: ITenantsTypes) => item.tenant_name === option
      );
      const selectedTenantId = selectedTenant?.tenant_id;

      if (action === "add") {
        const postParams = {
          baseURL: flaskUrl,
          url: flaskApi.JobTitles,
          setLoading: setIsLoading,
          payload: {
            job_title_name: jobTitleName,
            tenant_id: selectedTenantId,
          },
          accessToken: `${token.access_token}`,
          isToast: true,
        };

        await postData(postParams);
      } else {
        const putParams = {
          baseURL: flaskUrl,
          url: `${flaskApi.JobTitles}?job_title_id=${selectedJobTitlesRows?.[0].job_title_id}`,
          setLoading: setIsLoading,
          payload: {
            job_title_name: jobTitleName,
            tenant_id: selectedTenantId,
          },
          accessToken: `${token.access_token}`,
          isToast: true,
        };
        await putData(putParams);
      }
    } catch (error) {
      console.log(error);
    } finally {
      handleClose();
      setStateChanged(Math.random() + 23 * 3000);
      setSelectedJobTitlesRows([]);
    }
  };

  const handleClose = () => {
    setJobTitleName("");
    handleCloseModal();
  };

  return (
    <CustomModal4 className="w-[400px] h-auto">
      <div className="flex justify-between bg-[#CEDEF2] p-2">
        <h3 className="font-semibold capitalize">{action} Job Title</h3>
        <X onClick={handleClose} className="cursor-pointer" />
      </div>
      <div className="p-4 h-full flex flex-col justify-between">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="job_title_name">Job Title Name</label>
            <Input
              type="text"
              name="job_title_name"
              id="job_title_name"
              value={jobTitleName}
              autoFocus
              onChange={(e) => setJobTitleName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <h2>Tenant Name</h2>
            <CustomDropDown
              data={tenants.map((item: ITenantsTypes) => item.tenant_name)}
              option={option}
              setOption={setOption}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                option === "Select Tenant Name" || jobTitleName.trim() === ""
              }
            >
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

export default JobTitleCreateAndEditModal;
