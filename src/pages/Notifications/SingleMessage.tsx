import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ArrowLeft, Ellipsis } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReplyDialog from "./ReplyDialog";
import { Message } from "@/types/interfaces/users.interface";
import { useToast } from "@/components/ui/use-toast";
import Spinner from "@/components/Spinner/Spinner";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { useSocketContext } from "@/Context/SocketContext/SocketContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import Alert from "@/components/Alert/Alert";
import CustomTooltip from "@/components/Tooltip/Tooltip";

const SingleMessage = () => {
  const api = useAxiosPrivate();
  const { handleDeleteMessage } = useSocketContext();
  const { token, user } = useGlobalContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const url = import.meta.env.VITE_NODE_ENDPOINT_URL;
  const { id } = useParams();

  const [totalMessages, setTotalMessages] = useState<Message[]>([]);
  const [parrentMessage, setParrentMessage] = useState<Message>({
    id: "",
    sender: { name: "", profile_picture: "" },
    recivers: [],
    subject: "",
    body: "",
    date: new Date(),
    status: "",
    parentid: "",
    involvedusers: [],
    readers: [],
    holders: [],
    recyclebin: [],
  });
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  //Fetch TotalReplyMessages
  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await api.get<Message[]>(
          `/messages/reply/${id}/${user}`
        );
        const result = response.data;
        setTotalMessages(result);
        setIsLoaded(true);
      } catch (error) {
        if (error instanceof Error) {
          toast({
            title: `${error.message}}`,
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessage();
  }, [id, toast, api, user]);

  //Fetch SingleMessage
  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await api.get<Message>(`/messages/${id}`);
        const result = response.data;
        setParrentMessage(result);
      } catch (error) {
        if (error instanceof Error) {
          toast({
            title: `${error.message}}`,
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessage();
  }, [id, toast, api, user]);

  useEffect(() => {
    if (totalMessages.length === 0 && isLoaded) {
      setTimeout(() => {
        navigate("/notifications/inbox");
      }, 500);
    }
  }, [isLoaded, navigate, totalMessages.length]);

  const handleDelete = async (msgId: string) => {
    try {
      const response = await api.put(
        `/messages/set-user-into-recyclebin/${msgId}/${token.user_name}`
      );
      if (response.status === 200) {
        handleDeleteMessage(msgId as string);
        setTotalMessages((prev) => prev.filter((msg) => msg.id !== msgId));
        toast({
          title: "Message has been moved to recyclebin.",
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: `${error.message}`,
          variant: "destructive",
        });
      }
    }
  };

  const convertDate = (isoDateString: Date) => {
    const date = new Date(isoDateString);
    const formattedDate = date.toLocaleString();
    return formattedDate;
  };

  const renderMessage = (msg: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    // Split the message by URLs and wrap each URL with <a> tag
    const parts = msg.split(urlRegex);

    return parts.map((part, index) => {
      // If the part matches the URL pattern, return a link
      if (urlRegex.test(part)) {
        return (
          <a
            href={part}
            key={index}
            className="text-blue-700 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {part}
          </a>
        );
      }

      // Otherwise, return the text and convert newlines to <br />
      return part.split("\n").map((line, lineIndex) => (
        <React.Fragment key={lineIndex}>
          {line}
          <br />
        </React.Fragment>
      ));
    });
  };
  return (
    <div className="flex justify-center items-center w-full mb-4">
      {isLoading ? (
        <div className="flex h-[50vh] items-center">
          <Spinner size="80" color="#000000" />
        </div>
      ) : (
        <Card className="flex flex-col gap-4 w-full p-4">
          <div className="flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="p-1 rounded-md  h-7">
                    <Link to="/notifications/inbox">
                      <ArrowLeft size={20} />
                    </Link>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Back</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <p className="font-bold ml-4">{parrentMessage.subject}</p>
          </div>
          <div className="flex flex-col gap-4 w-full ">
            {totalMessages.map((msg) => (
              <div className="flex gap-4 items-start" key={msg.id}>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={`${url}/${msg.sender.profile_picture}`} />
                  <AvatarFallback>{msg.sender.name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col w-full">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <p className="font-semibold">{msg.sender.name}</p>
                      <div className="text-sm gap-1 flex items-center">
                        <span className="text-dark-400">to</span>
                        <span>{msg.recivers[0].name}</span>
                        {msg.recivers.length > 1 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger className="focus:outline-none">
                              {" "}
                              <Ellipsis strokeWidth={1} size={16} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="p-2">
                              {msg.recivers
                                .slice(1, msg.recivers.length + 1)
                                .map((rcvr, i) => (
                                  <div
                                    className="flex items-center gap-2 mb-1"
                                    key={i}
                                  >
                                    <Avatar className="w-5 h-5 ">
                                      <AvatarImage
                                        src={`${url}/${rcvr.profile_picture}`}
                                      />
                                      <AvatarFallback>
                                        {rcvr.name.slice(0, 1)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <p>{rcvr.name}</p>
                                  </div>
                                ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-sm text-dark-400">
                        {convertDate(msg.date)}
                      </p>
                      <div className="flex items-center">
                        <CustomTooltip tooltipTitle="Reply">
                          <span>
                            <ReplyDialog
                              setTotalMessages={setTotalMessages}
                              parrentMessage={parrentMessage}
                            />
                          </span>
                        </CustomTooltip>

                        <Alert
                          disabled={false}
                          actionName="move to Recycle Bin"
                          onContinue={() => handleDelete(msg.id)}
                          tooltipTitle="Move to Recycle Bin"
                          tooltipAdjustmentStyle="mr-6"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-dark-400 mb-2">
                    {renderMessage(msg.body)}
                  </p>
                  <div className="bg-gray-200 h-[0.7px] w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SingleMessage;
