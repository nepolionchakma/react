import { useEffect, useState } from "react";
import { UsersTable } from "./UsersTable/UsersTable";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import {
  IProfilesType,
  IUsersInfoTypes,
} from "@/types/interfaces/users.interface";
import { UserProfileTable } from "./UserProfileTable/UserProfileTable";

const SetupAndAdministration = () => {
  const api = useAxiosPrivate();
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
      try {
        if (selectedUser.user_id) {
          setIsLoading(true);
          const resData = await api.get(
            `/access-profiles/${selectedUser.user_id}`
          );
          // is primary available
          const filterPrimaryData = resData.data.find(
            (item: IProfilesType) => item.primary_yn === "Y"
          );
          setPrimaryCheckedItem(filterPrimaryData);
          setSelectedProfile([]);
          setData(resData.data);
        } else {
          setData([]);
        }
      } catch (error) {
        console.log(error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedUser, isUpdated, api]);

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
