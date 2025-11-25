import { useEffect, useState } from "react";
import { UsersTable } from "./UsersTable/UsersTable";
import {
  IProfilesType,
  IUsersInfoTypes,
} from "@/types/interfaces/users.interface";
import { UserProfileTable } from "./UserProfileTable/UserProfileTable";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { loadData } from "@/Utility/funtion";

const SetupAndAdministration = () => {
  const { token } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<IProfilesType[]>([]);
  // const [filterUserID, setFilterUserID] = useState<number[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUsersInfoTypes>(
    {} as IUsersInfoTypes
  );
  const [selectedProfile, setSelectedProfile] = useState<IProfilesType[]>([]);
  const [primaryCheckedItem, setPrimaryCheckedItem] = useState<IProfilesType>();
  const [isUpdated, setIsUpdated] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedUser.user_id) {
        setIsLoading(true);
        const getDataParams = {
          baseURL: FLASK_URL,
          url: `${flaskApi.AccessProfiles}/${selectedUser.user_id}`,
          setLoading: setIsLoading,
          payload: { user_id: selectedUser.user_id },
          isConsole: true,
          isToast: true,
          accessToken: token.access_token,
        };
        const resData = await loadData(getDataParams);
        if (resData.length > 0) {
          // is primary available
          const filterPrimaryData = resData?.find(
            (item: IProfilesType) => item.primary_yn === "Y"
          );
          setPrimaryCheckedItem(filterPrimaryData);
          setSelectedProfile([]);
          setData(resData);
        } else {
          setData([]);
        }
      } else {
        setData([]);
      }
    };
    fetchData();
  }, [selectedUser, isUpdated, token.access_token]);

  return (
    <div>
      <UsersTable
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
      />
      <UserProfileTable
        profileData={data}
        isUpdated={isUpdated}
        setIsUpdated={setIsUpdated}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        selectedUser={selectedUser}
        primaryCheckedItem={primaryCheckedItem}
        selectedProfile={selectedProfile}
        setSelectedProfile={setSelectedProfile}
      />
    </div>
  );
};
export default SetupAndAdministration;
