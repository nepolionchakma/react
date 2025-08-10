import { Card } from "@/components/ui/card";
import { CircleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { loadData } from "@/Utility/funtion";
import { convertDate } from "@/Utility/DateConverter";
import { url, nodeApi, api } from "@/Api/Api";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { useSocketContext } from "@/Context/SocketContext/SocketContext";
import Spinner from "@/components/Spinner/Spinner";
import type { Alerts } from "@/types/interfaces/alerts.interface";

const Alerts = () => {
  const { token } = useGlobalContext();
  const { alerts, setAlerts } = useSocketContext();
  const [isloading, setIsLoading] = useState(true);
  const currentPage = 1;
  const limit = 8;

  useEffect(() => {
    const fetchAlerts = async () => {
      const alertDataParams = {
        baseURL: url,
        url: `${nodeApi.alerts}/view/${token.user_id}/${currentPage}/${limit}`,
        setLoading: setIsLoading,
      };

      const res = await loadData(alertDataParams);
      setAlerts(res.items);
    };
    fetchAlerts();
  }, [token.user_id, currentPage, setAlerts]);

  const handleClick = async (
    user_id: number,
    alert_id: number,
    data: Alerts
  ) => {
    try {
      await api.put(`/alerts/${user_id}/${alert_id}`, data);
    } catch (error) {
      console.log("errror", error);
    }
  };

  return (
    <div>
      {isloading ? (
        <div className="h-96 flex items-center justify-center">
          <Spinner size="80" color="#000000" />
        </div>
      ) : (
        <>
          {alerts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {alerts.map((item: Alerts) => (
                <Card key={item.alert_id} className="flex gap-4 p-4">
                  <div className="bg-red-600 w-[40px] h-[36px] flex justify-center items-center rounded-full">
                    <CircleAlert color="white" />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex justify-between w-full">
                      <p className="font-semibold mb-1">{item.alert_name}</p>
                      <p className="text-gray-700">
                        {convertDate(new Date(item.last_update_date))}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">{item.description}</p>
                      <p className="text-blue-600 font-semibold">
                        View Details
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleClick(item.user_id, item.alert_id, item)
                        }
                        className="w-32 h-10 rounded-sm flex justify-center items-center bg-gray-300"
                      >
                        <p>Button 1</p>
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <span>No alerts found.</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default Alerts;
