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

import { useToast } from "@/components/ui/use-toast";
import { View } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TableRowCounter from "@/components/TableCounter/TableRowCounter";
import Spinner from "@/components/Spinner/Spinner";
import Pagination5 from "@/components/Pagination/Pagination5";
import { useEffect, useState } from "react";
import { Message } from "@/types/interfaces/users.interface";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { useSocketContext } from "@/Context/SocketContext/SocketContext";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import Alert from "@/components/Alert/Alert";

interface SentTableProps {
  path: string;
  person: string;
}

const SentTable = ({ path, person }: SentTableProps) => {
  const api = useAxiosPrivate();
  const {
    sentMessages,
    totalSentMessages,
    handleDeleteMessage,
    setSentMessages,
  } = useSocketContext();
  const { user } = useGlobalContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  //Fetch Sent Messages
  useEffect(() => {
    const fetchSentMessages = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<Message[]>(
          `/messages/sent/${user}/${currentPage}`
        );
        const result = response.data;
        setSentMessages(result);
      } catch (error) {
        if (error instanceof Error) {
          toast({ title: error.message, variant: "destructive" });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSentMessages();
  }, [currentPage, user, setIsLoading, setSentMessages, toast, api]);

  const totalDisplayedMessages = 50;
  const totalPageNumbers = Math.ceil(
    totalSentMessages / totalDisplayedMessages
  );

  let startNumber = 1;
  let endNumber = currentPage * totalDisplayedMessages;

  if (endNumber > totalSentMessages) {
    endNumber = totalSentMessages;
  }

  if (currentPage > 1) {
    const page = currentPage - 1;
    startNumber = page * totalDisplayedMessages + 1;
  }

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

  const handleNavigate = (id: string) => {
    navigate(`/notifications/sent/${id}`);
  };

  return (
    <>
      <div className="ml-[11rem] border rounded-md shadow-sm p-4">
        <div className="flex justify-between">
          <h1 className="text-lg font-bold mb-6 ">{path}</h1>
          <TableRowCounter
            startNumber={totalSentMessages > 0 ? startNumber : 0}
            endNumber={endNumber}
            totalNumber={totalSentMessages}
          />
        </div>
        <div className="max-h-[60vh] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-200 hover:bg-slate-200">
                <TableHead className="w-[7rem] font-bold ">{person}</TableHead>
                <TableHead className="font-bold">Subject</TableHead>
                <TableHead className="min-w-[5rem] font-bold">Date</TableHead>
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
            ) : sentMessages.length > 0 ? (
              <TableBody>
                {sentMessages.map((msg, i) => (
                  <TableRow key={i}>
                    <TableCell className="py-2">
                      {msg.recivers[0].name}
                      {(msg.recivers || []).length > 1 && ", ..."}
                    </TableCell>

                    <TableCell className="py-2">
                      <span className="mr-1">{msg.subject}</span>
                    </TableCell>
                    <TableCell className="w-[115px] py-2">
                      {convertDate(msg.date)}
                    </TableCell>
                    <TableCell className="flex gap-2 py-auto">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <View
                                onClick={() => handleNavigate(msg.parentid)}
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
                  </TableRow>
                ))}
              </TableBody>
            ) : (
              <TableBody>
                <TableRow>
                  <TableCell> </TableCell>
                  <TableCell className="py-32 flex justify-center">
                    No messages found in Sent Folder.
                  </TableCell>
                  <TableCell> </TableCell>
                  <TableCell> </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </div>

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

export default SentTable;
