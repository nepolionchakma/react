import { Card } from "@/components/ui/card";
import { CircleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { loadData, putData } from "@/Utility/funtion";
import { convertDate } from "@/Utility/DateConverter";
import { url, nodeApi, NODE_URL } from "@/Api/Api";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { useSocketContext } from "@/Context/SocketContext/SocketContext";
import Spinner from "@/components/Spinner/Spinner";
import type { Alerts } from "@/types/interfaces/alerts.interface";
import Pagination5 from "@/components/Pagination/Pagination5";

const Alerts = () => {
  const { token } = useGlobalContext();
  const { alerts, setAlerts, handleSendAlert } = useSocketContext();
  const [isloading, setIsLoading] = useState(true);
  const [alertIds, setAlertIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const limit = 8;

  useEffect(() => {
    const fetchAlerts = async () => {
      const alertDataParams = {
        baseURL: url,
        url: `${nodeApi.Alerts}/view?user_id=${token.user_id}&page=${currentPage}&limit=${limit}`,
        setLoading: setIsLoading,
      };
      console.log(alertDataParams, "alertDataParams");
      const res = await loadData(alertDataParams);
      setAlerts(res.result);
      setTotalPage(res.totalPages);
    };
    fetchAlerts();
  }, [token.user_id, currentPage, setAlerts]);

  const sortedAlerts = alerts.sort(
    (a, b) =>
      new Date(b.creation_date).getTime() - new Date(a.creation_date).getTime()
  );

  const handleAcknowledge = async (user_id: number, alert_id: number) => {
    const putParams = {
      baseURL: NODE_URL,
      url: `/alerts/acknowledge/${alert_id}/${user_id}`,
      setLoading: setIsLoading,
      payload: {
        acknowledge: true,
      },
      // isConsole?: boolean;
      isToast: true,
      accessToken: token.access_token,
    };

    const res = await putData(putParams);
    if (res.status === 200) {
      handleSendAlert(alert_id, [user_id], true);
    }
  };

  const handleViewDetails = (alertId: number) => {
    if (alertIds.includes(alertId)) {
      const filterIds = alertIds.filter((id) => id !== alertId);
      setAlertIds(filterIds);
    } else {
      setAlertIds((prev) => [...prev, alertId]);
    }
  };

  return (
    <div>
      {isloading ? (
        <div className="h-[65vh] flex items-center justify-center">
          <Spinner size="80" color="#000000" />
        </div>
      ) : (
        <>
          {alerts.length > 0 ? (
            <div className="flex flex-col gap-4 max-h-[74vh] overflow-auto scrollbar-thin">
              {sortedAlerts?.map((item: Alerts) => (
                <Card
                  key={item.alert_id}
                  className={`flex gap-4 p-4 ${
                    item.acknowledge === false ? "bg-gray-200" : ""
                  }`}
                >
                  <div className="bg-red-600 w-[40px] h-[36px] flex justify-center items-center rounded-full">
                    <CircleAlert color="white" />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex justify-between w-full">
                      <p className="font-semibold text-lg">{`ID: ${item.alert_id}`}</p>
                      <p className="text-gray-700">
                        {convertDate(new Date(item.last_update_date))}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-md">
                        {" "}
                        {item.alert_name}
                      </p>
                      <p className="text-gray-600">
                        {alertIds.includes(item.alert_id) ? (
                          <>
                            {item.description}
                            <span
                              className="text-blue-600 cursor-pointer ml-1"
                              onClick={() => handleViewDetails(item.alert_id)}
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
                                    handleViewDetails(item.alert_id)
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
                        {/* {item.description.length > 100
                          ? item.description.slice(0, 100) + "..."
                          : item.description} */}
                      </p>
                      {/* <button
                        onClick={() => handleViewDetails(item.alert_id)}
                        className="text-blue-600 font-semibold"
                      >
                        {alertIds.includes(item.alert_id)
                          ? "See Less"
                          : "View Details"}
                      </button> */}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleAcknowledge(item.user_id, item.alert_id)
                        }
                        disabled={item.acknowledge === true}
                        className={`w-32 h-10 rounded-sm flex justify-center items-center bg-gray-300
                          ${
                            item.acknowledge === true
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }`}
                      >
                        <p>Acknowledge</p>
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <span>No Data Found.</span>
            </div>
          )}
        </>
      )}
      {!isloading && sortedAlerts.length > 0 ? (
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
export default Alerts;
