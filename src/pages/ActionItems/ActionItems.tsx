import { Card } from "@/components/ui/card";
import { Circle, CircleCheck, CircleCheckBig, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { loadData, putData } from "@/Utility/funtion";
import { flaskApi, FLASK_URL } from "@/Api/Api";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import Spinner from "@/components/Spinner/Spinner";
import { convertDate } from "@/Utility/DateConverter";
import SearchInput from "@/components/SearchInput/SearchInput";
import ActionButtons from "@/components/ActionButtons/ActionButtons";
import CustomTooltip from "@/components/Tooltip/Tooltip";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toTitleCase } from "@/Utility/general";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";
import Pagination5 from "@/components/Pagination/Pagination5";

export interface IActionItems {
  action_item_id: number;
  action_item_name: string;
  created_by: number;
  creation_date: Date;
  description: string;
  last_update_date: Date;
  last_updated_by: number;
  notification_id: string;
  status: string;
  user_id: number;
  user_name: string;
}

type StatusType = "COMPLETED" | "IN PROGRESS" | "NEW";

const statusIcons: Record<StatusType, JSX.Element> = {
  COMPLETED: <CircleCheckBig color="black" />,
  "IN PROGRESS": <CircleCheck color="black" />,
  NEW: <Circle color="black" />,
};
const statusColors: Record<StatusType, string> = {
  COMPLETED: "bg-green-100",
  "IN PROGRESS": "bg-yellow-100",
  NEW: "bg-orange-100",
};

const ActionItems = () => {
  const { token } = useGlobalContext();
  const [actionItems, setActionItems] = useState<IActionItems[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState({ isEmpty: true, value: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [actionItemIds, setActionItemIds] = useState<number[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [activeDialog, setActiveDialog] = useState<{
    itemId: number;
    status: string;
  } | null>(null);
  const limit = 8;
  const actionItemsParams = {
    baseURL: FLASK_URL,
    url: `${flaskApi.DefActionItems}/${token.user_id}/${currentPage}/${limit}?status=${selectedOption}`,
    setLoading: setIsLoading,
  };
  const fetchActionItems = async () => {
    const res = await loadData(actionItemsParams);
    if (res.items) {
      console.log(res);
      setActionItems(res.items);
      setTotalPage(res.pages);
      return res;
    }
  };

  useEffect(() => {
    fetchActionItems();
  }, [token.user_id, selectedOption, loading]);

  /** reload data by clicking refresh button */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const result = await fetchActionItems();
    if (result.items) {
      setIsRefreshing(false);
    }
  };

  /** For handling fetch data by changing options */
  const handleSelectOption = (value: string) => {
    if (value === "all") {
      setSelectedOption("");
    } else {
      setSelectedOption(value);
    }
  };

  const handleViewDetails = (actionItemId: number) => {
    if (actionItemIds.includes(actionItemId)) {
      const filterIds = actionItemIds.filter((id) => id !== actionItemId);
      setActionItemIds(filterIds);
    } else {
      setActionItemIds((prev) => [...prev, actionItemId]);
    }
  };

  const handleUpdateStatus = async (userId: number, actionItemId: number) => {
    const actionItemParams = {
      baseURL: FLASK_URL,
      url: `${flaskApi.DefActionItemAssignment}/${userId}/${actionItemId}`,
      setLoading: setLoading,
      payload: {
        status: activeDialog?.status.toUpperCase(),
      },
      isToast: true,
    };

    const res = await putData(actionItemParams);
    if (res.status === 200) {
      console.log(res.data);
      setActiveDialog(null);
      setOpenDropdownId(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <SearchInput
          placeholder="Search Action Items"
          query={query}
          setQuery={setQuery}
        />
        <div className="flex items-center gap-4">
          <ActionButtons>
            <CustomTooltip tooltipTitle="Refresh">
              <RefreshCw
                className={`cursor-pointer ${
                  isRefreshing ? "animate-spin" : ""
                }`}
                onClick={handleRefresh}
              />
            </CustomTooltip>
          </ActionButtons>
          <Select onValueChange={handleSelectOption}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      {isLoading ? (
        <div className="h-96 flex items-center justify-center">
          <Spinner size="80" color="#000000" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {actionItems?.length > 0 ? (
            <>
              {actionItems?.map((item: IActionItems) => (
                <Card key={item.action_item_id} className="flex gap-4 p-4">
                  <div
                    className={`${
                      statusColors[item.status as StatusType]
                    } w-[40px] h-[40px] flex justify-center items-center rounded-full`}
                  >
                    {statusIcons[item.status as StatusType]}
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex justify-between w-full">
                      <div>
                        <p className="font-semibold mb-1">
                          {item.action_item_name}
                        </p>
                      </div>
                      <p className="text-gray-700">
                        {convertDate(new Date(item.creation_date))}
                      </p>
                    </div>

                    <div>
                      <div
                        className={`${
                          statusColors[item.status as StatusType]
                        } px-[2px] rounded-sm inline-block`}
                      >
                        <p>{toTitleCase(item.status)}</p>
                      </div>

                      <p className="text-gray-600">
                        {actionItemIds.includes(item.action_item_id) ? (
                          <>
                            {item.description}
                            <span
                              className="text-blue-600 cursor-pointer ml-1"
                              onClick={() =>
                                handleViewDetails(item.action_item_id)
                              }
                            >
                              View Less
                            </span>
                          </>
                        ) : (
                          <>
                            {item.description.length > 250 ? (
                              <>
                                {item.description.slice(0, 250)}
                                <span
                                  className="text-blue-600 cursor-pointer ml-1"
                                  onClick={() =>
                                    handleViewDetails(item.action_item_id)
                                  }
                                >
                                  ... View Details
                                </span>
                              </>
                            ) : (
                              item.description
                            )}
                          </>
                        )}

                        {/* {item.description.length > 350
                          ? item.description.slice(0, 350) + "..."
                          : item.description} */}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="w-32 h-10 rounded-sm flex justify-center items-center bg-gray-300">
                        <p>ITEM 1</p>
                      </button>
                      <DropdownMenu
                        open={openDropdownId === item.action_item_id}
                        onOpenChange={(isOpen) =>
                          setOpenDropdownId(isOpen ? item.action_item_id : null)
                        }
                      >
                        <DropdownMenuTrigger asChild>
                          <button className="w-32 h-10 rounded-sm flex justify-center items-center bg-gray-300">
                            <p>Update Status</p>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="top">
                          {["In Progress", "Completed"].map((status, index) => (
                            <DropdownMenuCheckboxItem
                              checked={
                                item.status.toLowerCase() ===
                                status.toLowerCase()
                              }
                              key={index}
                              onSelect={(e) => {
                                e.preventDefault();
                                setActiveDialog({
                                  itemId: item.action_item_id,
                                  status,
                                });
                              }}
                            >
                              {status}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {activeDialog?.itemId === item.action_item_id && (
                        <AlertDialog
                          open={true}
                          onOpenChange={() => setActiveDialog(null)}
                        >
                          <AlertDialogContent className="bg-white shadow-lg">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you sure you want to change to{" "}
                                {activeDialog.status}?
                              </AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                onClick={() => {
                                  setActiveDialog(null);
                                  setOpenDropdownId(null);
                                }}
                              >
                                No
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleUpdateStatus(
                                    item.user_id,
                                    item.action_item_id
                                  )
                                }
                              >
                                Yes
                              </AlertDialogAction>
                              <AlertDialogDescription />
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </>
          ) : (
            <div className="flex items-center justify-center h-96">
              <span>No Data Found.</span>
            </div>
          )}
        </div>
      )}
      {actionItems.length > 0 ? (
        <div className="flex justify-end mt-3">
          <Pagination5
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPageNumbers={totalPage}
          />
        </div>
      ) : null}

      {/* <Card className="flex gap-4 p-4">
        <div className="bg-yellow-100 w-[40px] h-[40px] flex justify-center items-center rounded-full">
          <CircleCheck color="black" />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex justify-between w-full">
            <div>
              <p className="font-semibold mb-1">
                Lorem ipsum lorem ipsum lorem lorem lorem 2
              </p>
            </div>
            <p className="text-gray-700">7/1/2025, 5:50:24 PM</p>
          </div>
          <div>
            <div className="bg-yellow-100 px-[2px] rounded-sm inline-block">
              <p>In Progress</p>
            </div>
            <p className="text-gray-600">
              Lorem ipsum dolor sit amet consectetur. Eget lobortis tristique
              amet urna. Posuere semper nunc malesuada non massa blandit sit
              posuere. Elit duis neque nec tincidunt est lacus vitae id non.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-32 h-10 rounded-sm flex justify-center items-center bg-gray-300">
              <p>ITEM 1</p>
            </button>
            <button className="w-32 h-10 rounded-sm flex justify-center items-center bg-gray-300">
              <p>ITEM 2</p>
            </button>
          </div>
        </div>
      </Card>

      <Card className="flex gap-4 p-4">
        <div className="bg-orange-100 w-[40px] h-[40px] flex justify-center items-center rounded-full">
          <Circle color="black" />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex justify-between w-full">
            <div>
              <p className="font-semibold mb-1">
                Lorem ipsum lorem ipsum lorem lorem lorem 3
              </p>
            </div>
            <p className="text-gray-700">7/1/2025, 5:50:24 PM</p>
          </div>
          <div>
            <div className="bg-orange-100 px-[2px] rounded-sm inline-block">
              <p>New</p>
            </div>
            <p className="text-gray-600">
              Lorem ipsum dolor sit amet consectetur. Eget lobortis tristique
              amet urna. Posuere semper nunc malesuada non massa blandit sit
              posuere. Elit duis neque nec tincidunt est lacus vitae id non.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-32 h-10 rounded-sm flex justify-center items-center bg-gray-300">
              <p>ITEM 1</p>
            </button>
            <button className="w-32 h-10 rounded-sm flex justify-center items-center bg-gray-300">
              <p>ITEM 2</p>
            </button>
          </div>
        </div>
      </Card> */}
    </div>
  );
};
export default ActionItems;
