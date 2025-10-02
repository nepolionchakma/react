import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NavLink } from "react-router-dom";
import { LogOut, Settings, ShieldBan, User, UserPlus } from "lucide-react";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { useSocketContext } from "@/Context/SocketContext/SocketContext";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useEffect, useState } from "react";
// const Loading = "/public/profile/loading.gif";

// import { useEffect } from "react";

const Dropdown = () => {
  const api = useAxiosPrivate();
  const apiUrl = import.meta.env.VITE_NODE_ENDPOINT_URL;
  const {
    token,
    setToken,
    combinedUser,
    presentDevice,
    setSignonId,
    isInvitationModalOpen,
    setIsInvitationModalOpen,
  } = useGlobalContext();
  console.log(isInvitationModalOpen, "isInvitationModalOpen");
  const { handleDisconnect, setLinkedDevices, inactiveDevice } =
    useSocketContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const navigate = useNavigate();

  const userExample = {
    isLoggedIn: false,
    user_id: 0,
    user_name: "",
    user_type: "",
    tenant_id: 0,
    access_token: "",
    issuedAt: "",
    iat: 0,
    exp: 0,
    profile_picture: { original: "", thumbnail: "" },
  };
  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/logout`);
      if (response.status === 200) {
        const res = await api.put(
          `/devices/inactive-device/${token.user_id}/${presentDevice.id}`,
          {
            is_active: 0,
          }
        );

        if (res.status === 200) {
          setIsLoading(false);
          setToken(userExample);
          setLinkedDevices([]);
          window.location.href = "/login";
          inactiveDevice([res.data]);
          setSignonId("");
          localStorage.removeItem("signonId");
          localStorage.removeItem("presentDeviceInfo");
        }
      }
    } catch (error) {
      console.log("Error while deactivating device");
    } finally {
      handleDisconnect();
    }
  };
  const openInvitationModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  useEffect(() => {
    setIsInvitationModalOpen(isModalOpen);
  }, [isModalOpen]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="border">
          <AvatarImage
            className="object-cover object-center"
            src={`${apiUrl}/${combinedUser?.profile_picture.original}`}
          />
          <AvatarFallback>{token.user_name.slice(0, 1)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 mr-1">
        <DropdownMenuLabel className=" font-bold font-workSans text-lg text-center">
          {token.user_name}
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
        <div className="p-2 rounded hover:bg-hover text-sm">
          <button
            onClick={openInvitationModal}
            className="flex gap-2 items-center w-full"
          >
            <UserPlus size={18} />
            <p className="font-semibold font-workSans text-md">invitation</p>
          </button>
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
