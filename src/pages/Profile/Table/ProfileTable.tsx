import { FilePenLine, Trash2 } from "lucide-react";
import { useState } from "react";
import UpdateProfileIDModal from "../UpdateProfileIDModal/UpdateProfileIDModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { tailspin } from "ldrs";
import { toast } from "@/components/ui/use-toast";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { Checkbox } from "@/components/ui/checkbox";
import { IProfilesType } from "@/types/interfaces/users.interface";

tailspin.register();

export interface IProfilesType1 {
  primary_yn: string;
  profile_id: string;
  profile_type: string;
  serial_number: number;
  user_id: number;
}
interface ProfileTableProps {
  profiles: IProfilesType1[];
  setIsUpdated: React.Dispatch<React.SetStateAction<number>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  primaryCheckedItem: IProfilesType | undefined;
}
const ProfileTable = ({
  profiles,
  setIsUpdated,
  isLoading,
  setIsLoading,
  primaryCheckedItem,
}: ProfileTableProps) => {
  const api = useAxiosPrivate();
  const [isUpdateProfile, setIsUpdateProfile] = useState(false);
  const [editableProfile, setEditableProfile] = useState<IProfilesType1>(
    {} as IProfilesType1
  );

  const editProfile = (profile: IProfilesType1) => {
    setIsUpdateProfile(true);
    setEditableProfile(profile);
  };

  const displayOrder = ["Email", "Mobile Number", "GUID"];
  const sortedProfilesBySerialNumber = profiles.sort(
    (a, b) => b.serial_number - a.serial_number
  );
  const sortedProfiles = sortedProfilesBySerialNumber.sort(
    (a, b) =>
      displayOrder.indexOf(a.profile_type) -
      displayOrder.indexOf(b.profile_type)
  );

  const handleDelete = async (user_id: number, serial_number: number) => {
    try {
      const res = await api.delete(
        `/access-profiles/${user_id}/${serial_number}`
      );
      if (res.status === 200) {
        toast({
          description: `${res.data.message}`,
        });
        setIsUpdated(Math.random() + 23 * 3000);
      }
    } catch (error) {
      console.log(error);
      toast({
        description: `Failed to delete`,
        variant: "destructive",
      });
    }
  };
  return (
    <div className="w-full">
      {isUpdateProfile && (
        <UpdateProfileIDModal
          editableProfile={editableProfile}
          setIsOpenModal={setIsUpdateProfile}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setIsUpdated={setIsUpdated}
          primaryCheckedItem={primaryCheckedItem}
        />
      )}
      <table className="w-full">
        <thead>
          <tr className="bg-[#CEDEF2] text-slate-500 text-left font-medium">
            <th className="border px-2 py-2 font-semibold w-4">SL</th>
            <th className="border px-2 py-2 font-semibold w-40">
              Profile Type
            </th>
            <th className="border px-2 py-2 font-semibold">Profile ID</th>
            <th className="border px-2 py-2 font-semibold text-center w-[10%]">
              Primary
            </th>
            <th className="border px-2 py-2 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={5} className="h-20">
                <span className="flex items-center justify-center h-full">
                  <l-tailspin
                    size="40"
                    stroke="5"
                    speed="0.9"
                    color="red"
                  ></l-tailspin>
                </span>
              </td>
            </tr>
          ) : (
            <>
              {profiles.length > 0 ? (
                <>
                  {sortedProfiles?.map((item, i) => (
                    <tr key={item.serial_number}>
                      <td className="border px-2 py-2">{i + 1}</td>
                      <td className="border px-2 py-2 capitalize min-w-max">
                        {item.profile_type}
                      </td>
                      <td className="border px-2 py-2">{item.profile_id}</td>
                      <td className="border px-2 py-2 text-center">
                        <Checkbox
                          checked={item.primary_yn === "Y"}
                          disabled
                          aria-readonly
                        />
                      </td>
                      <td className="border px-2 py-2 flex gap-1">
                        <FilePenLine
                          className="cursor-pointer"
                          onClick={() => editProfile(item)}
                        />

                        <AlertDialog>
                          <AlertDialogTrigger>
                            <Trash2 className="cursor-pointer" />
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete your account and remove your
                                data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDelete(item.user_id, item.serial_number)
                                }
                              >
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))}
                </>
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="border px-2 py-2 text-center text-slate-500"
                  >
                    Profile not found
                  </td>
                </tr>
              )}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProfileTable;
