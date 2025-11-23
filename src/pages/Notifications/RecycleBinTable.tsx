import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { Notification } from "@/types/interfaces/users.interface";
import { useEffect, useState } from "react";
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

// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
import { RotateCcw, View } from "lucide-react";
import TableRowCounter from "@/components/TableCounter/TableRowCounter";
import Spinner from "@/components/Spinner/Spinner";
import Pagination5 from "@/components/Pagination/Pagination5";
import { toast } from "@/components/ui/use-toast";
import { useSocketContext } from "@/Context/SocketContext/SocketContext";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import Alert from "@/components/Alert/Alert";
import { renderSlicedUsername } from "@/Utility/NotificationUtils";
import { toTitleCase } from "@/Utility/general";
import { FLASK_URL, NODE_URL } from "@/Api/Api";
import { deleteData } from "@/Utility/funtion";

interface RecycleBinTableProps {
  path: string;
  person: string;
}
const RecycleBinTable = ({ path, person }: RecycleBinTableProps) => {
  const api = useAxiosPrivate();
  const { userId, token, users } = useGlobalContext();
  const {
    handleDeleteMessage,
    recycleBinMsg,
    setRecycleBinMsg,
    totalRecycleBinMsg,
    handleRestoreMessage,
    handleParmanentDeleteMessage,
  } = useSocketContext();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const limit = 50;
  const navigate = useNavigate();
  useEffect(() => {
    const fetchRecycleBinMsg = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(
          `/notifications/recyclebin?user_id=${userId}&page=${currentPage}&limit=${limit}`
        );
        setRecycleBinMsg(response.data.result);
      } catch (error) {
        if (error instanceof Error) {
          toast({ title: error.message, variant: "destructive" });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecycleBinMsg();
  }, [api, currentPage, setIsLoading, setRecycleBinMsg, userId]);

  const totalDisplayedMessages = 50;
  const totalPageNumbers = Math.ceil(
    totalRecycleBinMsg / totalDisplayedMessages
  );
  let startNumber = 1;
  let endNumber = currentPage * totalDisplayedMessages;

  if (endNumber > totalRecycleBinMsg) {
    endNumber = totalRecycleBinMsg;
  }

  if (currentPage > 1) {
    const page = currentPage - 1;
    startNumber = page * totalDisplayedMessages + 1;
  }
  const convertDate = (isoDateString: Date) => {
    const date = new Date(isoDateString);
    const formattedDate = date.toLocaleString();
    return formattedDate;
  };
  const handleDelete = async (msg: Notification) => {
    try {
      if (msg.alert_id) {
        const deleteAlertParams = {
          url: `alerts/${msg.alert_id}`,
          baseURL: NODE_URL,
          accessToken: token.access_token,
        };
        await deleteData(deleteAlertParams);
      } else if (msg.action_item_id) {
        const deleteActionItemParams = {
          url: `def_action_items/${msg.action_item_id}`,
          baseURL: FLASK_URL,
          accessToken: token.access_token,
        };
        await deleteData(deleteActionItemParams);
      } else if (msg.status === "DRAFT") {
        const deleteNotificationParams = {
          url: `notifications/${msg.notification_id}`,
          baseURL: NODE_URL,
          accessToken: token.access_token,
          isToast: true,
        };
        const deleteNotification = await deleteData(deleteNotificationParams);
        if (deleteNotification) {
          handleParmanentDeleteMessage(msg.notification_id);
        }
      } else {
        const response = await api.put(
          `/notifications/remove-from-recyclebin?notification_id=${msg.notification_id}&user_id=${userId}`
        );
        if (response.status === 200) {
          handleDeleteMessage(msg.notification_id, "Recycle");
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
  // const emptyRecycleBin = async () => {
  //   try {
  //     for (const msg of recycleBinMsg) {
  //       const holdersNumber = msg.holders?.length ?? 0;
  //       const recycleBinNumber = msg.recycle_bin?.length ?? 0;
  //       if (holdersNumber > 0) {
  //         const response = await api.put(
  //           `/messages/remove-user-from-recyclebin/${msg.notification_id}/${user}`
  //         );
  //         if (response.status === 200) {
  //           handleDeleteMessage(msg.notification_id);
  //           toast({
  //             title: "Message has been deleted.",
  //           });
  //         }
  //       } else {
  //         if (recycleBinNumber > 1) {
  //           const response = await api.put(
  //             `/messages/remove-user-from-recyclebin/${msg.notification_id}/${user}`
  //           );
  //           if (response.status === 200) {
  //             handleDeleteMessage(msg.notification_id);
  //             toast({
  //               title: "Message has been deleted.",
  //             });
  //           }
  //         } else if (recycleBinNumber === 1) {
  //           const response = await api.delete(
  //             `/messages/${msg.notification_id}`
  //           );
  //           if (response.status === 200) {
  //             handleDeleteMessage(msg.notification_id);
  //             toast({
  //               title: "Message has been deleted.",
  //             });
  //           }
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       toast({ title: error.message, variant: "destructive" });
  //     }
  //   }
  // };
  const handleNavigate = (id: string) => {
    navigate(`/notifications/recycle-bin/${id}`);
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

  const restoreMessage = async (notification: Notification) => {
    try {
      const response = await api.put(
        `/notifications/restore?notification_id=${notification.notification_id}&user_id=${userId}`
      );
      if (response.status === 200) {
        handleRestoreMessage(
          notification.notification_id,
          token.user_id,
          findOrigin(notification)
        );
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

  return (
    <>
      <div className="ml-[11rem] border rounded-md shadow-sm p-4">
        <div className="flex justify-between">
          <h1 className="text-lg font-bold mb-6 ">{path} </h1>
          {/* <div>
            <AlertDialog>
              <AlertDialogTrigger className="bg-white text-white cursor-default">
                <Trash2 /> <span>Empty Bin</span>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  from both side.
                </AlertDialogDescription>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-Red-200 text-white flex justify-center items-center">
                    <X />
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-green-600 text-white flex justify-center items-center"
                    onClick={emptyRecycleBin}
                  >
                    <Check />
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div> */}
          <TableRowCounter
            startNumber={totalRecycleBinMsg > 0 ? startNumber : 0}
            endNumber={endNumber}
            totalNumber={totalRecycleBinMsg}
          />
        </div>
        <div className="max-h-[60vh] overflow-auto scrollbar-thin">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-200 hover:bg-slate-200">
                <TableHead className="font-bold min-w-8">Type</TableHead>
                <TableHead className="font-bold min-w-6">Origin</TableHead>
                <TableHead className="font-bold min-w-8">{person}</TableHead>
                <TableHead className="font-bold min-w-[40%]">Subject</TableHead>
                <TableHead className="min-w-[5rem] font-bold">Date</TableHead>
                <TableHead className="w-[5rem] font-bold">Action</TableHead>
              </TableRow>
            </TableHeader>
            {isLoading ? (
              <TableBody className="w-full">
                <TableRow>
                  <TableCell> </TableCell>
                  <TableCell> </TableCell>
                  <TableCell className="flex items-center justify-center  h-[12rem] py-32">
                    <Spinner size="80" color="#000000" />
                  </TableCell>
                  <TableCell> </TableCell>
                  <TableCell> </TableCell>
                </TableRow>
              </TableBody>
            ) : recycleBinMsg.length !== 0 ? (
              <TableBody>
                {recycleBinMsg.map((msg) => (
                  <TableRow key={msg.notification_id}>
                    <>
                      <TableCell className="py-2">
                        {toTitleCase(msg.notification_type)}
                      </TableCell>
                      <TableCell className="py-2">{findOrigin(msg)}</TableCell>
                      <TableCell className="py-2">
                        {msg.recipients.length === 0
                          ? "(no user)"
                          : msg.recipients.includes(userId)
                          ? renderSlicedUsername(msg.sender, users, 8)
                          : renderSlicedUsername(msg.recipients[0], users, 8)}
                        {msg.recipients.length > 1 && ", ..."}
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="mr-1">
                          {msg.subject === "" ? "(no subject)" : msg.subject}
                        </span>
                      </TableCell>
                      <TableCell className="w-[115px] py-2">
                        {convertDate(msg.creation_date)}
                      </TableCell>
                      <TableCell className="flex gap-2 py-auto">
                        {/* View Tooltip */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <View
                                  onClick={() =>
                                    handleNavigate(msg.notification_id)
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

                        {/* Restore Tooltip */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span onClick={() => restoreMessage(msg)}>
                                <RotateCcw className="cursor-pointer" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Restore</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Delete Tooltip */}

                        <Alert
                          disabled={false}
                          actionName="delete permanently"
                          onContinue={() => handleDelete(msg)}
                          tooltipTitle="Delete Permanently"
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
                  <TableCell> </TableCell>
                  <TableCell className="py-32 flex justify-center">
                    No messages found in Recycle Bin Folder.
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
export default RecycleBinTable;
