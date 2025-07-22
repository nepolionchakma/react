import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import useUserIP from "./useUserIP";
import useAxiosPrivate from "./useAxiosPrivate";
import useLocation from "./useLocation";
import { v4 as uuidv4 } from "uuid";

const useInitialUserInfo = () => {
  const getUserIP = useUserIP();
  const api = useAxiosPrivate();
  const { presentDevice, setPresentDevice, setSignonId } = useGlobalContext();
  const { location } = useLocation();

  const initialUserInfo = async (user_id: number) => {
    const newSignonID = uuidv4();
    try {
      const ipAddress = await getUserIP();
      const deviceData = {
        ...presentDevice,
        ip_address: ipAddress ? ipAddress : "Unknown",
        location: location,
      };

      const response = await api.post("/devices/add-device", {
        user_id,
        deviceInfo: deviceData,
        signon_audit: {
          signon_id: newSignonID,
          login: new Date(),
          logout: "",
        },
      });
      if (response.status === 200) {
        setPresentDevice(response.data);
        localStorage.setItem("presentDevice", "true");
        setSignonId(newSignonID);
        localStorage.setItem("signonId", newSignonID);
      }
      // addDevice(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  return initialUserInfo;
};
export default useInitialUserInfo;
