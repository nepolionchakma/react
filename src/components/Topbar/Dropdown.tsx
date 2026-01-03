import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NavLink } from "react-router-dom";
import { LogOut, Settings, ShieldBan, User } from "lucide-react";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { useSocketContext } from "@/Context/SocketContext/SocketContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadData, putData } from "@/Utility/funtion";
import { NODE_URL, nodeApi } from "@/Api/Api";
// const Loading = "/public/profile/loading.gif";

const Dropdown = () => {
  const apiUrl = import.meta.env.VITE_NODE_ENDPOINT_URL;
  const {
    token,
    setToken,
    combinedUser,
    presentDevice,
    setPresentDevice,
    setSignonId,
  } = useGlobalContext();

  const { handleDisconnect, setLinkedDevices, inactiveDevice } =
    useSocketContext();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const userExample = {
    isLoggedIn: false,
    user_id: 0,
    message: "",
    access_token: "",
    refresh_token: "",
  };
  const handleSignOut = async () => {
    try {
      const [res, response] = await Promise.all([
        await putData({
          baseURL: NODE_URL,
          payload: {
            is_active: 0,
          },
          setLoading: setIsLoading,
          url: `${nodeApi.Devices}/inactive-device/${token?.user_id}/${presentDevice?.id}`,
        }),
        await loadData({
          baseURL: NODE_URL,
          url: `/logout`,
          setLoading: setIsLoading,
        }),
      ]);
      console.log(response, "res");
      if (res.status === 200) {
        setToken(userExample);
        setLinkedDevices([]);
        setPresentDevice({ ...presentDevice, id: 0 });
        inactiveDevice([res.data]);
        setSignonId("");
        localStorage.removeItem("signonId");
        localStorage.removeItem("presentDeviceInfo");
        navigate("/login");
      }
    } catch (error) {
      console.log(error, "Error while deactivating device");
    } finally {
      handleDisconnect();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="border">
          <AvatarImage
            className="object-cover object-center"
            src={`${apiUrl}/${combinedUser?.profile_picture?.original}`}
          />
          <AvatarFallback>
            {combinedUser?.user_name?.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 mr-1">
        <DropdownMenuLabel className=" font-bold font-workSans text-lg text-center capitalize">
          {combinedUser?.user_name}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="p-2 rounded hover:bg-hover text-sm">
          <NavLink
            to="/access-profiles"
            className={({ isActive }) =>
              isActive
                ? "flex gap-2 items-center w-full text-active"
                : "flex gap-2 items-center w-full"
            }
          >
            <User size={18} />
            <p className="font-semibold font-workSans text-md">
              Access Profiles
            </p>
          </NavLink>
        </div>
        <div className="p-2 rounded hover:bg-hover text-sm">
          <NavLink
            to="/security"
            className={({ isActive }) =>
              isActive
                ? "flex gap-2 items-center w-full text-active"
                : "flex gap-2 items-center w-full"
            }
          >
            <ShieldBan size={18} />
            <p className="font-semibold font-workSans text-md">Security</p>
          </NavLink>
        </div>
        <div className="p-2 rounded hover:bg-hover text-sm">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive
                ? "flex gap-2 items-center w-full text-active"
                : "flex gap-2 items-center w-full"
            }
          >
            <Settings size={18} />
            <p className="font-semibold font-workSans text-md">Settings</p>
          </NavLink>
        </div>
        <DropdownMenuSeparator />
        <div className="p-2 rounded hover:bg-hover text-sm">
          <button
            onClick={handleSignOut}
            className="flex gap-2 items-center w-full text-Red-300"
          >
            {isLoading ? (
              <span className="flex mx-auto justify-center items-center">
                <l-tailspin
                  size="18"
                  stroke="3"
                  speed="0.9"
                  color="black"
                ></l-tailspin>
              </span>
            ) : (
              <>
                <LogOut size={18} />
                <p className="font-semibold font-workSans text-md">Logout</p>
              </>
            )}
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Dropdown;
