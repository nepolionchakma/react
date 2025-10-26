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
  const { selectedManageAccessEntitlements } =
    useManageAccessEntitlementsContext();
  // const handleClose = () => {
  //   setIsOpenModal(false);
  //   fetchAccessPointsEntitlement(selected[0]);
  // };
  return (
    <div>
      {/* Modal access points */}
      {isOpenModal === "access_points" && (
        <CustomModal4 className="w-[70vw] h-[80vh]">
          <div className="flex justify-between p-2 bg-slate-300 rounded-t-lg">
            <h2 className="text-lg font-bold capitalize">
              Add Access Point to:{" "}
              {selectedManageAccessEntitlements?.entitlement_name} Entitlement
            </h2>
            <X
              onClick={() => {
                setIsOpenModal("");
              }}
              className="cursor-pointer"
            />
          </div>
          {/* Card start */}
          <div className="p-4">
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
// not working this file
