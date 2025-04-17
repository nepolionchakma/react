import CustomModal3 from "@/components/CustomModal/CustomModal3";
import { X } from "lucide-react";
import { FC } from "react";
import { IManageAccessModelsTypes } from "@/types/interfaces/ManageAccessEntitlements.interface";
interface IManageAccessModelProps {
  setOpenAddModal: React.Dispatch<React.SetStateAction<boolean>>;
  items: IManageAccessModelsTypes[];
}
const AddModel: FC<IManageAccessModelProps> = ({ setOpenAddModal }) => {
  return (
    <CustomModal3>
      <div className="flex justify-between p-2 bg-slate-300 rounded-t-lg">
        <h2 className="text-lg font-bold">Add Access Model</h2>
        <X
          onClick={() => {
            setOpenAddModal(false);
          }}
          className="cursor-pointer"
        />
      </div>
      <div className="px-6 py-4 ">Add Modal</div>
    </CustomModal3>
  );
};
export default AddModel;
