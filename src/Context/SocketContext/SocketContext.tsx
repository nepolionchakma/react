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
  DraftNotificationType,
  DraftPayload,
  IUserLinkedDevices,
  MessagePayload,
  Notification,
  NotificationType,
  SentNotificationType,
  SentPayload,
} from "@/types/interfaces/users.interface";
import { io } from "socket.io-client";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { getUserLocation, watchGeoPermission } from "@/Utility/locationUtils";
import { AlertPayload, Alerts } from "@/types/interfaces/alerts.interface";

interface SocketContextProps {
  children: ReactNode;
}

interface SocketContext {
  receivedMessages: Notification[];
  handlesendMessage: (
    notificationId: string | undefined,
    sender: number | undefined,
    recipients: number[] | undefined,
    type: SentNotificationType
  ) => void;
  handleDisconnect: () => void;
  handleRead: (id: string) => void;
  handleDeleteMessage: (id: string, type: NotificationType) => void;
  setReceivedMessages: React.Dispatch<React.SetStateAction<Notification[]>>;
  socketMessage: Notification[];
  setSocketMessages: React.Dispatch<React.SetStateAction<Notification[]>>;
  sentMessages: Notification[];
  setSentMessages: React.Dispatch<React.SetStateAction<Notification[]>>;
  draftMessages: Notification[];
  setDraftMessages: React.Dispatch<React.SetStateAction<Notification[]>>;
  recycleBinMsg: Notification[];
  setRecycleBinMsg: React.Dispatch<React.SetStateAction<Notification[]>>;
  handleDraftMessage: (
    notificationId: string,
    sender: number | undefined,
    type: DraftNotificationType
  ) => void;
  totalReceivedMessages: number;
  setTotalReceivedMessages: React.Dispatch<React.SetStateAction<number>>;
  totalSentMessages: number;
  setTotalSentMessages: React.Dispatch<React.SetStateAction<number>>;
  totalDraftMessages: number;
  setTotalDraftMessages: React.Dispatch<React.SetStateAction<number>>;
  totalRecycleBinMsg: number;
  // handleDraftMsgId: (id: string) => void;
  addDevice: (deviceId: number) => void;
  inactiveDevice: (data: IUserLinkedDevices[]) => void;
  linkedDevices: IUserLinkedDevices[];
  setLinkedDevices: React.Dispatch<React.SetStateAction<IUserLinkedDevices[]>>;
  alerts: Alerts[];
  setAlerts: React.Dispatch<React.SetStateAction<Alerts[]>>;
  unreadTotalAlert: Alerts[];
  setUnreadTotalAlert: React.Dispatch<React.SetStateAction<Alerts[]>>;
  handleRestoreMessage: (
    id: string,
    user: number,
    type: NotificationType
  ) => void;
  handleSendAlert: (
    alertId: number,
    recipients: number[],
    isAcknowledge: boolean
  ) => void;
  handleParmanentDeleteMessage: (notificationId: string) => void;
}

const SocketContext = createContext({} as SocketContext);

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
      if (!token || userId === 0) return;
      const res = await api.get(`/alerts/view?user_id=${userId}`);

      if (res.status === 200) {
        setUnreadTotalAlert(res.data.result);
      }
    };
    fetchUnreadTotalAlert();
  }, [api, token, userId]);

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
          api.get(`/notifications/unread?user_id=${userId}`),
          api.get(`/notifications/received?user_id=${userId}`),
          api.get(`/notifications/sent?user_id=${userId}`),
          api.get(`/notifications/drafts?user_id=${userId}`),
          api.get(`/notifications/recyclebin?user_id=${userId}`),
        ]);
        setSocketMessages(notificationTotal.data.result);
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

  useEffect(() => {
    socket.on("receivedMessage", (data: Notification) => {
      const receivedMessagesId = receivedMessages.map(
        (msg) => msg.notification_id
      );
      if (receivedMessagesId.includes(data.notification_id)) {
        return;
      } else {
        setSocketMessages((prevArray) => [data, ...prevArray]);
        setReceivedMessages((prev) => [data, ...prev]);
        setTotalReceivedMessages((prev) => prev + 1);
      }
    });
    socket.on("sentMessage", ({ notification, type }: SentPayload) => {
      setSentMessages((prev) => [notification, ...prev]);
      setTotalSentMessages((prev) => prev + 1);
      // remove draft message from draftMessages
      if (type === "Draft") {
        setDraftMessages((prev) =>
          prev.filter(
            (item) => item.notification_id !== notification.notification_id
          )
        );
        setTotalDraftMessages((prev) => prev - 1);
      }
    });
    socket.on("draftMessage", ({ notification, type }: DraftPayload) => {
      if (type === "Old") {
        const newDraftMessages = draftMessages.filter(
          (msg) => msg.notification_id !== notification.notification_id
        );
        if (notification.recipients === undefined) {
          setDraftMessages(() => [
            { ...notification, recipients: [] },
            ...newDraftMessages,
          ]);
        } else {
          setDraftMessages(() => [notification, ...newDraftMessages]);
        }
      } else {
        if (notification.recipients === undefined) {
          setDraftMessages((prev) => [
            { ...notification, recipients: [] },
            ...prev,
          ]);
        } else {
          setDraftMessages((prev) => [notification, ...prev]);
        }
        setTotalDraftMessages((prev) => prev + 1);
      }
    });

    // socket.on("draftMessageId", (notificationId: string) => {
    //   // for sync socket draft messages
    //   const draftMessageId = draftMessages.map((msg) => msg.notification_id);
    //   if (draftMessageId.includes(notificationId)) {
    //     setDraftMessages((prev) =>
    //       prev.filter((item) => item.notification_id !== notificationId)
    //     );
    //   }
    //   setTotalDraftMessages((prev) => prev - 1);
    // });

    socket.on("sync", (parrentId: string) => {
      const synedSocketMessages = socketMessage.filter(
        (msg) => msg.parent_notification_id !== parrentId
      );
      setSocketMessages(synedSocketMessages);
    });
    socket.on("deletedMessage", ({ notification, type }: MessagePayload) => {
      if (type === "Inbox") {
        // add to recycleBinMsg
        setRecycleBinMsg((prev) => {
          const deletedMessages = receivedMessages.find(
            (msg) => msg.notification_id === notification.notification_id
          );
          if (!deletedMessages) return prev;
          return [deletedMessages, ...prev];
        });
        setTotalRecycleBinMsg((prev) => prev + 1);

        // if receive message includes the id then remove it
        setReceivedMessages((prev) =>
          prev.filter(
            (msg) => msg.notification_id !== notification.notification_id
          )
        );
        setTotalReceivedMessages((prev) => prev - 1);
        setSocketMessages((prev) =>
          prev.filter(
            (msg) => msg.notification_id !== notification.notification_id
          )
        );
      } else if (type === "Sent") {
        // add to recycleBinMsg

        setRecycleBinMsg((prev) => {
          const deletedMessages = sentMessages.find(
            (msg) => msg.notification_id === notification.notification_id
          );
          if (!deletedMessages) return prev;
          return [deletedMessages, ...prev];
        });
        setTotalRecycleBinMsg((prev) => prev + 1);

        // if receive message includes the id then remove it
        setSentMessages((prev) =>
          prev.filter(
            (msg) => msg.notification_id !== notification.notification_id
          )
        );
        setTotalSentMessages((prev) => prev - 1);
      } else if (type === "Drafts") {
        // add to recycleBinMsg
        setRecycleBinMsg((prev) => {
          const deletedMessages = draftMessages.find(
            (msg) => msg.notification_id === notification.notification_id
          );
          if (!deletedMessages) return prev;
          return [deletedMessages, ...prev];
        });
        setTotalRecycleBinMsg((prev) => prev + 1);

        // Check if the message is already deleted before updating
        setDraftMessages((prev) => {
          const filteredMessages = prev.filter(
            (msg) => msg.notification_id !== notification.notification_id
          );
          // Only update total if the message was actually removed

          return filteredMessages;
        });
        setTotalDraftMessages((prevTotal) => prevTotal - 1);
      } else if (type === "Recycle") {
        // Check if the message is already deleted before updating
        setRecycleBinMsg((prev) => {
          const filteredMessages = prev.filter(
            (msg) => msg.notification_id !== notification.notification_id
          );
          // Only update total if the message was actually removed
          // if (filteredMessages.length < prev.length) {

          // }
          return filteredMessages;
        });
        setTotalRecycleBinMsg(totalRecycleBinMsg - 1);
      }
    });

    socket.on("permanentDeleteMessage", (notificationId: string) => {
      setRecycleBinMsg((prev) => {
        const filteredMessages = prev.filter(
          (msg) => msg.notification_id !== notificationId
        );
        // Only update total if the message was actually removed
        // if (filteredMessages.length < prev.length) {

        // }
        return filteredMessages;
      });
      setTotalRecycleBinMsg(totalRecycleBinMsg - 1);
    });

    socket.on("restoreMessage", ({ notification, type }: MessagePayload) => {
      try {
        if (type === "Drafts") {
          setDraftMessages((prev) => [notification, ...prev]);
          setTotalDraftMessages((prev) => prev + 1);
        } else if (type === "Sent") {
          setSentMessages((prev) => [notification, ...prev]);
          setTotalSentMessages((prev) => prev + 1);
        } else if (type === "Inbox") {
          setReceivedMessages((prev) => [notification, ...prev]);
          setTotalReceivedMessages((prev) => prev + 1);
          if (notification.reader === true) {
            setSocketMessages((prev) => [...prev, notification]);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        const newRecycle = recycleBinMsg.filter(
          (msg) => msg.notification_id !== notification.notification_id
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
              item.id === device.id && item.is_online === device.is_online
          )
        ) {
          return prev;
        } else {
          const removed = prev.filter((item) => item.id !== device.id);
          return [device, ...removed];
        }
      });
    });

    socket.on("inactiveDevice", (data: IUserLinkedDevices) => {
      if (data.is_active === 0) {
        deviceSync(data);
      }

      setLinkedDevices((prev) => {
        if (
          prev.some(
            (item) => item.id === data.id && item.is_online === data.is_online
          )
        ) {
          return prev;
        } else {
          const removed = prev.filter((item) => item.id !== data.id);
          return [data, ...removed];
        }
      });
    });

    // socket.on(
    //   "SentAlert",
    //   ({ alert, isAcknowledge }: { alert: Alerts; isAcknowledge: boolean }) => {
    //     if (isAcknowledge) {
    //       setAlerts((prev) => {
    //         const newExistingAlerts = prev.filter(
    //           (item) => item.alert_id !== alert.alert_id
    //         );
    //         return [alert, ...newExistingAlerts];
    //       });

    //       setUnreadTotalAlert((prev) =>
    //         prev.filter((item) => item.alert_id !== alert.alert_id)
    //       );
    //     } else {
    //       setAlerts((prev) => [alert, ...prev]);
    //       setUnreadTotalAlert((prev) => [alert, ...prev]);
    //     }
    //   }
    // );

    socket.on("SentAlert", ({ alert, isAcknowledge }: AlertPayload) => {
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
        return;
      } else {
        setAlerts((prev) => [alert, ...prev]);
        setUnreadTotalAlert((prev) => [alert, ...prev]);
      }
    });

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
    alerts,
  ]);

  // messages Action
  const handlesendMessage = (
    notificationId: string | undefined,
    sender: number | undefined,
    recipients: number[] | undefined,
    type: SentNotificationType
  ) => {
    socket.emit("sendMessage", { notificationId, sender, recipients, type });
  };

  const handleDisconnect = () => {
    socket.disconnect();
  };

  const handleRead = (parentID: string) => {
    socket.emit("read", { parentID, sender: userId });
  };
  const handleDeleteMessage = (
    notificationId: string,
    type: NotificationType
  ) => {
    socket.emit("deleteMessage", { notificationId, sender: userId, type });
  };
  const handleParmanentDeleteMessage = (notificationId: string) => {
    socket.emit("permanentDeleteMessage", { notificationId, sender: userId });
  };

  const handleDraftMessage = (
    notificationId: string,
    sender: number | undefined,
    type: DraftNotificationType
  ) => {
    socket.emit("sendDraft", { notificationId, sender, type });
  };

  // const et.emit("draftMsgId", { notificationId, sender: userId });
  // };

  const handleRestoreMessage = (
    notificationId: string,
    sender: number,
    type: NotificationType
  ) => {
    socket.emit("restoreMessage", { notificationId, sender, type });
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
        handleParmanentDeleteMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
