import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { X } from "lucide-react";
interface IResultsProps {
  action: string;
  data: string;
  setData: React.Dispatch<React.SetStateAction<string>>;
}
const PopUp = ({ action, data, setData }: IResultsProps) => {
  return (
    <CustomModal4 className="w-[400px] h-auto">
      <div className=" ">
        <div className="flex justify-between bg-[#CEDEF2] p-2">
          <h3 className="font-semibold">{action}</h3>
          <X onClick={() => setData("")} className="cursor-pointer" />
        </div>
        <div className="p-2 flex flex-col ">
          {/* {JSON.stringify(data)} */}
          {Object.entries(data).map(([key, value]) => (
            <div key={key}>
              {action === "Parameters" ? (
                <span className="capitalize">
                  {key.toLowerCase().replace("_", " ")}: {value}
                </span>
              ) : (
                <span>{value}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </CustomModal4>
  );
};

export default PopUp;
