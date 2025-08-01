import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { Message } from "@/types/interfaces/users.interface";
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
import { Check, RotateCcw, Trash2, View, X } from "lucide-react";
import TableRowCounter from "@/components/TableCounter/TableRowCounter";
import Spinner from "@/components/Spinner/Spinner";
import Pagination5 from "@/components/Pagination/Pagination5";
import { toast } from "@/components/ui/use-toast";
import { useSocketContext } from "@/Context/SocketContext/SocketContext";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import Alert from "@/components/Alert/Alert";
interface RecycleBinTableProps {
  path: string;
  person: string;
}
const RecycleBinTable = ({ path, person }: RecycleBinTableProps) => {
  const api = useAxiosPrivate();
  const { user, token } = useGlobalContext();
  const {
    handleDeleteMessage,
    recycleBinMsg,
    setRecycleBinMsg,
    totalRecycleBinMsg,
    handleRestoreMessage,
  } = useSocketContext();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchRecycleBinMsg = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<Message[]>(
          `/messages/recyclebin/${user}/${currentPage}`
        );
        setRecycleBinMsg(response.data);
      } catch (error) {
        if (error instanceof Error) {
          toast({ title: error.message, variant: "destructive" });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecycleBinMsg();
  }, [api, currentPage, setIsLoading, setRecycleBinMsg, user]);

  const newReceivers = recycleBinMsg.map((msg) => msg.recivers);

  console.log(newReceivers, "73");

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
  const handleDelete = async (msg: Message) => {
    try {
      const holdersNumber = msg.holders?.length ?? 0;
      const recycleBinNumber = msg.recyclebin?.length ?? 0;
      if (holdersNumber > 0) {
        const response = await api.put(
          `/messages/remove-user-from-recyclebin/${msg.id}/${user}`
        );
        if (response.status === 200) {
          handleDeleteMessage(msg.id);
          toast({
            title: "Message has been deleted.",
          });
        }
      } else {
        if (recycleBinNumber > 1) {
          const response = await api.put(
            `/messages/remove-user-from-recyclebin/${msg.id}/${user}`
          );
          if (response.status === 200) {
            handleDeleteMessage(msg.id);
            toast({
              title: "Message has been deleted.",
            });
          }
        } else if (recycleBinNumber === 1) {
          const response = await api.delete(`/messages/${msg.id}`);
          if (response.status === 200) {
            handleDeleteMessage(msg.id);
            toast({
              title: "Message has been deleted.",
            });
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      }
    }
  };
  const emptyRecycleBin = async () => {
    try {
      for (const msg of recycleBinMsg) {
        const holdersNumber = msg.holders?.length ?? 0;
        const recycleBinNumber = msg.recyclebin?.length ?? 0;
        if (holdersNumber > 0) {
          const response = await api.put(
            `/messages/remove-user-from-recyclebin/${msg.id}/${user}`
          );
          if (response.status === 200) {
            handleDeleteMessage(msg.id);
            toast({
              title: "Message has been deleted.",
            });
          }
        } else {
          if (recycleBinNumber > 1) {
            const response = await api.put(
              `/messages/remove-user-from-recyclebin/${msg.id}/${user}`
            );
            if (response.status === 200) {
              handleDeleteMessage(msg.id);
              toast({
                title: "Message has been deleted.",
              });
            }
          } else if (recycleBinNumber === 1) {
            const response = await api.delete(`/messages/${msg.id}`);
            if (response.status === 200) {
              handleDeleteMessage(msg.id);
              toast({
                title: "Message has been deleted.",
              });
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" });
      }
    }
  };
  const handleNavigate = (id: string) => {
    navigate(`/notifications/recycle-bin/${id}`);
  };

  const restoreMessage = async (id: string) => {
    try {
      const response = await api.put(`/messages/restore-message/${id}/${user}`);
      if (response.status === 200) {
        handleRestoreMessage(id, user);
        toast({
          title: "Message has been restored.",
        });
      }
    } catch (error) {
      toast({
        title: "There is an error restoring message.",
      });
    }
  };

  const findOrigin = (msg: Message) => {
    if (msg.status === "Draft") {
      return "Drafts";
    } else {
      if (msg.sender.name === user) {
        return "Sent";
      } else {
        return "Inbox";
      }
    }
  };

  return (
    <>
      <div className="ml-[11rem] border rounded-md shadow-sm p-4">
        <div className="flex justify-between">
          <h1 className="text-lg font-bold mb-6 ">{path} </h1>
          <div>
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
          </div>
          <TableRowCounter
            startNumber={totalRecycleBinMsg > 0 ? startNumber : 0}
            endNumber={endNumber}
            totalNumber={totalRecycleBinMsg}
          />
        </div>
        <div className="max-h-[60vh] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-200 hover:bg-slate-200">
                <TableHead className="w-[3rem] font-bold">Origin</TableHead>
                <TableHead className="w-[7rem] font-bold">{person}</TableHead>
                <TableHead className="font-bold">Subject</TableHead>
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
                  <TableRow key={msg.id}>
                    <>
                      <TableCell className="py-2 font-bold">
                        {findOrigin(msg)}
                      </TableCell>
                      <TableCell className="py-2">
                        {msg.recivers.length === 0
                          ? "(no user)"
                          : msg.recivers.includes({
                              name: user,
                              profile_picture: token.profile_picture?.thumbnail,
                            })
                          ? msg.sender.name
                          : msg.recivers[0].name}
                        {msg.recivers.length > 1 && ", ..."}
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="mr-1">
                          {msg.subject === "" ? "(no subject)" : msg.subject}
                        </span>
                      </TableCell>
                      <TableCell className="w-[115px] py-2">
                        {convertDate(msg.date)}
                      </TableCell>
                      <TableCell className="flex gap-2 py-auto">
                        {/* View Tooltip */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <View
                                  onClick={() => handleNavigate(msg.id)}
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
                              <span onClick={() => restoreMessage(msg.id)}>
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
