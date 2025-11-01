import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { useSocketContext } from "@/Context/SocketContext/SocketContext";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
// import useUserInfo from "@/hooks/useUserInfo";
import { useEffect, useState } from "react";

import iOS from "/icons/device/apple.png";
import Windows from "/icons/device/windows.png";
import MacOS from "/icons/device/apple.png";
import Linux from "/icons/device/linux.png";
import Android from "/icons/device/android.png";
import Edge from "/icons/device/microsoft.png";
import Chrome from "/icons/device/chrome.png";
import Safari from "/icons/device/safari.png";
import Firefox from "/icons/device/firefox.png";
import Opera from "/icons/device/opera.png";
import Undefined from "/icons/undefined.svg";
import App from "/favicon.svg";
import { Switch } from "@/components/ui/switch";
import { IUserLinkedDevices } from "@/types/interfaces/users.interface";

// import SignonAudit from "./Modals/SignonAudit";
import SignonAuditTwo from "./Modals/SignonAuditTwo";

const YourDevices = () => {
  const api = useAxiosPrivate();
  const { token, setSignonId, presentDevice } = useGlobalContext();
  const { linkedDevices, setLinkedDevices, inactiveDevice } =
    useSocketContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedDevice, setSelectedDevice] =
    useState<IUserLinkedDevices | null>(null);

  const sortedDevices = linkedDevices?.sort(
    (a, b) => b.is_active - a.is_active
  );

  useEffect(() => {
    if (!token || token.user_id === 0) return;

    const getDevices = async () => {
      try {
        // await userInfo(token.user_id);
        const res = await api.get(`/devices/${token?.user_id}`);

        setLinkedDevices(res.data);
      } catch (error) {
        console.log("error while getting devices");
      } finally {
        setIsLoading(false);
      }
    };

    getDevices();
  }, [api, isLoading, setLinkedDevices, token]);

  const switchFunc = async (data: IUserLinkedDevices) => {
    try {
      const res = async () => {
        const res = await api.put(
          `/devices/inactive-device/${token.user_id}/${data.id}`,
          {
            is_active: 0,
          }
        );

        if (res.status === 200) {
          console.log(res.data);
          inactiveDevice([res.data]);
          setSignonId("");
          localStorage.removeItem("signonId");
          if (presentDevice.id === res.data.id) {
            localStorage.removeItem("presentDeviceInfo");
          }
          localStorage.removeItem("presentDevice");
        }
      };

      res();
    } catch (error) {
      console.log("Error while deactivating device");
    }
  };

  // Logout from all devices
  const logoutFromAllDevices = async () => {
    try {
      setIsButtonLoading(true);
      const res = await api.put(`/devices/${token.user_id}`, {
        is_active: 0,
      });

      if (res.status === 200) {
        setIsButtonLoading(false);
        setIsLoading(true);
        inactiveDevice(linkedDevices);
        localStorage.removeItem("presentDeviceInfo");
      }
    } catch (error) {
      console.log("Error while deactivating device");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 bg-[#b4d6f3] p-4">
        <h3 className="font-semibold">Your Devices</h3>
        <p>Your account is logged in from multiple devices.</p>
        <div>
          <button
            onClick={logoutFromAllDevices}
            className="w-[239px] text-center bg-white text-red-500 font-semibold p-2 inline-block cursor-pointer"
          >
            <span>
              {isButtonLoading ? (
                <span className="flex justify-center items-center">
                  <l-tailspin
                    size="24"
                    stroke="4"
                    speed="0.9"
                    color="black"
                  ></l-tailspin>
                </span>
              ) : (
                "Logout from all devices"
              )}
            </span>
          </button>
        </div>
      </div>
      <div className="px-4 py-2 bg-[#f5f5f5]">
        <div className="flex flex-col gap-2 overflow-y-auto scrollbar-thin h-[calc(100vh)]">
          {isLoading ? (
            <span className="flex justify-center items-center h-full">
              <l-tailspin
                size="40"
                stroke="5"
                speed="0.9"
                color="black"
              ></l-tailspin>
            </span>
          ) : (
            <>
              {sortedDevices.map((device) => (
                <div
                  key={device.id}
                  className="p-4 bg-white flex justify-between items-center"
                >
                  <div className="flex gap-2">
                    <div>
                      <img
                        src={
                          device.os === "Windows"
                            ? Windows
                            : device.os === "Linux"
                            ? Linux
                            : device.os === "Mac"
                            ? MacOS
                            : device.os === "iOS"
                            ? iOS
                            : device.os === "Android"
                            ? Android
                            : Undefined
                        }
                        alt="image"
                        className="w-6"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{device.os}</p>
                      <span className=" ">
                        <span>{device.location}</span>
                        <span> - </span>
                        <span className="font-medium">{device.ip_address}</span>
                      </span>
                      <div className="flex gap-1 items-center">
                        <img
                          src={
                            device.browser_name === "Microsoft Edge"
                              ? Edge
                              : device.browser_name === "Google Chrome"
                              ? Chrome
                              : device.browser_name === "Apple Safari"
                              ? Safari
                              : device.browser_name === "Mozilla Firefox"
                              ? Firefox
                              : device.browser_name === "Opera"
                              ? Opera
                              : device.browser_name === "App"
                              ? App
                              : Undefined
                          }
                          alt="image"
                          className="w-4 h-4"
                        />
                        <p>{device.browser_version}</p>
                      </div>
                      <p
                        className="text-blue-600 font-semibold cursor-pointer"
                        onClick={() => {
                          setShowModal(true);
                          setSelectedDevice(device);
                        }}
                      >
                        View Singon Audit
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Switch
                      className={`${
                        device.is_online &&
                        "data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300  transition-colors"
                      }`}
                      disabled={device.is_active === 0 && true}
                      checked={device.is_active === 1 ? true : false}
                      onCheckedChange={() => {
                        // setIsActive(true);
                        switchFunc(device);
                      }}
                    />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        <SignonAuditTwo
          showModal={showModal}
          setShowModal={setShowModal}
          selectedDevice={selectedDevice}
        />
        {/* <SignonAudit
          showModal={showModal}
          setShowModal={setShowModal}
          selectedDevice={selectedDevice}
        /> */}
      </div>
    </>
  );
};

export default YourDevices;
