import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { ApiParameter } from "@/types/interfaces/apiEndpoints.interface";
import { X } from "lucide-react";

interface IProps {
  action: string;
  data: ApiParameter[];
  setData: React.Dispatch<React.SetStateAction<ApiParameter[]>>;
}

const ParametersModal = ({ action, data, setData }: IProps) => {
  return (
    <CustomModal4 className="w-[700px] h-auto">
      <div>
        <div className="flex items-center justify-between bg-[#CEDEF2] p-3">
          <h3 className="font-semibold">{action}</h3>
          <X onClick={() => setData([])} className="cursor-pointer" />
        </div>

        <div className="p-4">
          {data.length === 0 ? (
            <p className="text-center text-gray-500">
              No parameters available.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-3 py-2 text-left">Name</th>
                    <th className="border px-3 py-2 text-left">Type</th>
                    <th className="border px-3 py-2 text-left">Location</th>
                    <th className="border px-3 py-2 text-center">Required</th>
                  </tr>
                </thead>

                <tbody>
                  {data.map((param, index) => (
                    <tr key={`${param.name}-${index}`}>
                      <td className="border px-3 py-2 font-medium">
                        {param.name}
                      </td>

                      <td className="border px-3 py-2">
                        <span className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-700">
                          {param.type}
                        </span>
                      </td>

                      <td className="border px-3 py-2">
                        <span className="rounded bg-gray-100 px-2 py-1 text-sm">
                          {param.location}
                        </span>
                      </td>

                      <td className="border px-3 py-2 text-center">
                        <span
                          className={`rounded px-2 py-1 text-sm ${
                            param.required
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {param.required ? "Yes" : "No"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </CustomModal4>
  );
};

export default ParametersModal;
