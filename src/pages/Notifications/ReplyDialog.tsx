import Spinner from "@/components/Spinner/Spinner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useToast } from "@/components/ui/use-toast";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { useSocketContext } from "@/Context/SocketContext/SocketContext";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { Notification } from "@/types/interfaces/users.interface";
import { MessageCircleReply, Reply, Save } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  renderUserName,
  renderProfilePicture,
  renderSlicedUsername,
} from "@/Utility/NotificationUtils";

interface ReplyDialogProps {
  parrentMessage: Notification;
  setTotalMessages: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const ReplyDialog = ({
  parrentMessage,
  setTotalMessages,
}: ReplyDialogProps) => {
  const api = useAxiosPrivate();
  const { users, userId, token } = useGlobalContext();
  const { handlesendMessage, handleDraftMessage } = useSocketContext();
  const [subject, setSubject] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);

  const id = uuidv4();

  const { toast } = useToast();

  const url = import.meta.env.VITE_NODE_ENDPOINT_URL;
  const totalInvolved = [...parrentMessage.recipients, parrentMessage.sender];
  const recivers = totalInvolved.filter((rcvr) => rcvr !== userId);

  useEffect(() => {
    setSubject(`Re: ${parrentMessage.subject}`);
  }, [parrentMessage.subject]);

  const handleSend = async () => {
    const data = {
      notification_id: id,
      notification_type: parrentMessage.notification_type,
      sender: userId,
      recipients: recivers,
      subject: subject,
      notification_body: body,
      status: "SENT",
      creation_date: new Date(),
      parent_notification_id: parrentMessage.parent_notification_id,
      involved_users: parrentMessage.involved_users,
      readers: recivers,
      holders: parrentMessage.involved_users,
      recycle_bin: [],
      action_item_id: parrentMessage.action_item_id,
      alert_id: parrentMessage.alert_id,
    };

    const sendNotificationPayload = {
      notificationID: id,
      parentId: parrentMessage.parent_notification_id,
      date: new Date(),
      sender: token.user_name,
      recipients: recivers,
      subject,
      body,
    };
    try {
      setIsSending(true);
      const response = await api.post(`/notifications`, data);

      if (response.status === 201) {
        handlesendMessage(data.notification_id, data.sender);
        setTotalMessages((prev) => [data, ...prev]);
        await api.post(
          "/push-notification/send-notification",
          sendNotificationPayload
        );
        toast({
          title: `${response.data.message}`,
        });
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
    const data = {
      notification_id: id,
      notification_type: parrentMessage.notification_type,
      sender: userId,
      recipients: recivers,
      subject: `${subject}`,
      notification_body: body,
      status: "DRAFT",
      creation_date: new Date(),
      parent_notification_id: parrentMessage.parent_notification_id,
      involved_users: parrentMessage.involved_users,
      readers: recivers,
      holders: [userId],
      recycle_bin: [],
      action_item_id: parrentMessage.action_item_id,
      alert_id: parrentMessage.alert_id,
    };
    try {
      setIsDrafting(true);
      const response = await api.post(`/notifications`, data);
      if (response.status === 201) {
        handleDraftMessage(data.notification_id, data.sender);
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
    <Dialog>
      <DialogTrigger className="p-1 rounded-md">
        <MessageCircleReply size={20} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className=" font-bold">
            Reply
            {/* <p className="text-sm text-dark-400">To: {recivers.join(", ")}</p> */}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 items-center">
            <label className="font-semibold text-dark-400">To</label>
            <div className="rounded-sm max-h-[4.5rem] scrollbar-thin overflow-auto flex flex-wrap gap-1 justify-end">
              {recivers.map((rec) => (
                <div
                  key={rec}
                  className="flex gap-1 border h-8 px-2 items-center rounded-sm"
                >
                  <Avatar className="h-4 w-4">
                    <AvatarImage
                      src={`${url}/${renderProfilePicture(rec, users)}`}
                    />
                    <AvatarFallback>
                      {renderSlicedUsername(rec, users, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-semibold ">{renderUserName(rec, users)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full text-dark-400">
            <label className="font-semibold ">Subject</label>
            <div className="rounded-sm outline-none border pl-2 h-8 w-full text-sm flex items-center">
              <input
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

        <DialogFooter>
          <button
            disabled={body.length === 0 || body === ""}
            onClick={handleDraft}
            className={`${
              body.length === 0 || body === ""
                ? "cursor-not-allowed bg-dark-400"
                : "cursor-pointer bg-dark-100"
            } flex gap-1 items-center px-4 py-1 rounded-l-full rounded-r-md  text-white hover:scale-95 duration-300`}
          >
            {isDrafting ? (
              <Spinner size="20" color="#ffffff" />
            ) : (
              <Save size={18} />
            )}
            <p className="font-semibold ">Save as drafts</p>
          </button>
          <button
            disabled={recivers.length === 0 || body === ""}
            onClick={handleSend}
            className={`${
              body.length === 0 || body === "" || recivers.length === 0
                ? "cursor-not-allowed bg-dark-400"
                : "cursor-pointer bg-dark-100"
            } flex gap-1 items-center px-4 py-1 rounded-r-full rounded-l-md text-white hover:scale-95 duration-300`}
          >
            {isSending ? (
              <Spinner size="20" color="#ffffff" />
            ) : (
              <Reply size={18} />
            )}
            <p className="font-semibold ">Reply</p>
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReplyDialog;
