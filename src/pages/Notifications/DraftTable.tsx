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
import { Edit } from "lucide-react";
// import { useNavigate } from "react-router-dom";
import TableRowCounter from "@/components/TableCounter/TableRowCounter";
import Spinner from "@/components/Spinner/Spinner";
import Pagination5 from "@/components/Pagination/Pagination5";
import { useEffect, useState } from "react";
import { Notification } from "@/types/interfaces/users.interface";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { useSocketContext } from "@/Context/SocketContext/SocketContext";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import Alert from "@/components/Alert/Alert";
import { renderUserName } from "@/Utility/NotificationUtils";
import SingleDraft from "./SingleDraft";
import { toTitleCase } from "@/Utility/general";

interface DraftTableProps {
  path: string;
  person: string;
}

const DraftTable = ({ path, person }: DraftTableProps) => {
  const api = useAxiosPrivate();
  const {
    draftMessages,
    totalDraftMessages,
    handleDeleteMessage,
    setDraftMessages,
  } = useSocketContext();
  const { userId, users } = useGlobalContext();
  // const navigate = useNavigate();
  const { toast } = useToast();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSingleDraft, setShowSingleDraft] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<Notification>({
    notification_id: "",
    notification_type: "",
    sender: userId,
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

  //Fetch Draft Messages
  useEffect(() => {
    const fetchSentMessages = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<Notification[]>(
          `/notifications/draft/${userId}/${currentPage}/50`
        );
        const result = response.data;
        setDraftMessages(result);
      } catch (error) {
        if (error instanceof Error) {
          toast({ title: error.message, variant: "destructive" });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSentMessages();
  }, [currentPage, setDraftMessages, setIsLoading, userId, toast, api]);

  const totalDisplayedMessages = 50;
  const totalPageNumbers = Math.ceil(
    totalDraftMessages / totalDisplayedMessages
  );

  let startNumber = 1;
  let endNumber = currentPage * totalDisplayedMessages;

  if (endNumber > totalDraftMessages) {
    endNumber = totalDraftMessages;
  }

  if (currentPage > 1) {
    const page = currentPage - 1;
    startNumber = page * totalDisplayedMessages + 1;
  }

  const handleDelete = async (notification_id: string) => {
    try {
      const response = await api.put(
        `/notifications/move-to-recyclebin/${notification_id}/${userId}`
      );
      if (response.status === 200) {
        handleDeleteMessage(notification_id);
        toast({
          title: `${response.data.message}`,
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

  // const handleNavigate = (id: string) => {
  //   navigate(`/notifications/draft/${id}`);
  // };

  const handleEditButton = (notificationId: string) => {
    const notification = draftMessages.find(
      (item) => item.notification_id === notificationId
    );
    if (notification) {
      setSelectedDraft(notification);
      setShowSingleDraft(true);
    }
  };

  return (
    <>
      <div className="ml-[11rem] border rounded-md shadow-sm p-4">
        <div className="flex justify-between">
          <h1 className="text-lg font-bold mb-6 ">{path}</h1>
          <TableRowCounter
            startNumber={totalDraftMessages > 0 ? startNumber : 0}
            endNumber={endNumber}
            totalNumber={totalDraftMessages}
          />
        </div>
        <div className="max-h-[60vh] overflow-auto scrollbar-thin">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-200 hover:bg-slate-200">
                <TableHead className="font-bold w-8">Type</TableHead>
                <TableHead className="font-bold">{person}</TableHead>
                <TableHead className="font-bold min-w-[40%]">Subject</TableHead>
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
            ) : draftMessages.length > 0 ? (
              <TableBody>
                {draftMessages.map((msg) => (
                  <TableRow key={msg.notification_id}>
                    <>
                      <TableCell className="py-2">
                        {toTitleCase(msg.notification_type)}
                      </TableCell>
                      <TableCell className="py-2">
                        {msg.recipients.length === 0
                          ? "(no user)"
                          : renderUserName(msg.recipients[0], users)}
                        {msg.recipients.length > 1 && ", ..."}
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="mr-1">
                          {msg.subject === ""
                            ? "(no subject)"
                            : msg.status === "ReplayDraft"
                            ? `${"Re:" + " " + msg.subject}`
                            : msg.subject}
                        </span>
                      </TableCell>
                      <TableCell className="w-[115px] py-2">
                        {convertDate(msg.creation_date)}
                      </TableCell>
                      <TableCell className="flex gap-2 py-auto">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Edit
                                  onClick={() =>
                                    handleEditButton(msg.notification_id)
                                  }
                                  className="cursor-pointer"
                                />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Alert
                          disabled={false}
                          actionName="move to Recycle Bin"
                          onContinue={() => handleDelete(msg.notification_id)}
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
                    No messages found in Drafts Fonder.
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

      {showSingleDraft && (
        <SingleDraft
          setShowModal={setShowSingleDraft}
          draftNotification={selectedDraft}
        />
      )}
    </>
  );
};

export default DraftTable;
