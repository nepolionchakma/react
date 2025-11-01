import CustomModal1 from "@/components/CustomModal/CustomModal1";
import AccessPointsEditModal from "./AccessPointsEditModalTable";
import { useManageAccessEntitlementsContext } from "@/Context/ManageAccessEntitlements/ManageAccessEntitlementsContext";
import { X } from "lucide-react";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";

const AccessEntitlementElemantModal = () => {
  const { isOpenModal, setIsOpenModal } = useGlobalContext();
  const { selectedManageAccessEntitlements } =
    useManageAccessEntitlementsContext();
  const handleCancel = () => {
    setIsOpenModal("");
  };
  return (
    <div>
      {isOpenModal === "access_points" && (
        <CustomModal1>
          <div className="flex justify-between p-2 bg-slate-300 rounded-t-lg">
            <h2 className="text-lg font-bold capitalize">
              Entitlement Name :{" "}
              {selectedManageAccessEntitlements?.entitlement_name}
            </h2>
            <X onClick={handleCancel} className="cursor-pointer" />
          </div>
          {/* Card start */}
          <div className="p-2">
            <AccessPointsEditModal />
          </div>
        </CustomModal1>
      )}
    </div>
  );
};
export default AccessEntitlementElemantModal;
