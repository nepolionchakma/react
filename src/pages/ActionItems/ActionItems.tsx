import { Card } from "@/components/ui/card";
import { Circle, CircleCheck, CircleCheckBig, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { loadData } from "@/Utility/funtion";
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
import Pagination5 from "@/components/Pagination/Pagination5";
import Alert from "@/components/Alert/Alert";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { debounce } from "@/Utility/debounce";

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
  notification_status: string;
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
  const [query, setQuery] = useState({ isEmpty: true, value: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [actionItemIds, setActionItemIds] = useState<number[]>([]);
  const [openProgressBarId, setOpenProgressBarId] = useState<number | null>(
    null
  );
  const [activeDialog, setActiveDialog] = useState<{
    itemId: number;
    status: string;
  } | null>(null);
  const popupRefs = useRef<{
    [key: number]: {
      button: HTMLButtonElement | null;
      popup: HTMLDivElement | null;
    };
  }>({});
  const limit = 8;
  const actionItemsParams = {
    baseURL: FLASK_URL,
    url: `${flaskApi.DefActionItems}/${token.user_id}/${currentPage}/${limit}?status=${selectedOption}`,
    setLoading: setIsLoading,
  };
  const fetchActionItems = async () => {
    const res = await loadData(actionItemsParams);
    if (res.items) {
      setActionItems(res.items);
      setTotalPage(res.pages);
      return res;
    }
  };

  /** Search Functionality */
  const fetchSearchActionItems = async (q: string, page = currentPage) => {
    const searchQueryParams = {
      baseURL: FLASK_URL,
      url: `${flaskApi.DefActionItems}/${token.user_id}/${page}/${limit}?action_item_name=${q}`,
      setLoading: setIsLoading,
    };
    const res = await loadData(searchQueryParams);
    if (res) {
      setActionItems(res.items);
      setTotalPage(res.pages);
    }
  };

  // Debounced search function
  const debouncedSearch = useRef(
    debounce((q: string, page: number) => fetchSearchActionItems(q, page), 1000)
  ).current;

  useEffect(() => {
    if (query.isEmpty) {
      fetchActionItems();
    } else {
      debouncedSearch(query.value, currentPage);
    }
  }, [query, token.user_id, selectedOption, currentPage, query.isEmpty]);

  /** close progressbar */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (openProgressBarId !== null) {
        if (activeDialog) return;

        const refs = popupRefs.current[openProgressBarId];
        if (
          refs?.button &&
          !refs.button.contains(event.target as Node) &&
          refs?.popup &&
          !refs.popup.contains(event.target as Node)
        ) {
          setOpenProgressBarId(null);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openProgressBarId, activeDialog]);

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

  /** View Long text */
  const handleViewDetails = (actionItemId: number) => {
    if (actionItemIds.includes(actionItemId)) {
      const filterIds = actionItemIds.filter((id) => id !== actionItemId);
      setActionItemIds(filterIds);
    } else {
      setActionItemIds((prev) => [...prev, actionItemId]);
    }
  };

  const handleUpdateStatus = async (userId: number, actionItemId: number) => {
    try {
      const res = await axios.put(
        `${FLASK_URL}/${flaskApi.DefActionItemAssignment}/${userId}/${actionItemId}`,
        { status: activeDialog?.status.toUpperCase() },
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
        }
      );
      if (res.status === 200) {
        setActionItems((prev) =>
          prev.map((item) =>
            item.action_item_id === activeDialog?.itemId
              ? { ...item, status: activeDialog.status }
              : item
          )
        );
        toast({
          title: res.data.message,
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setActiveDialog(null);
    }
  };

  const handleOpenProgressBar = (id: number) => {
    if (id === openProgressBarId) {
      setOpenProgressBarId(null);
    } else {
      setOpenProgressBarId(id);
    }
  };
  const handleStatusChange = (id: number, status: string) => {
    setActiveDialog({ itemId: id, status: status });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <SearchInput
          placeholder="Search Action Items"
          query={query}
          setQuery={setQuery}
          setPage={setCurrentPage}
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
                      <div className="flex items-center gap-4">
                        <div
                          className={`${
                            statusColors[item.status as StatusType]
                          } px-[2px] rounded-sm inline-block`}
                        >
                          <p>{toTitleCase(item.status)}</p>
                        </div>
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
                      </p>
                    </div>
                    <div className="flex items-center gap-2 relative">
                      {openProgressBarId === item.action_item_id && (
                        <div
                          ref={(el) =>
                            (popupRefs.current[item.action_item_id] = {
                              ...popupRefs.current[item.action_item_id],
                              popup: el,
                            })
                          }
                          className="absolute -top-20 left-16 flex flex-col items-center px-6 py-3 bg-light-200 shadow-md rounded-md"
                        >
                          <div className="flex items-center ">
                            <div className="flex flex-col gap-1">
                              <button disabled={true}>
                                <CircleCheck color="#16a34a" />
                              </button>
                            </div>
                            <div
                              className={`w-20 h-[2px] ${
                                item.status === "IN PROGRESS" ||
                                item.status === "COMPLETED"
                                  ? "bg-[#16a34a]"
                                  : "bg-slate-300"
                              }`}
                            />
                            {item.status === "IN PROGRESS" ||
                            item.status === "COMPLETED" ? (
                              <div className="flex flex-col gap-1">
                                <button
                                  disabled={item.status === "IN PROGRESS"}
                                  onClick={() =>
                                    handleStatusChange(
                                      item.action_item_id,
                                      "IN PROGRESS"
                                    )
                                  }
                                >
                                  <CircleCheck color="#16a34a" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() =>
                                    handleStatusChange(
                                      item.action_item_id,
                                      "IN PROGRESS"
                                    )
                                  }
                                >
                                  <Circle color="#cbd5e1" />
                                </button>
                              </div>
                            )}
                            <div
                              className={`w-20 h-[2px] ${
                                item.status === "COMPLETED"
                                  ? "bg-[#16a34a]"
                                  : "bg-slate-300"
                              }`}
                            />
                            {item.status === "COMPLETED" ? (
                              <div className="flex flex-col gap-1">
                                <button
                                  disabled={item.status === "COMPLETED"}
                                  onClick={() =>
                                    handleStatusChange(
                                      item.action_item_id,
                                      "COMPLETED"
                                    )
                                  }
                                >
                                  <CircleCheck color="#16a34a" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-1">
                                <button
                                  disabled={
                                    item.status === "NEW" ||
                                    item.status === "COMPLETED"
                                  }
                                  onClick={() =>
                                    handleStatusChange(
                                      item.action_item_id,
                                      "COMPLETED"
                                    )
                                  }
                                >
                                  <Circle color="#cbd5e1" />
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="flex">
                            <p className="ml-6">New</p>
                            <p className="ml-10">In Progress</p>
                            <p className="ml-8">Completed</p>
                          </div>
                        </div>
                      )}
                      <button className="w-32 h-10 rounded-sm flex justify-center items-center bg-gray-300">
                        <p>ITEM 1</p>
                      </button>
                      <button
                        ref={(el) =>
                          (popupRefs.current[item.action_item_id] = {
                            ...popupRefs.current[item.action_item_id],
                            button: el,
                          })
                        }
                        onClick={() =>
                          handleOpenProgressBar(item.action_item_id)
                        }
                        className="w-32 h-10 rounded-sm flex justify-center items-center bg-gray-300"
                      >
                        <p>Update Status</p>
                      </button>
                      {activeDialog?.itemId === item.action_item_id && (
                        <Alert
                          actionName="update status"
                          onContinue={() => {
                            handleUpdateStatus(
                              item.user_id,
                              item.action_item_id
                            );
                            setOpenProgressBarId(null);
                          }}
                          disabled={false}
                          open={true}
                          onOpenChange={() => setActiveDialog(null)}
                          onCancel={() => {
                            setActiveDialog(null);
                            setOpenProgressBarId(null);
                          }}
                        />
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
    </div>
  );
};
export default ActionItems;
