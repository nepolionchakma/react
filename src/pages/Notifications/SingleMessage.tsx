import { Card } from "@/components/ui/card";
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
import {
  renderUserName,
  renderProfilePicture,
  renderSlicedUsername,
} from "@/Utility/NotificationUtils";
import { NODE_URL } from "@/Api/Api";
import { loadData } from "@/Utility/funtion";

const SingleMessage = () => {
  const api = useAxiosPrivate();
  const { handleDeleteMessage } = useSocketContext();
  const { userId, users, token } = useGlobalContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stateChange, setStateChange] = useState(0);

  const navigate = useNavigate();
  const url = import.meta.env.VITE_NODE_ENDPOINT_URL;
  const { id } = useParams();

  const [totalMessages, setTotalMessages] = useState<Notification[]>([]);
  const [parrentMessage, setParrentMessage] = useState<
    Notification | undefined
  >(undefined);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  //Fetch TotalReplyMessages
  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const loadParams = {
          baseURL: NODE_URL,
          url: `/notifications/reply?parent_notification_id=${id}`,
          setLoading: setIsLoading,
          accessToken: token.access_token,
          isToast: false,
        };
        const response = await loadData(loadParams);

        console.log(response);
        if (response) {
          const result = response.result;

          setTotalMessages(result);
          setIsLoaded(true);
        }
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
  }, [id, toast, api, userId, stateChange, token.access_token]);

  //Fetch SingleMessage
  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await api.get(
          `/notifications/unique?notification_id=${id}&user_id=${userId}`
        );
        const result = response.data.result;
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
  }, [id, toast, api, userId]);

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
        `/notifications/move-to-recyclebin?notification_id=${msgId}&user_id=${userId}`
      );
      if (response.status === 200) {
        handleDeleteMessage(msgId as string, "Inbox");
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

  const renderMessage = (msg: string | undefined) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    // Split the message by URLs and wrap each URL with <a> tag
    if (msg) {
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
    }
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
                <Link to="/notifications/inbox">
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
            <p className="font-bold">{parrentMessage?.subject}</p>
          </div>
          <div className="flex flex-col gap-4 w-full ">
            {totalMessages.map((msg) => (
              <div className="flex gap-4 items-start" key={msg.notification_id}>
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={`${url}/${renderProfilePicture(msg.user_id, users)}`}
                  />
                  <AvatarFallback>
                    {renderSlicedUsername(msg.user_id, users, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col w-full">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <p className="font-semibold">
                        {renderUserName(msg.user_id, users)}
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
                    {renderMessage(msg?.notification_body)}
                  </p>
                  <div className="bg-gray-200 h-[0.7px] w-full"></div>
                </div>
              </div>
            ))}
          </div>
          {showModal && (
            <ReplyDialog
              setStateChange={setStateChange}
              parrentMessage={parrentMessage}
              setShowModal={setShowModal}
            />
          )}
        </Card>
      )}
    </div>
  );
};

export default SingleMessage;
