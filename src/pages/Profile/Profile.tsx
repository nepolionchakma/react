import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { QRCodeCanvas } from "qrcode.react";
import ProfileTable, { IProfilesType1 } from "./Table/ProfileTable";
import { SquarePlus } from "lucide-react";
import Spinner from "@/components/Spinner/Spinner";
import { useEffect, useState } from "react";

import CreateAccessProfile from "./CreateAccessProfile/CreateAccessProfile";
import { IJobTitle, IProfilesType } from "@/types/interfaces/users.interface";
import UpdateProfile3 from "./UpdateProfile/UpdateProfile3";
import { loadData } from "@/Utility/funtion";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { jobTitleName } from "@/Utility/general";

const Profile = () => {
  const { combinedUser, isCombinedUserLoading } = useGlobalContext();
  const { token } = useGlobalContext();
  const [isCreateNewProfile, setIsCreateNewProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<IProfilesType1[]>([]);
  const [isUpdated, setIsUpdated] = useState<number>(0);
  const [primaryCheckedItem, setPrimaryCheckedItem] = useState<IProfilesType>();
  const [jobTitles, setJobTitles] = useState<IJobTitle[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (combinedUser?.user_id) {
        setIsLoading(true);
        const postDataParams = {
          baseURL: FLASK_URL,
          url: `${flaskApi.AccessProfiles}/${combinedUser?.user_id}`,
          setLoading: setIsLoading,
          isConsole: true,
          isToast: true,
          accessToken: token.access_token,
        };
        const resData = await loadData(postDataParams);
        // is primary available
        const filterPrimaryData = resData.find(
          (item: IProfilesType) => item.primary_yn === "Y"
        );
        setPrimaryCheckedItem(filterPrimaryData);

        setData(resData);
      }
    };
    fetchData();
  }, [combinedUser?.user_id, isUpdated]);

  useEffect(() => {
    (async () => {
      const params = {
        baseURL: FLASK_URL,
        url: `${flaskApi.JobTitles}?tenant_id=${combinedUser?.tenant_id}`,
        accessToken: `${token.access_token}`,
      };

      const res = await loadData(params);

      if (res) {
        setJobTitles(res);
      } else {
        setJobTitles([]);
      }
    })();
  }, [combinedUser?.tenant_id]);

  return (
    <>
      {isCreateNewProfile && (
        <CreateAccessProfile
          setIsCreateNewProfile={setIsCreateNewProfile}
          setIsUpdated={setIsUpdated}
        />
      )}
      {isCombinedUserLoading ? (
        <div className="flex flex-row min-h-[calc(100vh-100px)] justify-center items-center">
          <Spinner size="50" color="red"></Spinner>
        </div>
      ) : (
        <div className="pb-4">
          <div className="flex flex-col gap-3 border p-5">
            <div className="px-4 font-semibold">My Profiles</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="grid col-span-2">
                {/* User Information */}
                <div className="flex gap-5 items-center px-4 py-[14px] bg-[#cedef2]">
                  <UpdateProfile3 />
                  <div className="p-2">
                    <h5 className="font-medium">
                      {combinedUser?.first_name} {combinedUser?.last_name}
                    </h5>
                    <h5 className="">
                      {jobTitleName(combinedUser?.job_title_id ?? 0, jobTitles)}
                    </h5>
                    <h5 className="font-light">Id: {combinedUser?.user_id}</h5>
                  </div>
                </div>
                <div className="flex flex-row-reverse my-2  cursor-pointer">
                  {/* add profile */}
                  <div
                    className="bg-[#2563eb] rounded px-[10px] py-2 flex gap-1 items-center h-10 col-span-2 text-white"
                    onClick={() => setIsCreateNewProfile(true)}
                  >
                    <SquarePlus size={20} />
                    <h3 className="text-sm">Add Profile</h3>
                  </div>
                </div>
                {/* Profile Type Table*/}
                <ProfileTable
                  profiles={data}
                  setIsUpdated={setIsUpdated}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  primaryCheckedItem={primaryCheckedItem}
                />
              </div>
              <div>
                {/* QR Code */}
                <div className="border bg-[#cedef2] p-4">
                  <div className="font-semibold">Access Profiles</div>
                  <div className="bg-white flex items-center justify-center p-16  mt-4">
                    <QRCodeCanvas
                      value={JSON.stringify(combinedUser?.email_address)}
                      title={"Access Profiles"}
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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
