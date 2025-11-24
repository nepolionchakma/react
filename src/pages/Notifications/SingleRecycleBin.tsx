import { ArrowLeft, Ellipsis, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import React, { useEffect, useState } from "react";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { useToast } from "@/components/ui/use-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Notification } from "@/types/interfaces/users.interface";
import Spinner from "@/components/Spinner/Spinner";
import { useSocketContext } from "@/Context/SocketContext/SocketContext";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import Alert from "@/components/Alert/Alert";
import CustomTooltip from "@/components/Tooltip/Tooltip";
import {
  renderUserName,
  renderProfilePicture,
  renderSlicedUsername,
} from "@/Utility/NotificationUtils";
import { FLASK_URL, NODE_URL } from "@/Api/Api";
import { deleteData } from "@/Utility/funtion";

const SingleRecycleBin = () => {
  const api = useAxiosPrivate();
  const { userId, token, users } = useGlobalContext();
  const {
    handleDeleteMessage,
    handleRestoreMessage,
    handleParmanentDeleteMessage,
  } = useSocketContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const url = import.meta.env.VITE_NODE_ENDPOINT_URL;
  const idString = useParams();
  const id = idString.id;
  const [message, setMessage] = useState<Notification | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  //Fetch Message
  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await api.get(
          `/notifications/unique?notification_id=${id}&user_id=${userId}`
        );
        const result = response.data.result;
        setMessage(result);
      } catch (error) {
        if (error instanceof Error) {
          toast({ title: error.message, variant: "destructive" });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessage();
  }, [id, api, userId, toast]);

  const handleDelete = async () => {
    try {
      if (message?.alert_id && message?.status === "DRAFT") {
        const deleteAlertParams = {
          url: `alerts/${message.alert_id}`,
          baseURL: NODE_URL,
          accessToken: token.access_token,
        };
        const deletedAlert = await deleteData(deleteAlertParams);
        if (deletedAlert.status === 200) {
          const deleteNotificationParams = {
            url: `notifications/${message.notification_id}`,
            baseURL: NODE_URL,
            accessToken: token.access_token,
            isToast: true,
          };
          const deleteNotification = await deleteData(deleteNotificationParams);
          if (deleteNotification) {
            handleParmanentDeleteMessage(message.notification_id);
          }
        }
      } else if (message?.action_item_id && message?.status === "DRAFT") {
        const deleteActionItemParams = {
          url: `def_action_items/${message.action_item_id}`,
          baseURL: FLASK_URL,
          accessToken: token.access_token,
        };
        const deletedActionItem = await deleteData(deleteActionItemParams);
        if (deletedActionItem.status === 200) {
          const deleteNotificationParams = {
            url: `notifications/${message.notification_id}`,
            baseURL: NODE_URL,
            accessToken: token.access_token,
            isToast: true,
          };
          const deleteNotification = await deleteData(deleteNotificationParams);
          if (deleteNotification) {
            handleParmanentDeleteMessage(message.notification_id);
          }
        }
      } else if (
        message?.status === "DRAFT" &&
        message.notification_type === "NOTIFICATION"
      ) {
        const deleteNotificationParams = {
          url: `notifications/${message.notification_id}`,
          baseURL: NODE_URL,
          accessToken: token.access_token,
          isToast: true,
        };
        const deleteNotification = await deleteData(deleteNotificationParams);
        if (deleteNotification) {
          handleParmanentDeleteMessage(message.notification_id);
        }
      } else {
        const response = await api.put(
          `/notifications/remove-from-recyclebin?notification_id=${id}&user_id=${userId}`
        );
        if (response.status === 200) {
          handleDeleteMessage(id as string, "Recycle");
          navigate("/notifications/recycle-bin");
          toast({
            title: `${response.data.message}`,
          });
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      }
    }
  };

  const convertDate = (isoDateString: Date) => {
    const date = new Date(isoDateString);
    const formattedDate = date.toLocaleString();
    return formattedDate;
  };

  const findOrigin = (msg: Notification) => {
    if (msg.status === "DRAFT") {
      return "Drafts";
    } else {
      if (msg.sender === userId) {
        return "Sent";
      } else {
        return "Inbox";
      }
    }
  };

  const restoreMessage = async () => {
    try {
      const response = await api.put(
        `/notifications/restore?notification_id=${id}&user_id=${userId}`
      );
      if (response.status === 200) {
        handleRestoreMessage(
          id as string,
          token.user_id,
          findOrigin(message as Notification)
        );
        toast({
          title: `${response.data.message}`,
        });
        navigate(-1);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      }
    }
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
    <div className="w-full flex justify-center pb-4">
      {isLoading ? (
        <div className="flex h-[50vh] items-center">
          <Spinner size="80" color="#000000" />
        </div>
      ) : (
        <Card className="flex flex-col gap-4 w-full p-4">
          <div className="flex items-center">
            <CustomTooltip tooltipTitle="Back">
              <span className="p-1 rounded-md h-7">
                <Link to="/notifications/recycle-bin">
                  <ArrowLeft size={20} />
                </Link>
              </span>
            </CustomTooltip>

            <CustomTooltip tooltipTitle="Restore">
              <span className="p-1 rounded-md h-7" onClick={restoreMessage}>
                <RotateCcw size={18} className="cursor-pointer" />
              </span>
            </CustomTooltip>

            <p className="font-bold ml-4">{message?.subject}</p>
          </div>
          <div className="flex flex-col gap-4 w-full ">
            <div
              className="flex gap-4 items-start"
              key={message?.notification_id}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={`${url}/${renderProfilePicture(
                    message?.sender as number,
                    users
                  )}`}
                />
                <AvatarFallback>
                  {renderSlicedUsername(message?.sender as number, users, 1)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col w-full">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <p className="font-semibold">
                      {renderUserName(message?.sender as number, users)}
                    </p>
                    <div className="text-sm gap-1 flex items-center">
                      <span className="text-dark-400">to</span>
                      <span>
                        {message?.recipients[0]
                          ? `${renderUserName(message.recipients[0], users)}`
                          : "(no user)"}
                      </span>
                      {message && message.recipients.length > 1 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger className="focus:outline-none">
                            {" "}
                            <Ellipsis strokeWidth={1} size={16} />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="p-2">
                            {message.recipients
                              .slice(1, message.recipients.length + 1)
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
                      {convertDate(message?.creation_date as Date)}
                    </p>
                    <div className="flex items-center">
                      <Alert
                        disabled={false}
                        actionName="delete permanently"
                        onContinue={handleDelete}
                        tooltipTitle="Delete Permanently"
                        tooltipAdjustmentStyle="mr-6"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-dark-400 mb-2">
                  {renderMessage(message?.notification_body)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SingleRecycleBin;
