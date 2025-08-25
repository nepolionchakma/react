import { Card } from "@/components/ui/card";
import {
  renderUserName,
  renderProfilePicture,
  renderSlicedUsername,
} from "@/Utility/NotificationUtils";

import { ArrowLeft, Ellipsis, MessageCircleReply } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReplyDialog from "./ReplyDialog";
import { Notification } from "@/types/interfaces/users.interface";
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

const SingleSent = () => {
  const api = useAxiosPrivate();
  const { handleDeleteMessage } = useSocketContext();
  const { userId, users } = useGlobalContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const url = import.meta.env.VITE_NODE_ENDPOINT_URL;
  const idString = useParams();
  const id = idString.id;

  const [totalMessages, setTotalMessages] = useState<Notification[]>([]);
  const [parrentMessage, setParrentMessage] = useState<Notification>({
    notification_id: "",
    notification_type: "",
    sender: 0,
    recipients: [],
    subject: "",
    notification_body: "",
    creation_date: new Date(),
    status: "",
    parent_notification_id: "",
    involved_users: [],
    readers: [],
    holders: [],
    recycle_bin: [],
  });
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  //Fetch TotalReplyMessages
  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await api.get<Notification[]>(
          `/notifications/reply/${id}/${userId}`
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
  }, [id, toast, api, userId]);

  useEffect(() => {
    if (totalMessages.length === 0 && isLoaded) {
      setTimeout(() => {
        navigate("/notifications/sent");
      }, 500);
    }
  }, [isLoaded, navigate, totalMessages.length]);

  //Fetch SingleMessage
  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await api.get<Notification>(`/notifications/${id}`);
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
  }, [id, toast, api]);

  const handleDelete = async (msgId: string) => {
    try {
      const response = await api.put(
        `/notifications/move-to-recyclebin/${msgId}/${userId}`
      );
      if (response.status === 200) {
        handleDeleteMessage(msgId as string);
        setTotalMessages((prev) =>
          prev.filter((msg) => msg.notification_id !== msgId)
        );
        toast({
          title: `${response.data.message}`,
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
          <div className="flex items-center gap-2">
            <CustomTooltip tooltipTitle="Back">
              <span>
                <Link to="/notifications/sent">
                  <ArrowLeft size={20} />
                </Link>
              </span>
            </CustomTooltip>

            <CustomTooltip tooltipTitle="Reply">
              <span
                className="cursor-pointer"
                onClick={() => setShowModal(true)}
              >
                <MessageCircleReply size={20} />
              </span>
            </CustomTooltip>

            <p className="font-bold">{parrentMessage.subject}</p>
          </div>
          <div className="flex flex-col gap-4 w-full ">
            {totalMessages.map((msg) => (
              <div className="flex gap-4 items-start" key={msg.notification_id}>
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={`${url}/${renderProfilePicture(msg.sender, users)}`}
                  />
                  <AvatarFallback>
                    {renderSlicedUsername(msg.sender, users, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col w-full">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <p className="font-semibold">
                        {renderUserName(msg.sender, users)}
                      </p>
                      <div className="text-sm gap-1 flex items-center">
                        <span className="text-dark-400">to</span>
                        <span>{renderUserName(msg.recipients[0], users)}</span>
                        {msg.recipients.length > 1 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger className="focus:outline-none">
                              {" "}
                              <Ellipsis strokeWidth={1} size={16} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="p-2">
                              {msg.recipients
                                .slice(1, msg.recipients.length + 1)
                                .map((rcvr, i) => (
                                  <div
                                    className="flex items-center gap-2 mb-1"
                                    key={i}
                                  >
                                    <Avatar className="w-5 h-5 ">
                                      <AvatarImage
                                        src={`${url}/${renderProfilePicture(
                                          rcvr,
                                          users
                                        )}`}
                                      />
                                      <AvatarFallback>
                                        {renderSlicedUsername(rcvr, users, 1)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <p>{renderUserName(rcvr, users)}</p>
                                  </div>
                                ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-sm text-dark-400">
                        {convertDate(msg.creation_date)}
                      </p>
                      <div className="flex items-center">
                        <Alert
                          disabled={false}
                          actionName="move to Recycle Bin"
                          onContinue={() => handleDelete(msg.notification_id)}
                          tooltipTitle="Move to Recycle Bin"
                          tooltipAdjustmentStyle="mr-6"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-dark-400 mb-2">
                    {renderMessage(msg.notification_body)}
                  </p>
                  <div className="bg-gray-200 h-[0.7px] w-full"></div>
                </div>
              </div>
            ))}
          </div>
          {showModal && (
            <ReplyDialog
              setTotalMessages={setTotalMessages}
              parrentMessage={parrentMessage}
              setShowModal={setShowModal}
            />
          )}
        </Card>
      )}
    </div>
  );
};

export default SingleSent;
