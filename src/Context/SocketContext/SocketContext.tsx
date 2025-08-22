import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useGlobalContext, userExample } from "../GlobalContext/GlobalContext";
import {
  IUserLinkedDevices,
  Notification,
} from "@/types/interfaces/users.interface";
import { io } from "socket.io-client";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { getUserLocation, watchGeoPermission } from "@/Utility/locationUtils";
import { Alerts } from "@/types/interfaces/alerts.interface";

interface SocketContextProps {
  children: ReactNode;
}

interface SocketContext {
  receivedMessages: Notification[];
  handlesendMessage: (notificationId: string, sender: number) => void;
  handleDisconnect: () => void;
  handleRead: (id: string) => void;
  handleDeleteMessage: (id: string) => void;
  setReceivedMessages: React.Dispatch<React.SetStateAction<Notification[]>>;
  socketMessage: Notification[];
  setSocketMessages: React.Dispatch<React.SetStateAction<Notification[]>>;
  sentMessages: Notification[];
  setSentMessages: React.Dispatch<React.SetStateAction<Notification[]>>;
  draftMessages: Notification[];
  setDraftMessages: React.Dispatch<React.SetStateAction<Notification[]>>;
  recycleBinMsg: Notification[];
  setRecycleBinMsg: React.Dispatch<React.SetStateAction<Notification[]>>;
  handleDraftMessage: (notificationId: string, sender: number) => void;
  totalReceivedMessages: number;
  setTotalReceivedMessages: React.Dispatch<React.SetStateAction<number>>;
  totalSentMessages: number;
  setTotalSentMessages: React.Dispatch<React.SetStateAction<number>>;
  totalDraftMessages: number;
  setTotalDraftMessages: React.Dispatch<React.SetStateAction<number>>;
  totalRecycleBinMsg: number;
  handleDraftMsgId: (id: string) => void;
  addDevice: (deviceId: number) => void;
  inactiveDevice: (data: IUserLinkedDevices[]) => void;
  linkedDevices: IUserLinkedDevices[];
  setLinkedDevices: React.Dispatch<React.SetStateAction<IUserLinkedDevices[]>>;
  alerts: Alerts[];
  setAlerts: React.Dispatch<React.SetStateAction<Alerts[]>>;
  unreadTotalAlert: Alerts[];
  setUnreadTotalAlert: React.Dispatch<React.SetStateAction<Alerts[]>>;
  handleRestoreMessage: (id: string, user: number) => void;
  handleSendAlert: (
    alertId: number,
    recipients: number[],
    isAcknowledge: boolean
  ) => void;
}

const SocketContext = createContext({} as SocketContext);

// eslint-disable-next-line react-refresh/only-export-components
export function useSocketContext() {
  return useContext(SocketContext);
}

export function SocketContextProvider({ children }: SocketContextProps) {
  const api = useAxiosPrivate();
  const { userId, token, setToken, presentDevice } = useGlobalContext();
  const [receivedMessages, setReceivedMessages] = useState<Notification[]>([]);
  const [totalReceivedMessages, setTotalReceivedMessages] = useState<number>(0);
  const [sentMessages, setSentMessages] = useState<Notification[]>([]);
  const [totalSentMessages, setTotalSentMessages] = useState<number>(0);
  const [draftMessages, setDraftMessages] = useState<Notification[]>([]);
  const [totalDraftMessages, setTotalDraftMessages] = useState<number>(0);
  const [socketMessage, setSocketMessages] = useState<Notification[]>([]);
  const [recycleBinMsg, setRecycleBinMsg] = useState<Notification[]>([]);
  const [totalRecycleBinMsg, setTotalRecycleBinMsg] = useState<number>(0);
  // alerts
  const [alerts, setAlerts] = useState<Alerts[]>([]);
  const [unreadTotalAlert, setUnreadTotalAlert] = useState<Alerts[]>([]);
  const socket_url = import.meta.env.VITE_SOCKET_URL;
  const [linkedDevices, setLinkedDevices] = useState<IUserLinkedDevices[]>([]);
  const [geoPermissionState, setGeoPermissionState] =
    useState<PermissionState>("prompt");

  // Memoize the socket connection so that it's created only once
  const socket = useMemo(() => {
    return io(socket_url, {
      path: "/socket.io/",
      query: {
        key: userId,
        device_id: presentDevice.id,
      },
      transports: ["websocket"],
    });
  }, [socket_url, userId, presentDevice.id]);

  useEffect(() => {
    watchGeoPermission(
      () => setGeoPermissionState("granted"),
      () => setGeoPermissionState("denied")
    );
  }, []);

  /** fetch total alert */
  useEffect(() => {
    const fetchUnreadTotalAlert = async () => {
      if (!token || token?.user_id === 0) return;
      const res = await api.get(`/alerts/view/total/${token.user_id}`);
      if (res.status === 200) {
        setUnreadTotalAlert(res.data);
      }
    };
    fetchUnreadTotalAlert();
  }, [api, token.user_id]);

  //Fetch Notification Messages
  useEffect(() => {
    const fetchCounterMessages = async () => {
      try {
        if (!userId) return;
        const [
          notificationTotal,
          receivedTotal,
          sentTotal,
          draftTotal,
          recyclebinTotal,
        ] = await Promise.all([
          api.get(`/notifications/unread/${userId}`),
          api.get(`/notifications/total-received/${userId}`),
          api.get(`/notifications/total-sent/${userId}`),
          api.get(`/notifications/total-draft/${userId}`),
          api.get(`/notifications/total-recyclebin/${userId}`),
        ]);
        setSocketMessages(notificationTotal.data);
        setTotalReceivedMessages(receivedTotal.data.total);
        setTotalSentMessages(sentTotal.data.total);
        setTotalDraftMessages(draftTotal.data.total);
        setTotalRecycleBinMsg(recyclebinTotal.data.total);
      } catch (error) {
        console.log(error);
      }
    };

    fetchCounterMessages();
  }, [userId, api]);

  // device Action
  useEffect(() => {
    const locationUpdate = async (device_id: number) => {
      try {
        if (!token || token?.user_id === 0 || device_id === 0) return;

        const location = await getUserLocation();
        const response = await api.put(
          "/devices/update-device-location/" + device_id,
          {
            location,
          }
        );

        if (response.status === 200) {
          // Update the linkedDevices state with the new location
          setLinkedDevices((prev) => {
            return prev.map((device) =>
              device.id === device_id ? { ...device, location } : device
            );
          });
        }
      } catch (error) {
        console.log(error);
      }
    };
    locationUpdate(presentDevice.id);
  }, [token, api, presentDevice.id, geoPermissionState]);

  const deviceSync = async (data: IUserLinkedDevices) => {
    try {
      if (!token || (token?.user_id === 0 && !presentDevice.id)) return;
      if (data.id === presentDevice.id) {
        try {
          await api.get(`/logout`);
          handleDisconnect();
          setToken(userExample);
          window.location.href = "/login";
          localStorage.removeItem("presentDeviceInfo");
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.log("error");
    }
  };

  // useEffect(() => {
  //   const checkUserDevice = async () => {
  //     try {
  //       if (!token || token?.user_id === 0 || presentDevice?.id === 0) return;

  //       if (presentDevice.id && linkedDevices.length > 0) {
  //         const response = linkedDevices.some((device: IUserLinkedDevices) => {
  //           if (device?.id === presentDevice?.id && device?.is_active === 1) {
  //             return true;
  //           }
  //           return false;
  //         });

  //         if (!response) {
  //           try {
  //             await api.get(`/logout`);
  //             handleDisconnect();
  //             setToken(userExample);
  //             window.location.href = "/login";
  //           } catch (error) {
  //             console.log(error);
  //           }
  //         }
  //       }
  //     } catch (error) {
  //       console.log("Error checking user device");
  //     }
  //   };

  //   checkUserDevice();
  // }, [api, token?.user_id, presentDevice?.id]);

  // Listen to socket events

  useEffect(() => {
    socket.on("receivedMessage", (data: Notification) => {
      console.log(data);
      const receivedMessagesId = receivedMessages.map(
        (msg) => msg.notification_id
      );
      if (receivedMessagesId.includes(data.notification_id)) {
        console.log("return");
        return;
      } else {
        setSocketMessages((prevArray) => [data, ...prevArray]);
        setReceivedMessages((prev) => [data, ...prev]);
        setTotalReceivedMessages((prev) => prev + 1);
      }
    });
    socket.on("sentMessage", (data: Notification) => {
      console.log("recieving sentMessage event", data.notification_id);
      const sentMessageId = sentMessages.map((msg) => msg.notification_id);
      if (sentMessageId.includes(data.notification_id)) {
        return;
      } else {
        setSentMessages((prev) => [data, ...prev]);
        setTotalSentMessages((prev) => prev + 1);
      }
    });
    socket.on("draftMessage", (data: Notification) => {
      const existingDraft = draftMessages.find(
        (msg) => msg.notification_id === data.notification_id
      );

      if (existingDraft) {
        const newDraftMessages = draftMessages.filter(
          (msg) => msg.notification_id !== data.notification_id
        );
        if (data.recipients === undefined) {
          setDraftMessages(() => [
            { ...data, recipients: [] },
            ...newDraftMessages,
          ]);
        } else {
          setDraftMessages(() => [data, ...newDraftMessages]);
        }
      } else {
        if (data.recipients === undefined) {
          setDraftMessages((prev) => [{ ...data, recipients: [] }, ...prev]);
        } else {
          setDraftMessages((prev) => [data, ...prev]);
        }
        setTotalDraftMessages((prev) => prev + 1);
      }
    });

    socket.on("draftMessageId", (notificationId: string) => {
      // for sync socket draft messages
      const draftMessageId = draftMessages.map((msg) => msg.notification_id);
      if (draftMessageId.includes(notificationId)) {
        setDraftMessages((prev) =>
          prev.filter((item) => item.notification_id !== notificationId)
        );
        setTotalDraftMessages((prev) => prev - 1);
      }
    });

    socket.on("sync", (parrentId: string) => {
      const synedSocketMessages = socketMessage.filter(
        (msg) => msg.parent_notification_id !== parrentId
      );
      setSocketMessages(synedSocketMessages);
    });
    socket.on("deletedMessage", (notificationId: string) => {
      if (
        receivedMessages.some((msg) => msg.notification_id === notificationId)
      ) {
        // add to recycleBinMsg
        setRecycleBinMsg((prev) => {
          const deletedMessages = receivedMessages.find(
            (msg) => msg.notification_id === notificationId
          );
          if (!deletedMessages) return prev;
          return [deletedMessages, ...prev];
        });
        setTotalRecycleBinMsg((prev) => prev + 1);

        // if receive message includes the id then remove it
        setReceivedMessages((prev) =>
          prev.filter((msg) => msg.notification_id !== notificationId)
        );
        setTotalReceivedMessages((prev) => prev - 1);
        setSocketMessages((prev) =>
          prev.filter((msg) => msg.notification_id !== notificationId)
        );
      } else if (
        sentMessages.some((msg) => msg.notification_id === notificationId)
      ) {
        // add to recycleBinMsg
        setRecycleBinMsg((prev) => {
          const deletedMessages = sentMessages.find(
            (msg) => msg.notification_id === notificationId
          );
          if (!deletedMessages) return prev;
          return [deletedMessages, ...prev];
        });
        setTotalRecycleBinMsg((prev) => prev + 1);

        // Check if the message is already deleted before updating
        setSentMessages((prev) => {
          const filteredMessages = prev.filter(
            (msg) => msg.notification_id !== notificationId
          );
          // Only update total if the message was actually removed
          if (filteredMessages.length < prev.length) {
            setTotalSentMessages((prevTotal) => prevTotal - 1);
          }
          return filteredMessages;
        });
      } else if (
        draftMessages.some((msg) => msg.notification_id === notificationId)
      ) {
        // add to recycleBinMsg
        setRecycleBinMsg((prev) => {
          const deletedMessages = draftMessages.find(
            (msg) => msg.notification_id === notificationId
          );
          if (!deletedMessages) return prev;
          return [deletedMessages, ...prev];
        });
        setTotalRecycleBinMsg((prev) => prev + 1);

        // Check if the message is already deleted before updating
        setDraftMessages((prev) => {
          const filteredMessages = prev.filter(
            (msg) => msg.notification_id !== notificationId
          );
          // Only update total if the message was actually removed
          if (filteredMessages.length < prev.length) {
            setTotalDraftMessages((prevTotal) => prevTotal - 1);
          }
          return filteredMessages;
        });
      } else if (
        recycleBinMsg.some((msg) => msg.notification_id === notificationId)
      ) {
        // Check if the message is already deleted before updating
        setRecycleBinMsg((prev) => {
          const filteredMessages = prev.filter(
            (msg) => msg.notification_id !== notificationId
          );
          // Only update total if the message was actually removed
          if (filteredMessages.length < prev.length) {
            setTotalRecycleBinMsg(totalRecycleBinMsg - 1);
          }
          return filteredMessages;
        });
      }
    });

    socket.on("restoreMessage", (notificationId: string) => {
      const message = recycleBinMsg.find(
        (msg) => msg.notification_id === notificationId
      );

      try {
        if (!message) return;
        if (message.status === "DRAFT") {
          setDraftMessages((prev) => [message, ...prev]);
          setTotalDraftMessages((prev) => prev + 1);
        } else {
          if (message.sender === userId) {
            setSentMessages((prev) => [message, ...prev]);
            setTotalSentMessages((prev) => prev + 1);
          } else {
            setReceivedMessages((prev) => [message, ...prev]);
            setTotalReceivedMessages((prev) => prev + 1);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        const newRecycle = recycleBinMsg.filter(
          (msg) => msg.notification_id !== notificationId
        );
        setRecycleBinMsg(newRecycle);
        setTotalRecycleBinMsg((prev) => prev - 1);
      }
    });

    // device Action
    socket.on("addDevice", (device: IUserLinkedDevices) => {
      setLinkedDevices((prev) => {
        if (
          prev.some(
            (item) =>
              item.id === device.id && item.is_active === device.is_active
          )
        ) {
          return prev;
        } else {
          const removed = prev.filter((item) => item.id !== device.id);
          return [device, ...removed];
        }
      });
    });

    socket.on("inactiveDevice", (data) => {
      // console.log(data, "data");
      deviceSync(data);
      setLinkedDevices((prev) => {
        if (
          prev.some(
            (item) => item.id === data.id && item.is_active === data.is_active
          )
        ) {
          return prev;
        } else {
          const removed = prev.filter((item) => item.id !== data.id);
          return [data, ...removed];
        }
      });
    });

    socket.on(
      "SentAlert",
      ({ alert, isAcknowledge }: { alert: Alerts; isAcknowledge: boolean }) => {
        if (isAcknowledge) {
          setAlerts((prev) => {
            const newExistingAlerts = prev.filter(
              (item) => item.alert_id !== alert.alert_id
            );
            return [alert, ...newExistingAlerts];
          });

          setUnreadTotalAlert((prev) =>
            prev.filter((item) => item.alert_id !== alert.alert_id)
          );
        } else {
          setAlerts((prev) => [alert, ...prev]);
          setUnreadTotalAlert((prev) => [alert, ...prev]);
        }
      }
    );

    return () => {
      socket.off("receivedMessage");
      socket.off("sentMessage");
      socket.off("draftMessage");
      socket.off("draftMessageId");
      socket.off("sync");
      socket.off("deletedMessage");
      socket.off("addDevice");
      socket.off("inactiveDevice");
      socket.off("restoreMessage");
      socket.off("SentAlert");
      // socket.off("connect");
      // socket.disconnect();
    };
  }, [
    draftMessages,
    receivedMessages,
    recycleBinMsg,
    sentMessages,
    setLinkedDevices,
    socket,
    socketMessage,
    totalRecycleBinMsg,
    presentDevice,
    userId,
  ]);

  // messages Action
  const handlesendMessage = (notificationId: string, sender: number) => {
    socket.emit("sendMessage", { notificationId, sender });
  };

  const handleDisconnect = () => {
    socket.disconnect();
  };

  const handleRead = (parentID: string) => {
    socket.emit("read", { parentID, sender: userId });
  };
  const handleDeleteMessage = (notificationId: string) => {
    socket.emit("deleteMessage", { notificationId, sender: userId });
  };

  const handleDraftMessage = (notificationId: string, sender: number) => {
    socket.emit("sendDraft", { notificationId, sender });
  };

  const handleDraftMsgId = (notificationId: string) => {
    socket.emit("draftMsgId", { notificationId, sender: userId });
  };

  const handleRestoreMessage = (notificationId: string, sender: number) => {
    socket.emit("restoreMessage", { notificationId, sender });
  };

  // device Action
  const addDevice = (deviceId: number) => {
    socket.emit("addDevice", { deviceId, userId: userId });
  };

  const inactiveDevice = (inactiveDevices: IUserLinkedDevices[]) => {
    if (!token || token.user_id === 0 || !inactiveDevice?.length) return;
    socket.emit("inactiveDevice", { inactiveDevices, userId });
  };

  const handleSendAlert = (
    alertId: number,
    recipients: number[],
    isAcknowledge: boolean
  ) => {
    socket.emit("SendAlert", { alertId, recipients, isAcknowledge });
  };

  return (
    <SocketContext.Provider
      value={{
        handlesendMessage,
        handleDisconnect,
        handleRead,
        handleDeleteMessage,
        socketMessage,
        setSocketMessages,
        receivedMessages,
        setReceivedMessages,
        sentMessages,
        setSentMessages,
        draftMessages,
        setDraftMessages,
        recycleBinMsg,
        setRecycleBinMsg,
        handleDraftMessage,
        totalReceivedMessages,
        setTotalReceivedMessages,
        totalSentMessages,
        setTotalSentMessages,
        totalDraftMessages,
        setTotalDraftMessages,
        totalRecycleBinMsg,
        handleDraftMsgId,
        addDevice,
        inactiveDevice,
        linkedDevices,
        setLinkedDevices,
        handleRestoreMessage,
        alerts,
        setAlerts,
        unreadTotalAlert,
        setUnreadTotalAlert,
        handleSendAlert,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
