import { Send, Delete, ArrowLeft, Save } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ChangeEvent, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { useToast } from "@/components/ui/use-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Message, UserModel } from "@/types/interfaces/users.interface";
import Spinner from "@/components/Spinner/Spinner";
import { useSocketContext } from "@/Context/SocketContext/SocketContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import Alert from "@/components/Alert/Alert";
import CustomTooltip from "@/components/Tooltip/Tooltip";
// import { v4 as uuidv4 } from "uuid";

interface IOldMsgTypes {
  receivers?: UserModel[];
  subject?: string;
  body?: string;
}
const SingleDraft = () => {
  const api = useAxiosPrivate();
  const { users, token, user } = useGlobalContext();
  const {
    handlesendMessage,
    // totalDraftMessages,
    handleDraftMessage,
    handleDeleteMessage,
    handleDraftMsgId,
  } = useSocketContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const url = import.meta.env.VITE_NODE_ENDPOINT_URL;
  const idString = useParams();
  const id = idString.id;
  const date = new Date();
  const [parentid, setParentid] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [recivers, setRecivers] = useState<UserModel[]>([]);
  const [subject, setSubject] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isAllClicked, setIsAllClicked] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [saveDraftLoading, setSaveDraftLoading] = useState(false);
  const [oldMsgState, setOldMsgState] = useState<IOldMsgTypes | undefined>({});
  const [userChanged, setuserChanged] = useState<boolean>(false);
  const sender = {
    name: token?.user_name,
    profile_picture: token?.profile_picture?.thumbnail,
  };
  const receiverNames = recivers.map((rcvr) => rcvr.name);
  const totalusers = [...receiverNames, token?.user_name];
  const involvedusers = [...new Set(totalusers)];

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await api.get<Message>(`/messages/${id}`);
        const result = response.data;
        setParentid(result.parentid);
        setStatus(result.status);
        setRecivers(result.recivers);
        setSubject(result.subject);
        setBody(result.body);
        setOldMsgState({
          receivers: result?.recivers,
          subject: result?.subject,
          body: result?.body,
        });
      } catch (error) {
        if (error instanceof Error) {
          toast({ title: error.message, variant: "destructive" });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessage();
  }, [id, api]);

  const actualUsers = users.filter((usr) => usr.user_name !== user);

  const handleQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const filterdUser = actualUsers.filter((user) =>
    user.user_name.toLowerCase().includes(query.toLowerCase())
  );

  const handleReciever = (reciever: UserModel) => {
    if (receiverNames.includes(reciever.name)) {
      const newArray = recivers.filter((rcvr) => rcvr.name !== reciever.name);
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
      const newReceivers = actualUsers.map((usr) => {
        return {
          name: usr.user_name,
          profile_picture: usr.profile_picture?.thumbnail,
        };
      });
      setRecivers(newReceivers);
    } else {
      setIsAllClicked(false);
      setRecivers([]);
    }
    setQuery("");
  };

  const handleRemoveReciever = (reciever: string) => {
    const newRecipients = recivers.filter((rcvr) => rcvr.name !== reciever);
    setRecivers(newRecipients);
  };

  const handleSend = async () => {
    // const newID = uuidv4();
    const data = {
      id: id as string,
      sender,
      recivers,
      subject,
      body,
      date,
      status: "Sent",
      parentid,
      involvedusers,
      readers: receiverNames,
      holders: involvedusers,
      recyclebin: [],
    };

    const sendNotificationPayload = {
      id,
      parentid: id,
      date,
      sender: sender,
      recivers: recivers,
      subject,
      body,
    };

    try {
      setIsSending(true);

      const deletedMsg = await api.delete(`/messages/${id}`);
      const newMsg = await api.post(`/messages`, data);
      if (newMsg.data && deletedMsg.data) {
        handleDraftMsgId(id as string);
        handlesendMessage(data);
        await api.post(
          "/push-notification/send-notification",
          sendNotificationPayload
        );
        toast({
          title: "Message Sent",
        });
        setTimeout(async () => {
          navigate("/notifications/drafts");
        }, 500);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      }
    } finally {
      setRecivers([]);
      setSubject("");
      setBody("");
      setIsSending(false);
    }
  };

  const handleDraft = async () => {
    const data = {
      id: id as string,
      sender,
      recivers,
      subject,
      body,
      date,
      status: status,
      parentid,
      involvedusers,
      readers: receiverNames,
      holders: [sender.name],
      recyclebin: [],
    };

    // handlesendMessage(data);
    try {
      setSaveDraftLoading(true);
      const response = await api.put(`/messages/${id}`, data);
      if (response.status === 200) {
        handleDraftMessage(data);
        toast({
          title: "Message saved to drafts",
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
      setSaveDraftLoading(false);
    }
    // navigate("/notifications/draft");
  };

  const handleDelete = async () => {
    try {
      const response = await api.put(
        `/messages/set-user-into-recyclebin/${id}/${token.user_name}`
      );
      if (response.status === 200) {
        handleDeleteMessage(id as string);
        navigate("/notifications/drafts");
        toast({
          title: "Message has been moved to recyclebin.",
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      }
    }
  };

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

  return (
    <div className="w-full flex justify-center">
      {isLoading ? (
        <div className="flex h-[50vh] items-center">
          <Spinner size="80" color="#000000" />
        </div>
      ) : (
        <Card className="w-full mb-4">
          <CardHeader>
            <div className="flex text-dark-400">
              <CustomTooltip tooltipTitle="Back">
                <span className="p-1 rounded-md h-7">
                  <Link to="/notifications/drafts">
                    <ArrowLeft size={20} color="black" />
                  </Link>
                </span>
              </CustomTooltip>

              <Alert
                disabled={false}
                actionName="move to Recycle Bin"
                onContinue={handleDelete}
                tooltipTitle="Move to Recycle Bin"
              />
            </div>
            <CardTitle className=" font-bold">Draft Message Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 justify-between">
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
                        onClick={() =>
                          handleReciever({
                            name: user.user_name,
                            profile_picture: user.profile_picture?.thumbnail,
                          })
                        }
                        key={user.user_id}
                        className="flex justify-between px-2 items-center hover:bg-light-200 cursor-pointer"
                      >
                        <div className="flex flex-row gap-1 items-center">
                          <Avatar className="h-4 w-4">
                            <AvatarImage
                              src={`${url}/${user.profile_picture?.thumbnail}`}
                            />
                            <AvatarFallback>
                              {user.user_name.slice(0, 1)}
                            </AvatarFallback>
                          </Avatar>

                          <p>{user.user_name}</p>
                        </div>
                        {receiverNames.includes(user.user_name) ? (
                          <Check size={14} color="#038C5A" />
                        ) : null}
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex gap-2 w-[calc(100%-11rem)] justify-end">
                  <div className="rounded-sm max-h-[4.5rem] scrollbar-thin overflow-auto flex flex-wrap gap-1">
                    {recivers
                      .filter((usr) => usr.name !== user)
                      .map((rec) => (
                        <div
                          key={rec.name}
                          className="flex gap-1 border h-8 px-2 items-center rounded-sm"
                        >
                          <Avatar className="h-4 w-4">
                            <AvatarImage
                              src={`${url}/${rec.profile_picture}`}
                            />
                            <AvatarFallback>
                              {rec.name.slice(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                          <p className="font-semibold text-green-600">
                            {rec.name}
                          </p>
                          <div
                            onClick={() => handleRemoveReciever(rec.name)}
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
                <div className="rounded-sm outline-none border pl-2 h-8 w-full text-sm flex items-center">
                  {subject.includes("Re:") && <p className="text-sm">Re: </p>}
                  <input
                    type="text"
                    className="outline-none pl-1 w-full text-sm"
                    value={
                      subject.includes("Re:")
                        ? subject.split("Re: ")[1]
                        : subject
                    }
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setSubject(e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full text-dark-400">
                <label className="font-semibold ">Body</label>
                <textarea
                  className="rounded-sm outline-none border pl-2 h-36 w-full scrollbar-thin text-sm"
                  value={body}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setBody(e.target.value)
                  }
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <div className="flex gap-2">
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
                {saveDraftLoading ? (
                  <Spinner size="20" color="#ffffff" />
                ) : (
                  <Save size={18} />
                )}
                <p className="font-semibold ">Save</p>
              </button>
              <button
                // if body empty then disabled
                disabled={body === ""}
                onClick={handleSend}
                className={`${
                  body === "" || subject === "" || recivers.length === 0
                    ? " bg-dark-400 cursor-not-allowed"
                    : " bg-dark-100 cursor-pointer"
                } flex gap-1 items-center px-5 py-2 rounded-r-full rounded-l-md text-white hover:scale-95 duration-300`}
              >
                {isSending ? (
                  <Spinner size="20" color="#ffffff" />
                ) : (
                  <Send size={18} />
                )}
                <p className="font-semibold ">Send</p>
              </button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default SingleDraft;
