import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import useUserIP from "./useUserIP";
import useAxiosPrivate from "./useAxiosPrivate";
import useLocation from "./useLocation";

const useInitialUserInfo = () => {
  const getUserIP = useUserIP();
  const api = useAxiosPrivate();
  const { presentDevice, setPresentDevice } = useGlobalContext();
  const { location } = useLocation();

  const initialUserInfo = async (user_id: number) => {
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
      });
      if (response.status === 200) {
        setPresentDevice(response.data);
        localStorage.setItem("presentDevice", "true");
      }
      // addDevice(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  return initialUserInfo;
};
export default useInitialUserInfo;
