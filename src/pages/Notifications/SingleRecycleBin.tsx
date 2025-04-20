import { ArrowLeft, Check, Ellipsis, RotateCcw, Trash2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import React, { useEffect, useState } from "react";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Message } from "@/types/interfaces/users.interface";
import Spinner from "@/components/Spinner/Spinner";
import { useSocketContext } from "@/Context/SocketContext/SocketContext";
import { api } from "@/Api/Api";

const SingleRecycleBin = () => {
  const { user } = useGlobalContext();
  const { handleDeleteMessage, handleRestoreMessage } = useSocketContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const url = import.meta.env.VITE_NODE_ENDPOINT_URL;
  const idString = useParams();
  const id = idString.id;
  const [message, setMessage] = useState<Message>({
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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  //Fetch Message
  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await axios.get<Message>(`${url}/messages/${id}`);
        const result = response.data;
        setMessage(result);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessage();
  }, [id, url]);

  const handleDelete = async () => {
    try {
      const response = await axios.put(
        `${url}/messages/remove-user-from-recyclebin/${id}/${user}`
      );
      if (response.status === 200) {
        handleDeleteMessage(id as string);
        navigate("/notifications/recycle-bin");
        toast({
          title: "Message has been deleted permenantly.",
        });
      }
    } catch (error) {
      toast({
        title: "There is an error deleting message",
      });
    }
  };

  const convertDate = (isoDateString: Date) => {
    const date = new Date(isoDateString);
    const formattedDate = date.toLocaleString();
    return formattedDate;
  };

  const restoreMessage = async () => {
    try {
      const response = await api.put(`/messages/restore-message/${id}/${user}`);
      if (response.status === 200) {
        handleRestoreMessage(id as string, user);
        toast({
          title: "Message has been restored.",
        });
        navigate(-1);
      }
    } catch (error) {
      toast({
        title: "There is an error restoring message.",
      });
    }
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
    <div className="w-full flex justify-center pb-4">
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
                  <span className="p-1 rounded-md hover:bg-winter-100/50 h-7">
                    <Link to="/notifications/recycle-bin">
                      <ArrowLeft size={20} />
                    </Link>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Back</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {/* Restore Tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className="p-1 rounded-md hover:bg-winter-100/50 h-7"
                    onClick={restoreMessage}
                  >
                    <RotateCcw size={18} className="cursor-pointer" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Restore</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <p className="font-bold ml-4">{message.subject}</p>
          </div>
          <div className="flex flex-col gap-4 w-full ">
            <div className="flex gap-4 items-start" key={message.id}>
              <Avatar className="w-8 h-8">
                <AvatarImage src={`${url}/${message.sender.profile_picture}`} />
                <AvatarFallback>
                  {message.sender.name.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col w-full">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <p className="font-semibold">{message.sender.name}</p>
                    <div className="text-sm gap-1 flex items-center">
                      <span className="text-dark-400">to</span>
                      <span>{message.recivers[0].name}</span>
                      {message.recivers.length > 1 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger className="focus:outline-none">
                            {" "}
                            <Ellipsis strokeWidth={1} size={16} />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="p-2">
                            {message.recivers
                              .slice(1, message.recivers.length + 1)
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
                      {convertDate(message.date)}
                    </p>
                    <div className="flex items-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <AlertDialog>
                                <AlertDialogTrigger>
                                  <Trash2 size={20} />
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you absolutely sure?
                                    </AlertDialogTitle>
                                  </AlertDialogHeader>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the message.
                                  </AlertDialogDescription>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-Red-200 text-white flex justify-center items-center">
                                      <X />
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-green-600 text-white flex justify-center items-center"
                                      onClick={handleDelete}
                                    >
                                      <Check />
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Permanently delete</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
                <p className="text-dark-400 mb-2">
                  {renderMessage(message.body)}
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
