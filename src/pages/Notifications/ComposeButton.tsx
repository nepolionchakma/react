import { MailPlus, Send, Delete, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// import { send } from "process";

const ComposeButton = () => {
  const api = useAxiosPrivate();
  const { users, token } = useGlobalContext();
  const { handlesendMessage, handleDraftMessage } = useSocketContext();
  const { toast } = useToast();
  const [recivers, setRecivers] = useState<number[]>([]);
  const [notifcationType, setNotificationType] = useState("REGULAR");
  const [subject, setSubject] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isAllClicked, setIsAllClicked] = useState(true);
  const id = uuidv4();
  // const date = new Date();
  const apiUrl = import.meta.env.VITE_NODE_ENDPOINT_URL;

  const totalusers = [...recivers, token.user_id];
  const involvedusers = [...new Set(totalusers)];
  const actualUsers = users.filter((usr) => usr.user_id !== token.user_id);

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

  const renderUserName = (id: number) => {
    const user = users.find((usr) => usr.user_id === id);

    return user?.user_name;
  };

  const renderAvatarFallback = (id: number) => {
    const user = users.find((usr) => usr.user_id === id);

    if (user) {
      const userName = user?.user_name;
      return userName.slice(0, 1).toUpperCase();
    }
  };

  const renderProfilePicture = (id: number) => {
    const user = users.find((usr) => usr.user_id === id);

    return user?.profile_picture.thumbnail;
  };

  const handleSend = async () => {
    const notifcationData = {
      notification_id: id,
      notification_type: notifcationType,
      sender: token.user_id,
      recipients: recivers,
      subject: subject,
      notification_body: body,
      status: "Sent",
      creation_date: new Date(),
      parent_notification_id: id,
      involved_users: involvedusers,
      readers: recivers,
      holders: involvedusers,
      recycle_bin: [],
      action_item_id: null,
      alert_id: null,
    };

    // const sendNotificationPayload = {
    //   id,
    //   parentid: id,
    //   date,
    //   sender: token.user_id,
    //   recivers: recivers,
    //   subject,
    //   body,
    // };
    try {
      setIsSending(true);

      const response = await api.post(`/notifications`, notifcationData);

      if (response.status === 201) {
        handlesendMessage(notifcationData);
        // await api.post(
        //   "/push-notification/send-notification",
        //   sendNotificationPayload
        // );
        toast({
          title: "Message Sent",
        });
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
    }
  };

  const handleDraft = async () => {
    const data = {
      notification_id: id,
      notification_type: notifcationType,
      sender: token.user_id,
      recipients: recivers,
      subject: subject,
      notification_body: body,
      status: "Draft",
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
      setIsDrafting(true);
      const response = await api.post(`/messages`, data);
      if (response.status === 201) {
        handleDraftMessage(data);
        toast({
          title: "Message saved to drafts",
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      }
    } finally {
      setIsDrafting(false);
      setRecivers([]);
      setSubject("");
      setBody("");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex gap-2 items-center px-5 py-2 rounded-xl bg-dark-100 text-white hover:scale-95 duration-300 fixed bottom-4">
          <MailPlus size={18} />
          <p className="font-semibold ">Compose</p>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className=" font-bold">New Message</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="bg-dark-100 text-white w-44 h-8 rounded-sm font-semibold ">
                Select Recipients
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60 max-h-[255px] overflow-auto scrollbar-thin ml-16">
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
                          src={`${apiUrl}/${user.profile_picture?.thumbnail}`}
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

            <div className="w-[calc(100%-11rem)]">
              <div className="rounded-sm max-h-[4.5rem] scrollbar-thin overflow-auto flex flex-wrap gap-1 justify-end">
                {recivers.map((rec) => (
                  <div
                    key={rec}
                    className="flex gap-1 border h-8 px-2 items-center rounded-sm"
                  >
                    <Avatar className="h-4 w-4">
                      <AvatarImage
                        src={`${apiUrl}/${renderProfilePicture(rec)}`}
                      />
                      <AvatarFallback>
                        {renderAvatarFallback(rec)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-semibold text-green-600">
                      {renderUserName(rec)}
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
          </div>

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
        <DialogFooter className="flex">
          {/* {recivers.length > 0 || body !== "" || subject !== "" ? ( */}
          <button
            disabled={recivers.length === 0 && body === "" && subject === ""}
            onClick={handleDraft}
            className={`${
              recivers.length === 0 && body === "" && subject === ""
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
          {/* ) : null}
           {recivers.length === 0 || body === "" ? null : ( */}
          <button
            disabled={recivers.length === 0 || body === "" || subject === ""}
            onClick={handleSend}
            className={`${
              recivers.length === 0 || body === "" || subject === ""
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComposeButton;
