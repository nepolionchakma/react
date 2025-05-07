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
  const [selectedUser, setSelectedUser] = useState<IUsersInfoTypes>({
    user_id: 0,
    user_name: "string",
    email_addresses: "",
    profile_picture: {
      original: "",
      thumbnail: "",
    },
    first_name: "",
    middle_name: "",
    last_name: "",
    job_title: "",
  });
  const [primaryCheckedItem, setPrimaryCheckedItem] = useState<IProfilesType>();
  const [isUpdated, setIsUpdated] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (selectedUser) {
          setIsLoading(true);
          const resData = await api.get(
            `/access-profiles/${selectedUser.user_id}`
          );
          // is primary available
          const filterPrimaryData = resData.data.find(
            (item: IProfilesType) => item.primary_yn === "Y"
          );
          setPrimaryCheckedItem(filterPrimaryData);

          setData(resData.data);
        }
        if (selectedUser.user_name === "") {
          setData([]);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedUser, isUpdated]);

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
      />
    </div>
  );
};
export default SetupAndAdministration;
