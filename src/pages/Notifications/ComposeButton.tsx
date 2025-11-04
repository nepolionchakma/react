import { Send, Delete, Save, ChevronDown, X } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChangeEvent, useState } from "react";
import { Check } from "lucide-react";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";
import Spinner from "@/components/Spinner/Spinner";
import { useSocketContext } from "@/Context/SocketContext/SocketContext";
import {
  renderUserName,
  renderProfilePicture,
  renderSlicedUsername,
} from "@/Utility/NotificationUtils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toTitleCase } from "@/Utility/general";
import { postData } from "@/Utility/funtion";
import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { NODE_URL } from "@/Api/Api";

interface ComposeButtonProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const ComposeButton = ({ setShowModal }: ComposeButtonProps) => {
  const { users, combinedUser, token, userId } = useGlobalContext();
  const { handlesendMessage, handleDraftMessage, handleSendAlert } =
    useSocketContext();
  const { toast } = useToast();
  const [recivers, setRecivers] = useState<number[]>([]);
  const [notifcationType, setNotificationType] =
    useState<string>("NOTIFICATION");
  const [subject, setSubject] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isAllClicked, setIsAllClicked] = useState(true);
  const [alertName, setAlertName] = useState<string>("");
  const [alertDescription, setAlertDescription] = useState<string>("");
  const [actionItemName, setActionItemName] = useState<string>("");
  const [actionItemDescription, setActionItemDescription] =
    useState<string>("");

  const id = uuidv4();
  // const date = new Date();
  const nodeUrl = import.meta.env.VITE_NODE_ENDPOINT_URL;
  const flaskUrl = import.meta.env.VITE_FLASK_ENDPOINT_URL;

  const totalusers = [...recivers, userId];
  const involvedusers = [...new Set(totalusers)];
  const actualUsers = users.filter(
    (usr) => usr.user_id !== combinedUser?.user_id
  );

  const filterdUser = actualUsers.filter((user) =>
    user.user_name.toLowerCase().includes(query.toLowerCase())
  );

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
    if (subject.length > 100) {
      toast({
        title: "The subject should not exceed 100 characters.",
        variant: "destructive",
      });
      return;
    }

    if (actionItemName.length > 100) {
      toast({
        title: "The Action Item Name should not exceed 100 characters.",
        variant: "destructive",
      });
      return;
    }

    if (alertName.length > 100) {
      toast({
        title: "The Alert Name should not exceed 100 characters.",
        variant: "destructive",
      });
      return;
    }
    const notifcationData = {
      notification_id: id,
      notification_type: notifcationType,
      sender: userId,
      recipients: recivers,
      subject: subject,
      notification_body: body,
      status: "SENT",
      creation_date: new Date(),
      parent_notification_id: id,
      involved_users: involvedusers,
      readers: recivers,
      holders: involvedusers,
      recycle_bin: [],
      action_item_id: null,
      alert_id: null,
    };

    const sendNotificationPayload = {
      notificationID: id,
      parentId: id,
      date: new Date(),
      sender: combinedUser?.user_name,
      recipients: recivers,
      subject,
      body,
    };
    try {
      const sendNotificationParams = {
        baseURL: nodeUrl,
        url: "/notifications",
        setLoading: setIsSending,
        payload: notifcationData,
        isToast: notifcationType === "NOTIFICATION" ? true : false,
        accessToken: token.access_token,
      };

      const response = await postData(sendNotificationParams);
      if (response.status === 201) {
        if (notifcationType === "ALERT") {
          const alertParams = {
            baseURL: NODE_URL,
            url: "/alerts",
            setLoading: setIsSending,
            payload: {
              alert_name: alertName,
              description: alertDescription,
              recepients: recivers,
              notification_id: id,
              status: "SENT",
            },
            isToast: true,
            accessToken: token.access_token,
          };

          const alertResponse = await postData(alertParams);

          if (alertResponse.status === 201) {
            handleSendAlert(
              alertResponse.data.result.alert_id,
              recivers,
              false
            );
          }
        }

        if (notifcationType === "ACTION ITEM") {
          const actionItemParams = {
            baseURL: flaskUrl,
            url: "/def_action_items",
            setLoading: setIsSending,
            payload: {
              action_item_name: actionItemName,
              description: actionItemDescription,
              user_ids: recivers,
              notification_id: id,
              action: "SENT",
            },
            isToast: true,
            accessToken: token.access_token,
          };

          await postData(actionItemParams);
        }

        handlesendMessage(
          notifcationData.notification_id,
          notifcationData.sender,
          notifcationData.recipients,
          "Sent"
        );

        const pushNotificationParams = {
          baseURL: nodeUrl,
          url: "/push-notification/send-notification",
          setLoading: setIsSending,
          payload: sendNotificationPayload,
          accessToken: token.access_token,
        };

        await postData(pushNotificationParams);
      }
    } catch (error) {
      console.error("Error:", error);
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
    if (subject.length > 100) {
      toast({
        title: "The subject should not exceed 100 characters.",
        variant: "destructive",
      });
      return;
    }
    if (actionItemName.length > 100) {
      toast({
        title: "The Action Item Name should not exceed 100 characters.",
        variant: "destructive",
      });
      return;
    }

    if (alertName.length > 100) {
      toast({
        title: "The Alert Name should not exceed 100 characters.",
        variant: "destructive",
      });
      return;
    }
    const data = {
      notification_id: id,
      notification_type: notifcationType,
      sender: combinedUser?.user_id,
      recipients: recivers,
      subject: subject,
      notification_body: body,
      status: "DRAFT",
      creation_date: new Date(),
      parent_notification_id: id,
      involved_users: involvedusers,
      readers: recivers,
      holders: involvedusers,
      recycle_bin: [],
      action_item_id: null,
      alert_id: null,
    };
    try {
      const draftParams = {
        baseURL: NODE_URL,
        url: "/notifications",
        setLoading: setIsDrafting,
        payload: data,
        // isConsole?: boolean;
        isToast: notifcationType === "NOTIFICATION" ? true : false,
        accessToken: token.access_token,
      };
      const response = await postData(draftParams);
      if (response.status === 201) {
        if (notifcationType === "ALERT") {
          const alertParams = {
            baseURL: nodeUrl,
            url: "/alerts",
            setLoading: setIsDrafting,
            payload: {
              alert_name: alertName,
              description: alertDescription,
              recepients: recivers,
              notification_id: id,
              status: "DRAFT",
            },
            isToast: true,
          };

          await postData(alertParams);
        }

        if (notifcationType === "ACTION ITEM") {
          const actionItemParams = {
            baseURL: flaskUrl,
            url: "/def_action_items",
            setLoading: setIsDrafting,
            payload: {
              action_item_name: actionItemName,
              description: actionItemDescription,
              user_ids: recivers,
              notification_id: id,
              action: "DRAFT",
            },
            isToast: true,
            accessToken: token.access_token,
          };
          await postData(actionItemParams);
        }

        handleDraftMessage(data.notification_id, data.sender, "New");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
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

  return (
    <CustomModal4 className="w-[700px]">
      <div className="flex justify-between px-2 items-center bg-[#CEDEF2] h-[41px]">
        <p className="font-semibold">New {toTitleCase(notifcationType)}</p>
        <button onClick={() => setShowModal(false)}>
          <X />
        </button>
      </div>
      <div className="max-h-[80vh] overflow-auto scrollbar-thin p-4">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-2 ">
              <label className="font-semibold text-dark-400">Type</label>
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full border-b border-light-400 h-8 rounded-sm border flex justify-between items-center px-2">
                  <p>{`${toTitleCase(notifcationType)}` || "Select Type"}</p>
                  <ChevronDown strokeWidth={1} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[330px] max-h-[255px] overflow-auto scrollbar-thin">
                  <div
                    onClick={() => setNotificationType("NOTIFICATION")}
                    className="flex justify-between px-2 items-center hover:bg-light-200 cursor-pointer"
                  >
                    <p>Notification</p>
                    {notifcationType === "NOTIFICATION" && (
                      <Check size={14} color="#038C5A" />
                    )}
                  </div>
                  <div
                    onClick={() => setNotificationType("ACTION ITEM")}
                    className="flex justify-between px-2 items-center hover:bg-light-200 cursor-pointer"
                  >
                    <p>Action Item</p>
                    {notifcationType === "ACTION ITEM" && (
                      <Check size={14} color="#038C5A" />
                    )}
                  </div>
                  <div
                    onClick={() => setNotificationType("ALERT")}
                    className="flex justify-between px-2 items-center hover:bg-light-200 cursor-pointer"
                  >
                    <p>Alert</p>
                    {notifcationType === "ALERT" && (
                      <Check size={14} color="#038C5A" />
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-dark-400">Recipients</label>
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

        {(notifcationType === "ALERT" || notifcationType === "ACTION ITEM") && (
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
              <label className="font-semibold ">Action Item Description</label>
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
          <button
            disabled={
              (recivers.length === 0 && body === "" && subject === "") ||
              (notifcationType === "ALERT" && alertName === "") ||
              (notifcationType === "ALERT" && alertDescription === "") ||
              (notifcationType === "ACTION ITEM" && actionItemName === "") ||
              (notifcationType === "ACTION ITEM" &&
                actionItemDescription === "")
            }
            onClick={handleDraft}
            className={`${
              (recivers.length === 0 && body === "" && subject === "") ||
              (notifcationType === "ALERT" && alertName === "") ||
              (notifcationType === "ALERT" && alertDescription === "") ||
              (notifcationType === "ACTION ITEM" && actionItemName === "") ||
              (notifcationType === "ACTION ITEM" &&
                actionItemDescription === "")
                ? "cursor-not-allowed bg-dark-400"
                : "cursor-pointer bg-dark-100 hover:bg-dark-100/80"
            } flex gap-1 items-center px-6 py-2 rounded-md text-white`}
          >
            {isDrafting ? (
              <Spinner size="20" color="#ffffff" />
            ) : (
              <Save size={18} />
            )}
            <p className="font-semibold ">Save as draft</p>
          </button>
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
                : "cursor-pointer bg-dark-100 hover:bg-dark-100/80"
            } flex gap-1 items-center px-6 py-2 rounded-md text-white`}
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
    </CustomModal4>
  );
};

export default ComposeButton;
