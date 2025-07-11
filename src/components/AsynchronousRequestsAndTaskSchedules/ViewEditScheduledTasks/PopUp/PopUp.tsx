import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { IParametersTypes } from "@/types/interfaces/ARM.interface";
import { convertDate } from "@/Utility/DateConverter";
import { X } from "lucide-react";
interface IResultsProps {
  action: string;
  data: IParametersTypes | undefined;
  setData: React.Dispatch<React.SetStateAction<IParametersTypes | undefined>>;
}
const PopUp = ({ action, data, setData }: IResultsProps) => {
  return (
    <CustomModal4 className="w-[400px] h-auto">
      <div className=" ">
        <div className="flex justify-between bg-[#CEDEF2] p-2">
          <h3 className="font-semibold">{action}</h3>
          <X onClick={() => setData(undefined)} className="cursor-pointer" />
        </div>
        <div className="p-2 flex flex-col ">
          {Object.entries(data!).map(([key, value]) => {
            // console.log(key, value, "key value");
            // console.log(key === "Date-Time", value, "key is date time");
            // console.log(typeof key, typeof value, "key value type");
            return (
              <div key={key}>
                <span className="capitalize">
                  {key.toLowerCase().replace("_", " ")}:{" "}
                  {key === "Flag" && typeof value === "boolean"
                    ? value === true
                      ? "Yes"
                      : "No"
                    : key === "Date-Time"
                    ? convertDate(new Date(value as string))
                    : key === "get_id"
                    ? Number(value)
                    : key === "EMPLOYEE_ID"
                    ? Number(value)
                    : value
                    ? value.toString()
                    : "null"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </CustomModal4>
  );
};

export default PopUp;
