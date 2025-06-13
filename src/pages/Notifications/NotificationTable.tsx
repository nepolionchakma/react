import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { View } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import TableRowCounter from "@/components/TableCounter/TableRowCounter";
import Spinner from "@/components/Spinner/Spinner";
import Pagination5 from "@/components/Pagination/Pagination5";
import { useEffect, useState } from "react";
import { Message } from "@/types/interfaces/users.interface";
import { useSocketContext } from "@/Context/SocketContext/SocketContext";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import Alert from "@/components/Alert/Alert";

interface NotificationTableProps {
  path: string;
  person: string;
}

const NotificationTable = ({ path, person }: NotificationTableProps) => {
  const api = useAxiosPrivate();
  const { user } = useGlobalContext();
  const {
    socketMessage,
    receivedMessages,
    setReceivedMessages,
    handleRead,
    handleDeleteMessage,
    totalReceivedMessages,
  } = useSocketContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  //Fetch Received Messages
  useEffect(() => {
    const fetchReceivedMessages = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<Message[]>(
          `/messages/received/${user}/${currentPage}`
        );
        const result = response.data;
        setReceivedMessages(result);
      } catch (error) {
        if (error instanceof Error) {
          toast({ title: error.message, variant: "destructive" });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceivedMessages();
  }, [currentPage, setIsLoading, setReceivedMessages, user, toast, api]);

  const totalDisplayedMessages = 50;
  const totalPageNumbers = Math.ceil(
    totalReceivedMessages / totalDisplayedMessages
  );

  let startNumber = 1;
  let endNumber = currentPage * totalDisplayedMessages;

  if (endNumber > totalReceivedMessages) {
    endNumber = totalReceivedMessages;
  }

  if (currentPage > 1) {
    const page = currentPage - 1;
    startNumber = page * totalDisplayedMessages + 1;
  }

  const uniquMessagesIds = socketMessage.map((msg) => msg.id);

  const handleUniqueMessages = async (parentid: string) => {
    try {
      const res = await api.put(`/messages/update-readers/${parentid}/${user}`);
      if (res) {
        navigate(`/notifications/inbox/${parentid}`);
        handleRead(parentid);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await api.put(
        `/messages/set-user-into-recyclebin/${id}/${user}`
      );
      if (response.status === 200) {
        handleDeleteMessage(id);
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

  const convertDate = (isoDateString: Date) => {
    const date = new Date(isoDateString);
    const formattedDate = date.toLocaleString();
    return formattedDate;
  };

  return (
    <>
      <div className="ml-[11rem] border rounded-md shadow-sm p-4 mb-4 max-h-[80vh] overflow-auto">
        <div className="flex justify-between">
          <h1 className="text-lg font-bold mb-6 ">{path}</h1>
          <TableRowCounter
            startNumber={totalReceivedMessages > 0 ? startNumber : 0}
            endNumber={endNumber}
            totalNumber={totalReceivedMessages}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-200 hover:bg-slate-200">
              <TableHead className="w-[7rem] font-bold">{person}</TableHead>
              <TableHead className="font-bold">Subject</TableHead>
              <TableHead className="w-[7rem] font-bold">Date</TableHead>
              <TableHead className="w-[5rem] font-bold">Action</TableHead>
            </TableRow>
          </TableHeader>
          {isLoading ? (
            <TableBody className="w-full">
              <TableRow>
                <TableCell></TableCell>
                <TableCell className="flex items-center justify-center h-[12rem] py-32">
                  <Spinner size="80" color="#000000" />
                </TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          ) : receivedMessages.length > 0 ? (
            <TableBody>
              {receivedMessages.map((msg) => (
                <TableRow
                  key={msg.id}
                  className={
                    uniquMessagesIds.includes(msg.id)
                      ? "bg-winter-100/30"
                      : "mt-0"
                  }
                >
                  <>
                    <TableCell className="py-2">
                      {msg.sender.name.slice(0, 8)}
                      {msg.sender.name.length > 8 && "..."}
                    </TableCell>
                    <TableCell className="py-2">
                      <span className="font-medium mr-1">{msg.subject}</span>
                    </TableCell>
                    <TableCell className="py-2">
                      {convertDate(msg.date)}
                    </TableCell>
                    <TableCell className="flex gap-2 py-auto">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <View
                                onClick={() =>
                                  handleUniqueMessages(msg.parentid)
                                }
                                className="cursor-pointer"
                              />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Alert
                        disabled={false}
                        actionName="move to Recycle Bin"
                        onContinue={() => handleDelete(msg.id)}
                        tooltipTitle="Move to Recycle Bin"
                        tooltipAdjustmentStyle="mr-14"
                      />
                    </TableCell>
                  </>
                </TableRow>
              ))}
            </TableBody>
          ) : (
            <TableBody>
              <TableRow>
                <TableCell> </TableCell>
                <TableCell className="py-32 flex justify-center">
                  No messages found in Inbox Folder.
                </TableCell>
                <TableCell> </TableCell>
                <TableCell> </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
        <div className="flex w-full justify-end mt-4">
          <Pagination5
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPageNumbers={totalPageNumbers === 0 ? 1 : totalPageNumbers}
          />
        </div>
      </div>
    </>
  );
};

export default NotificationTable;
