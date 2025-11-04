import Spinner from "@/components/Spinner/Spinner";

import { useToast } from "@/components/ui/use-toast";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { useSocketContext } from "@/Context/SocketContext/SocketContext";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { Notification } from "@/types/interfaces/users.interface";
import { Reply, Save, X } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  renderUserName,
  renderProfilePicture,
  renderSlicedUsername,
} from "@/Utility/NotificationUtils";
import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { NODE_URL } from "@/Api/Api";
import { postData } from "@/Utility/funtion";

interface ReplyDialogProps {
  parrentMessage: Notification | undefined;
  setStateChange: React.Dispatch<React.SetStateAction<number>>;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const ReplyDialog = ({
  parrentMessage,
  setStateChange,
  setShowModal,
}: ReplyDialogProps) => {
  const api = useAxiosPrivate();
  const { users, userId, combinedUser, token } = useGlobalContext();
  const { handlesendMessage, handleDraftMessage } = useSocketContext();
  const [subject, setSubject] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);

  const id = uuidv4();

  const { toast } = useToast();

  const url = import.meta.env.VITE_NODE_ENDPOINT_URL;
  // const totalInvolved = parrentMessage.involved_users
  const recivers = parrentMessage?.involved_users.filter(
    (rcvr) => rcvr !== userId
  );

  useEffect(() => {
    setSubject(`Re: ${parrentMessage?.subject}`);
  }, [parrentMessage?.subject]);

  const handleSend = async () => {
    if (subject.length > 100) {
      toast({
        title: "The subject should not exceed 100 characters.",
        variant: "destructive",
      });
      return;
    }
    const data = {
      notification_id: id,
      notification_type: "NOTIFICATION",
      sender: userId,
      recipients: recivers,
      subject: subject,
      notification_body: body,
      status: "SENT",
      creation_date: new Date(),
      parent_notification_id: parrentMessage?.parent_notification_id,
      involved_users: parrentMessage?.involved_users,
      readers: recivers,
      holders: parrentMessage?.involved_users,
      recycle_bin: [],
      action_item_id: parrentMessage?.action_item_id,
      alert_id: parrentMessage?.alert_id,
    };

    const pushNotificationPayload = {
      notificationID: id,
      parentId: parrentMessage?.parent_notification_id,
      date: new Date(),
      sender: combinedUser?.user_name,
      recipients: recivers,
      subject,
      body,
    };
    try {
      setIsSending(true);
      const sendNotificationParams = {
        baseURL: NODE_URL,
        url: "/notifications",
        setLoading: setIsSending,
        payload: data,
        isToast: true,
        accessToken: token.access_token,
      };
      const response = await postData(sendNotificationParams);

      if (response.status === 201) {
        handlesendMessage(
          data.notification_id,
          data.sender,
          data.recipients,
          "Sent"
        );
        setStateChange((prev) => prev + 3);

        const pushNotificationParams = {
          baseURL: NODE_URL,
          url: "/push-notification/send-notification",
          setLoading: setIsSending,
          payload: pushNotificationPayload,
          accessToken: token.access_token,
          isToast: false,
          // isConsole?: boolean;
        };

        await postData(pushNotificationParams);
      }
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof Error) {
        toast({
          title: error.message,
        });
      }
    } finally {
      setIsSending(false);
      setSubject("");
      setBody("");
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
    const data = {
      notification_id: id,
      notification_type: "NOTIFICATION",
      sender: userId,
      recipients: recivers,
      subject: `${subject}`,
      notification_body: body,
      status: "DRAFT",
      creation_date: new Date(),
      parent_notification_id: parrentMessage?.parent_notification_id,
      involved_users: parrentMessage?.involved_users,
      readers: recivers,
      holders: [userId],
      recycle_bin: [],
      action_item_id: parrentMessage?.action_item_id,
      alert_id: parrentMessage?.alert_id,
    };
    try {
      setIsDrafting(true);
      const response = await api.post(`/notifications`, data);
      if (response.status === 201) {
        handleDraftMessage(data.notification_id, data.sender, "New");
        toast({
          title: `${response.data.message}`,
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsDrafting(false);
      setBody("");
    }
  };

  return (
    <>
      <CustomModal4 className="w-[700px]">
        <div className="flex justify-between px-2 items-center bg-[#CEDEF2] h-[41px]">
          <p className="font-semibold">Reply</p>
          <button onClick={() => setShowModal(false)}>
            <X />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-auto scrollbar-thin p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-dark-400">Recipients</label>
              <div className="w-full border p-1 rounded-sm bg-gray-100 max-h-[4.5rem] scrollbar-thin overflow-auto flex flex-wrap gap-1">
                {recivers?.map((rec: number) => (
                  <div
                    key={rec}
                    className="flex gap-1 border h-8 px-2 items-center rounded-full bg-white"
                  >
                    <Avatar className="h-4 w-4">
                      <AvatarImage
                        src={`${url}/${renderProfilePicture(rec, users)}`}
                      />
                      <AvatarFallback>
                        {renderSlicedUsername(rec, users, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-semibold ">
                      {renderUserName(rec, users)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full text-dark-400">
              <label className="font-semibold ">Subject</label>
              <div className="rounded-sm outline-none border pl-2 h-8 w-full text-sm flex items-center bg-gray-100">
                <input
                  disabled={true}
                  type="text"
                  value={subject}
                  className="outline-none pl-1 w-full text-sm"
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setSubject(e.target.value)
                  }
                />
              </div>
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

          <div className="flex mt-4 justify-end gap-2">
            <button
              disabled={body.length === 0 || body === ""}
              onClick={handleDraft}
              className={`${
                body.length === 0 || body === ""
                  ? "cursor-not-allowed bg-dark-400"
                  : "cursor-pointer bg-dark-100 hover:bg-dark-100/80"
              } flex gap-1 items-center px-6 py-2 rounded-md text-white`}
            >
              {isDrafting ? (
                <Spinner size="20" color="#ffffff" />
              ) : (
                <Save size={18} />
              )}
              <p className="font-semibold ">Save as drafts</p>
            </button>
            <button
              disabled={recivers?.length === 0 || body === ""}
              onClick={handleSend}
              className={`${
                body.length === 0 || body === "" || recivers?.length === 0
                  ? "cursor-not-allowed bg-dark-400"
                  : "cursor-pointer bg-dark-100 hover:bg-dark-100/80"
              } flex gap-1 items-center px-6 py-2 rounded-md text-white`}
            >
              {isSending ? (
                <Spinner size="20" color="#ffffff" />
              ) : (
                <Reply size={18} />
              )}
              <p className="font-semibold ">Reply</p>
            </button>
          </div>
        </div>
      </CustomModal4>
    </>
  );
};

export default ReplyDialog;
