import { useManageAccessEntitlementsContext } from "@/Context/ManageAccessEntitlements/ManageAccessEntitlementsContext";
import AccessPointsEntitle from "./AccessPointsTable/AccessPointsEntitle";
import ManageAccessEntitlementsTable from "./AccessEntitlementsTable/ManageAccessEntitlementsTable";
import CustomModal3 from "@/components/CustomModal/CustomModal3";
import { X } from "lucide-react";
import AddOrEditAccessEntitlementModal from "./AddOrEditAccessEntitlementModal/AddOrEditAccessEntitlementModal";
// import TestTable from "./testtable";

const ManageAccessEntitlements = () => {
  const {
    editManageAccessEntitlement,
    setEditManageAccessEntitlement,
    selectedManageAccessEntitlements: selectedItem,
    mangeAccessEntitlementAction,
  } = useManageAccessEntitlementsContext();
  return (
    <div>
      {/* Add or Edit Access Entitlement */}
      {editManageAccessEntitlement && (
        <CustomModal3>
          <div className="flex justify-between p-2 bg-slate-300 rounded-t-lg">
            <h2 className="text-lg font-bold">
              {mangeAccessEntitlementAction === "edit"
                ? "Edit Access Entitlement"
                : "Add Access Entitlement"}
            </h2>
            <X
              onClick={() => {
                setEditManageAccessEntitlement(false);
              }}
              className="cursor-pointer"
            />
          </div>
          {/* Card start */}
          <div className="px-6 py-4">
            <AddOrEditAccessEntitlementModal selectedItem={selectedItem} />
          </div>
        </CustomModal3>
      )}
      {/* Tables */}
      <ManageAccessEntitlementsTable />
      <AccessPointsEntitle />
    </div>
  );
};
export default ManageAccessEntitlements;
