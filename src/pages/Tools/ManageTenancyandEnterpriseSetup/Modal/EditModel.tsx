import CustomModal1 from "@/components/CustomModal/CustomModal1";
import { X } from "lucide-react";
import { FC } from "react";
// import DND from "../ManageAccessModelDND/DND";
interface IManageAccessEditModelProps {
  setOpenEditModal: React.Dispatch<React.SetStateAction<boolean>>;
  isOpenEditModal: boolean;
}
const EditModel: FC<IManageAccessEditModelProps> = ({ setOpenEditModal }) => {
  // const { selectedItem } = useAACContext();
  // console.log(selectedItem);
  return (
    <CustomModal1>
      <div className="h-full ">
        <div className="flex justify-between p-2 bg-slate-300 rounded-t-lg">
          <h2 className="text-lg font-bold">Add Access Model</h2>
          <X
            onClick={() => {
              setOpenEditModal(false);
            }}
            className="cursor-pointer"
          />
        </div>
        <div>Edit Modal</div>
      </div>
    </CustomModal1>
  );
};
export default EditModel;
