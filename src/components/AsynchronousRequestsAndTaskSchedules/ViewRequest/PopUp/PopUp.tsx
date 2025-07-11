import CustomModal4 from "@/components/CustomModal/CustomModal4";
// import { IParametersTypes } from "@/types/interfaces/ARM.interface";
import { convertDate } from "@/Utility/DateConverter";
import { X } from "lucide-react";
interface IProps {
  action: string;
  data: any | undefined;
  setData: React.Dispatch<React.SetStateAction<any | undefined>>;
}
const PopUp = ({ action, data, setData }: IProps) => {
  return (
    <CustomModal4 className="w-[400px] h-auto">
      <div className=" ">
        <div className="flex justify-between bg-[#CEDEF2] p-2">
          <h3 className="font-semibold">{action}</h3>
          <X onClick={() => setData(undefined)} className="cursor-pointer" />
        </div>
        <div className="p-2 flex flex-col ">
          {/* {JSON.stringify(data)} */}
          {Object.entries(data!).map(([key, value]) => {
            // console.log(key, value, "key value");
            // console.log(typeof key, typeof value, "key value type");
            return (
              <div key={key}>
                {action === "Parameters" ? (
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
                ) : (
                  <span className="capitalize">
                    {key}: {value ? value.toString() : "null"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </CustomModal4>
  );
};

export default PopUp;
