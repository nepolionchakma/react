import { FLASK_URL, flaskApi } from "@/Api/Api";
import CustomModal4 from "@/components/CustomModal/CustomModal4";
import Spinner from "@/components/Spinner/Spinner";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import {
  IARMAsynchronousTask,
  ITaskGroup,
} from "@/types/interfaces/ARM.interface";
import { loadData } from "@/Utility/funtion";
import { toTitleCase } from "@/Utility/general";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  action: string;
  clickedRow: ITaskGroup | undefined;
  setClickedRow: React.Dispatch<React.SetStateAction<ITaskGroup | undefined>>;
}

const AsyncTasksModal = ({ action, clickedRow, setClickedRow }: Props) => {
  const { token } = useGlobalContext();
  const [data, setData] = useState<IARMAsynchronousTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      const params = {
        baseURL: FLASK_URL,
        url: `${flaskApi.ShowAsyncTasks}?group_id=${clickedRow?.group_id}`,
        accessToken: `${token.access_token}`,
        setLoading: setIsLoading,
      };

      const res = await loadData(params);
      console.log(res);
      if (res) {
        setData(res.result);
      }
    };

    fetchTasks();
  }, [clickedRow?.group_id, token.access_token]);
  const handleClose = () => {
    setData([]);
    setClickedRow(undefined);
  };
  return (
    <CustomModal4 className="w-[700px] h-auto">
      <div>
        <div className="flex items-center justify-between bg-[#CEDEF2] p-3">
          <h3 className="font-semibold">
            {toTitleCase(clickedRow?.group_name)} {action}
          </h3>
          <X onClick={handleClose} className="cursor-pointer" />
        </div>
        <div className="p-4 max-h-[80vh] overflow-auto scrollbar-thin">
          {isLoading ? (
            <div className="flex justify-center w-full">
              <Spinner size="40" color="black" />
            </div>
          ) : (
            <div>
              {data.length === 0 ? (
                <p className="text-center text-gray-500">No Task available.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-3 py-2 text-left">
                          User Task Name
                        </th>
                        <th className="border px-3 py-2 text-left">
                          Internal Eexecution Method
                        </th>

                        <th className="border px-3 py-2 text-center">Type</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((item, index) => (
                        <tr key={`${item.def_task_id}-${index}`}>
                          <td className="border px-3 py-2 font-medium">
                            {item.user_task_name}
                          </td>

                          <td className="border px-3 py-2">
                            <span className="rounded px-2 py-1 text-sm">
                              {item.internal_execution_method}
                            </span>
                          </td>

                          <td className="border px-3 py-2 text-center">
                            <span className={`rounded px-2 py-1 text-sm`}>
                              {item.sf_type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </CustomModal4>
  );
};

export default AsyncTasksModal;
