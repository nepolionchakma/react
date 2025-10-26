import { useManageAccessEntitlementsContext } from "@/Context/ManageAccessEntitlements/ManageAccessEntitlementsContext";
import CustomModal3 from "@/components/CustomModal/CustomModal3";

import AccessPointsEntitleModal from "./CreateAccessPointsEntitleModal";
import AccessPointsEntitleTable from "./AccessPointsEntitleTable";
import { X } from "lucide-react";
import AccessPointsEditModal from "../EditEntitlementWithAccessPoints/AccessPointsEditModalTable";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import CustomModal4 from "@/components/CustomModal/CustomModal4";

const AccessPointsEntitle = () => {
  const { isOpenModal, setIsOpenModal } = useGlobalContext();
  const {
    selectedManageAccessEntitlements,
    setSelectedAccessEntitlementElements,
  } = useManageAccessEntitlementsContext();

  const handleClose = () => {
    setIsOpenModal("");
    setSelectedAccessEntitlementElements([]);
  };

  return (
    <div>
      {/* Modal access points */}
      {isOpenModal === "access_points" && (
        <CustomModal4 className="w-[70vw] h-[80vh]">
          <div className="flex justify-between p-2 bg-slate-300 rounded-t-lg">
            <h2 className="text-lg font-bold capitalize">
              Manage: {selectedManageAccessEntitlements?.entitlement_name}
            </h2>
            <X
              onClick={() => {
                handleClose();
              }}
              className="cursor-pointer"
            />
          </div>
          {/* Manage Access Entitlement */}
          <div className="p-4 h-[72.4vh] overflow-auto scrollbar-thin">
            <AccessPointsEditModal />
          </div>
        </CustomModal4>
      )}
      {/* Modal create access points */}
      {isOpenModal === "create_access_point" && (
        <CustomModal3>
          <div className="flex justify-between p-2 bg-slate-300 rounded-t-lg">
            <h2 className="text-lg font-bold">Add Access Point</h2>
            <X
              onClick={() => {
                setIsOpenModal("");
              }}
              className="cursor-pointer"
            />
          </div>
          {/* Card start */}
          <div className="px-6 py-4">
            <AccessPointsEntitleModal />
          </div>
        </CustomModal3>
      )}
      <AccessPointsEntitleTable />
    </div>
  );
};
export default AccessPointsEntitle;
