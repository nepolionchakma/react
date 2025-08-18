import { Send, Delete, Save, ChevronDown, X } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChangeEvent, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { useToast } from "@/components/ui/use-toast";
import Spinner from "@/components/Spinner/Spinner";
import { useSocketContext } from "@/Context/SocketContext/SocketContext";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import {
  renderUserName,
  renderProfilePicture,
  renderSlicedUsername,
} from "@/Utility/NotificationUtils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toTitleCase } from "@/Utility/general";
import { loadData, putData } from "@/Utility/funtion";
import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { Notification } from "@/types/interfaces/users.interface";

interface ComposeButtonProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  draftNotification: Notification;
}

interface IOldMsgTypes {
  receivers?: number[];
  subject?: string;
  body?: string;
  alertName?: string;
  alertDescription?: string;
  actionItemName?: string;
  actionItemDescription?: string;
}

const SingleDraft = ({
  setShowModal,
  draftNotification,
}: ComposeButtonProps) => {
  const api = useAxiosPrivate();
  const { users, token } = useGlobalContext();
  const {
    handlesendMessage,
    handleDraftMessage,
    handleSendAlert,
    handleDraftMsgId,
  } = useSocketContext();
  const { toast } = useToast();
  const [recivers, setRecivers] = useState<number[]>(
    draftNotification.recipients
  );
  const notifcationType = draftNotification.notification_type;
  const [subject, setSubject] = useState<string>(draftNotification.subject);
  const [body, setBody] = useState<string>(draftNotification.notification_body);
  const [query, setQuery] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAllClicked, setIsAllClicked] = useState(true);
  const [alertName, setAlertName] = useState<string>("");
  const [alertDescription, setAlertDescription] = useState<string>("");
  const [actionItemName, setActionItemName] = useState<string>("");
  const [actionItemDescription, setActionItemDescription] =
    useState<string>("");
  const [userChanged, setuserChanged] = useState<boolean>(false);
  const [oldMsgState, setOldMsgState] = useState<IOldMsgTypes>({
    receivers: draftNotification.recipients,
    subject: draftNotification.subject,
    body: draftNotification.notification_body,
  });
  const actionItemStatus = "NEW";

  // const date = new Date();
  const nodeUrl = import.meta.env.VITE_NODE_ENDPOINT_URL;
  const flaskUrl = import.meta.env.VITE_FLASK_ENDPOINT_URL;

  const totalusers = [...recivers, token.user_id];
  const involvedusers = [...new Set(totalusers)];
  const actualUsers = users.filter((usr) => usr.user_id !== token.user_id);

  const filterdUser = actualUsers.filter((user) =>
    user.user_name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      if (notifcationType === "ALERT") {
        const params = {
          baseURL: nodeUrl,
          url: `/alerts/${draftNotification.alert_id}`,
          setLoading: setIsLoading,
        };

        const alertResponse = await loadData(params);
        console.log(alertResponse, `/alerts/${draftNotification.alert_id}`);
        if (alertResponse) {
          setOldMsgState((prev) => ({
            ...prev,
            alertName: alertResponse.alert_name,
            alertDescription: alertResponse.description,
          }));
          setAlertName(alertResponse.alert_name);
          setAlertDescription(alertResponse.description);
        }
      } else if (notifcationType === "ACTION ITEM") {
        const params = {
          baseURL: flaskUrl,
          url: `/def_action_items/${draftNotification.action_item_id}`,
          setLoading: setIsLoading,
        };

        const actionItemResponse = await loadData(params);
        if (actionItemResponse) {
          setOldMsgState((prev) => ({
            ...prev,
            actionItemName: actionItemResponse.action_item_name,
            actionItemDescription: actionItemResponse.description,
          }));
          setActionItemName(actionItemResponse.action_item_name);
          setActionItemDescription(actionItemResponse.description);
        }
      }
    };

    fetchData();
  }, [
    draftNotification.action_item_id,
    draftNotification.alert_id,
    flaskUrl,
    nodeUrl,
    notifcationType,
  ]);

  useEffect(() => {
    const handleUserChange = async () => {
      if (oldMsgState?.receivers?.length ?? 0 > 0) {
        if (oldMsgState?.receivers?.length !== recivers.length) {
          setuserChanged(true);
        } else {
          oldMsgState?.receivers?.map((receiver) => {
            const res = recivers.every((recvr) => {
              if (receiver !== recvr) {
                return true;
              } else {
                return false;
              }
            });
            setuserChanged(res);
          });
        }
      } else if (recivers.length > 0) {
        if (recivers.length !== oldMsgState?.receivers?.length) {
          setuserChanged(true);
        } else {
          recivers.map((receiver) => {
            const res = oldMsgState?.receivers?.every((recvr) => {
              if (receiver !== recvr) {
                return true;
              } else {
                return false;
              }
            });
            setuserChanged(res ?? false);
          });
        }
      } else {
        setuserChanged(false);
      }
    };
    handleUserChange();
  }, [recivers, oldMsgState?.receivers]);

  const handleQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleReciever = (reciever: number) => {
    if (recivers.includes(reciever)) {
      const newArray = recivers.filter((rcvr) => rcvr !== reciever);
      setRecivers(newArray);
      setQuery("");
    } else {
      setRecivers((prevArray) => [...prevArray, reciever]);
      setQuery("");
    }
  };

  const handleSelectAll = () => {
    if (!isAllClicked) {
      setIsAllClicked(true);
      const newReceivers = actualUsers.map((usr) => usr.user_id);
      setRecivers(newReceivers);
    } else {
      setIsAllClicked(false);
      setRecivers([]);
    }
    setQuery("");
  };

  const handleRemoveReciever = (reciever: number) => {
    const newRecipients = recivers.filter((rcvr) => rcvr !== reciever);
    setRecivers(newRecipients);
  };

  const handleSend = async () => {
    const notifcationData = {
      sender: token.user_id,
      recipients: recivers,
      subject: subject,
      notification_body: body,
      status: "SENT",
      creation_date: new Date(),
      involved_users: involvedusers,
      readers: recivers,
      holders: involvedusers,
      recycle_bin: [],
    };

    const sendNotificationPayload = {
      notificationID: draftNotification.notification_id,
      parentId: draftNotification.parent_notification_id,
      date: new Date(),
      sender: token.user_name,
      recipients: recivers,
      subject,
      body,
    };
    try {
      const sendNotificationParams = {
        baseURL: nodeUrl,
        url: `/notifications/${draftNotification.notification_id}`,
        setLoading: setIsSending,
        payload: notifcationData,
        isToast: true,
      };
      const response = await putData(sendNotificationParams);

      if (response.status === 200) {
        await api.post(
          "/push-notification/send-notification",
          sendNotificationPayload
        );

        if (notifcationType === "ALERT") {
          const alertParams = {
            baseURL: nodeUrl,
            url: `/alerts/${draftNotification.alert_id}`,
            setLoading: setIsSending,
            payload: {
              alert_name: alertName,
              description: alertDescription,
              recepients: recivers,
              last_updated_by: token.user_id,
            },
            isToast: false,
          };

          await putData(alertParams);
          handleSendAlert(
            draftNotification.alert_id as number,
            recivers,
            false
          );
        }

        if (notifcationType === "ACTION ITEM") {
          const actionItemParams = {
            baseURL: flaskUrl,
            url: `/def_action_items/${draftNotification.action_item_id}`,
            setLoading: setIsSending,
            payload: {
              action_item_name: actionItemName,
              description: actionItemDescription,
              status: actionItemStatus,
              user_ids: recivers,
            },
            isToast: false,
          };

          await putData(actionItemParams);
        }
        handlesendMessage(
          draftNotification.notification_id,
          notifcationData.sender
        );
        handleDraftMsgId(draftNotification.notification_id as string);
      }
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof Error) {
        toast({
          title: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsSending(false);
      setRecivers([]);
      setSubject("");
      setBody("");
      setAlertName("");
      setAlertDescription("");
      setActionItemName("");
      setActionItemDescription("");
    }
  };

  const handleDraft = async () => {
    const data = {
      sender: token.user_id,
      recipients: recivers,
      subject: subject,
      notification_body: body,
      status: "DRAFT",
      creation_date: new Date(),
      involved_users: involvedusers,
      readers: recivers,
      holders: involvedusers,
      recycle_bin: [],
    };
    try {
      setIsDrafting(true);
      const sendNotificationParams = {
        baseURL: nodeUrl,
        url: `/notifications/${draftNotification.notification_id}`,
        setLoading: setIsDrafting,
        payload: data,
        isToast: false,
      };
      const response = await putData(sendNotificationParams);
      if (response.status === 200) {
        if (notifcationType === "ALERT") {
          const alertParams = {
            baseURL: nodeUrl,
            url: `/alerts/${draftNotification.alert_id}`,
            setLoading: setIsDrafting,
            payload: {
              alert_name: alertName,
              description: alertDescription,
              last_updated_by: token.user_id,
              recipients: recivers,
            },
            isToast: false,
          };

          await putData(alertParams);
        }

        if (notifcationType === "ACTION ITEM") {
          const actionItemParams = {
            baseURL: flaskUrl,
            url: `/def_action_items/${draftNotification.action_item_id}`,
            setLoading: setIsDrafting,
            payload: {
              action_item_name: actionItemName,
              description: actionItemDescription,
              status: actionItemStatus,
              user_ids: recivers,
            },
            isToast: false,
          };

          await putData(actionItemParams);
        }

        handleDraftMessage(
          draftNotification.notification_id as string,
          data.sender
        );
        toast({
          title: `${response.data.message}`,
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      }
    } finally {
      setIsDrafting(false);
    }
  };

  return (
    <CustomModal4 className="w-[700px]">
      <div className="flex justify-between px-2 items-center bg-[#CEDEF2] h-[41px]">
        <p className="font-semibold">Edit {toTitleCase(notifcationType)}</p>
        <button onClick={() => setShowModal(false)}>
          <X />
        </button>
      </div>

      {isLoading ? (
        <div className="w-full h-[80vh] items-center justify-center flex">
          <Spinner size="80" color="black" />
        </div>
      ) : (
        <div className="max-h-[80vh] overflow-auto scrollbar-thin p-4">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="w-full border-b border-light-400 h-8 rounded-sm border flex justify-between items-center px-2">
                <p>{toTitleCase(notifcationType)}</p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger className="w-full border-b border-light-400 h-8 rounded-sm border flex justify-between items-center px-2">
                  <p>Select Recipients</p>
                  <ChevronDown strokeWidth={1} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[330px] max-h-[280px] overflow-auto scrollbar-thin">
                  <input
                    type="text"
                    className="w-full bg-light-100 border-b border-light-400 outline-none pl-2"
                    placeholder="Search..."
                    value={query}
                    onChange={handleQueryChange}
                  />
                  <div
                    onClick={handleSelectAll}
                    className="flex justify-between px-2 items-center hover:bg-light-200 cursor-pointer"
                  >
                    <p>All</p>
                  </div>
                  {filterdUser.map((user) => (
                    <div
                      onClick={() => handleReciever(user.user_id)}
                      key={user.user_id}
                      className="flex justify-between px-2 items-center hover:bg-light-200 cursor-pointer"
                    >
                      <div className="flex flex-row gap-1 items-center">
                        <Avatar className="h-4 w-4">
                          <AvatarImage
                            src={`${nodeUrl}/${user.profile_picture?.thumbnail}`}
                          />
                          <AvatarFallback>
                            {user.user_name.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>

                        <p>{user.user_name}</p>
                      </div>
                      {recivers.includes(user.user_id) ? (
                        <Check size={14} color="#038C5A" />
                      ) : null}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {recivers.length > 0 && (
              <div className="w-full border p-1 rounded-sm bg-light-200">
                <div className="rounded-sm max-h-[4.5rem] scrollbar-thin overflow-auto flex flex-wrap gap-1">
                  {recivers.map((rec) => (
                    <div
                      key={rec}
                      className="flex gap-1 border h-8 px-2 items-center rounded-full bg-white"
                    >
                      <Avatar className="h-4 w-4">
                        <AvatarImage
                          src={`${nodeUrl}/${renderProfilePicture(rec, users)}`}
                        />
                        <AvatarFallback>
                          {renderSlicedUsername(rec, users, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-semibold text-green-600">
                        {renderUserName(rec, users)}
                      </p>
                      <div
                        onClick={() => handleRemoveReciever(rec)}
                        className="flex h-[65%] items-end cursor-pointer"
                      >
                        <Delete size={18} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 w-full text-dark-400">
              <label className="font-semibold ">Subject</label>
              <input
                type="text"
                className="rounded-sm outline-none border pl-2 h-8 w-full text-sm"
                value={subject}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSubject(e.target.value)
                }
              />
            </div>
            <div className="flex flex-col gap-2 w-full text-dark-400">
              <label className="font-semibold ">Body</label>
              <textarea
                className="rounded-sm outline-none border pl-2 h-40 w-full scrollbar-thin text-sm"
                value={body}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setBody(e.target.value)
                }
              />
            </div>
          </div>

          {(notifcationType === "ALERT" ||
            notifcationType === "ACTION ITEM") && (
            <div className="flex items-center justify-between my-4">
              <div className="bg-slate-300 flex-grow h-[0.5px]"></div>
              <p className="font-semibold border p-1 rounded-sm bg-light-200">
                {toTitleCase(notifcationType)}
              </p>
              <div className="bg-slate-300 flex-grow h-[0.5px]"></div>
            </div>
          )}

          {notifcationType === "ALERT" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 w-full text-dark-400">
                <label className="font-semibold ">Alert Name</label>
                <input
                  type="text"
                  className="rounded-sm outline-none border pl-2 h-8 w-full text-sm"
                  value={alertName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setAlertName(e.target.value)
                  }
                />
              </div>

              <div className="flex flex-col gap-2 w-full text-dark-400">
                <label className="font-semibold ">Alert Description</label>
                <textarea
                  className="rounded-sm outline-none border pl-2 h-20 w-full scrollbar-thin text-sm"
                  value={alertDescription}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setAlertDescription(e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {notifcationType === "ACTION ITEM" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 w-full text-dark-400">
                <label className="font-semibold ">Action Item Name</label>
                <input
                  type="text"
                  className="rounded-sm outline-none border pl-2 h-8 w-full text-sm"
                  value={actionItemName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setActionItemName(e.target.value)
                  }
                />
              </div>

              <div className="flex flex-col gap-2 w-full text-dark-400">
                <label className="font-semibold ">
                  Action Item Description
                </label>
                <textarea
                  className="rounded-sm outline-none border pl-2 h-20 w-full scrollbar-thin text-sm"
                  value={actionItemDescription}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setActionItemDescription(e.target.value)
                  }
                />
              </div>
            </div>
          )}

          <div className="flex mt-4 justify-end gap-2">
            {/* {recivers.length > 0 || body !== "" || subject !== "" ? ( */}
            {notifcationType === "ALERT" && (
              <button
                disabled={
                  !userChanged &&
                  oldMsgState?.subject === subject &&
                  oldMsgState?.body === body &&
                  oldMsgState?.alertDescription === alertDescription &&
                  oldMsgState?.alertName === alertName
                }
                onClick={handleDraft}
                className={`${
                  !userChanged &&
                  oldMsgState?.subject === subject &&
                  oldMsgState?.body === body &&
                  oldMsgState?.alertDescription === alertDescription &&
                  oldMsgState?.alertName === alertName
                    ? "cursor-not-allowed bg-dark-400"
                    : "cursor-pointer bg-dark-100"
                } flex gap-1 items-center px-4 py-1 rounded-l-full rounded-r-md  text-white hover:scale-95 duration-300`}
              >
                {isDrafting ? (
                  <Spinner size="20" color="#ffffff" />
                ) : (
                  <Save size={18} />
                )}
                <p className="font-semibold ">Save</p>
              </button>
            )}

            {notifcationType === "ACTION ITEM" && (
              <button
                disabled={
                  !userChanged &&
                  oldMsgState?.subject === subject &&
                  oldMsgState?.body === body &&
                  oldMsgState?.actionItemName === actionItemName &&
                  oldMsgState?.actionItemDescription === actionItemDescription
                }
                onClick={handleDraft}
                className={`${
                  !userChanged &&
                  oldMsgState?.subject === subject &&
                  oldMsgState?.body === body &&
                  oldMsgState?.actionItemName === actionItemName &&
                  oldMsgState?.actionItemDescription === actionItemDescription
                    ? "cursor-not-allowed bg-dark-400"
                    : "cursor-pointer bg-dark-100"
                } flex gap-1 items-center px-4 py-1 rounded-l-full rounded-r-md  text-white hover:scale-95 duration-300`}
              >
                {isDrafting ? (
                  <Spinner size="20" color="#ffffff" />
                ) : (
                  <Save size={18} />
                )}
                <p className="font-semibold ">Save</p>
              </button>
            )}

            {notifcationType === "NOTIFICATION" && (
              <button
                //if receivers, subject, body change by any how then enabled button
                disabled={
                  !userChanged &&
                  oldMsgState?.subject === subject &&
                  oldMsgState?.body === body
                }
                onClick={handleDraft}
                className={`${
                  !userChanged &&
                  oldMsgState?.subject === subject &&
                  oldMsgState?.body === body
                    ? " bg-dark-400 cursor-not-allowed"
                    : " bg-dark-100 cursor-pointer"
                } flex gap-1 items-center px-5 py-2 rounded-l-full rounded-r-md text-white hover:scale-95 duration-300`}
              >
                {isDrafting ? (
                  <Spinner size="20" color="#ffffff" />
                ) : (
                  <Save size={18} />
                )}
                <p className="font-semibold ">Save</p>
              </button>
            )}

            {/* ) : null}
           {recivers.length === 0 || body === "" ? null : ( */}
            <button
              disabled={
                recivers.length === 0 ||
                body === "" ||
                subject === "" ||
                (notifcationType === "ALERT" && alertName === "") ||
                (notifcationType === "ALERT" && alertDescription === "") ||
                (notifcationType === "ACTION ITEM" && actionItemName === "") ||
                (notifcationType === "ACTION ITEM" &&
                  actionItemDescription === "")
              }
              onClick={handleSend}
              className={`${
                recivers.length === 0 ||
                body === "" ||
                subject === "" ||
                (notifcationType === "ALERT" && alertName === "") ||
                (notifcationType === "ALERT" && alertDescription === "") ||
                (notifcationType === "ACTION ITEM" && actionItemName === "") ||
                (notifcationType === "ACTION ITEM" &&
                  actionItemDescription === "")
                  ? "cursor-not-allowed bg-dark-400"
                  : "cursor-pointer bg-dark-100"
              } flex gap-1 items-center px-4 py-1 rounded-r-full rounded-l-md text-white hover:scale-95 duration-300`}
            >
              {isSending ? (
                <Spinner size="20" color="#ffffff" />
              ) : (
                <Send size={18} />
              )}
              <p className="font-semibold ">Send</p>
            </button>
            {/* )} */}
          </div>
        </div>
      )}
    </CustomModal4>
  );
};

export default SingleDraft;
