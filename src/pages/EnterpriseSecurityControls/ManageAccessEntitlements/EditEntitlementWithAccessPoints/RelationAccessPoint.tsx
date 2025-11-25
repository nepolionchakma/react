import { Delete } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { IAccessPointTypes } from "@/types/interfaces/ManageAccessEntitlements.interface";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useManageAccessEntitlementsContext } from "@/Context/ManageAccessEntitlements/ManageAccessEntitlementsContext";
import Spinner from "@/components/Spinner/Spinner";
// import Alert from "@/components/Alert/Alert";

const RelationAccessPoint = ({ tableRow }: { tableRow: () => void }) => {
  const {
    isLoadingUnLinkedAccessPoints,
    fetchUnLinkedAccessPointsData,
    selectedManageAccessEntitlements,
    createAccessEntitlementElements,
    selectedAccessEntitlementElements,
    deleteAccessEntitlementElement,
    unLinkedAccessPoints,
    setSelectedAccessEntitlementElements,
  } = useManageAccessEntitlementsContext();

  const [selectedItem, setSelectedItem] = useState<IAccessPointTypes[]>([]);
  const [query, setQuery] = useState({ isEmpty: true, value: "" });

  useEffect(() => {
    const fetchData = async () => {
      if (query.isEmpty) {
        await fetchUnLinkedAccessPointsData(query.value);
      } else {
        await fetchUnLinkedAccessPointsData();
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchData();
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [query.value]);

  const handleQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery({ isEmpty: true, value: e.target.value });
  };

  const handleSelect = (selectItem: IAccessPointTypes) => {
    setSelectedItem((prevSelected) => {
      const isSelected = prevSelected.some(
        (item) => item.def_access_point_id === selectItem.def_access_point_id
      );

      if (isSelected) {
        // If the item is already selected, remove it
        return prevSelected.filter(
          (item) => item.def_access_point_id !== selectItem.def_access_point_id
        );
      } else {
        // If the item is not selected, add it
        return [...prevSelected, selectItem];
      }
    });
  };

  const handleRemoveReciever = (reciever: IAccessPointTypes) => {
    const newRecipients = selectedItem?.filter((rcvr) => rcvr !== reciever);
    setSelectedItem(newRecipients);
  };

  const handleSelectAll = () => {
    setSelectedItem(unLinkedAccessPoints ?? []);
  };
  const handleRemoveSeletedItems = () => {
    setSelectedItem([]);
  };

  const handleAdd = async () => {
    const selectedIds = selectedItem?.map((item) => item.def_access_point_id);
    setQuery({ isEmpty: false, value: "" });
    await createAccessEntitlementElements(
      selectedManageAccessEntitlements?.def_entitlement_id
        ? selectedManageAccessEntitlements.def_entitlement_id
        : 0,
      selectedIds
    );
    handleRemoveSeletedItems();
  };

  const handleRemoveAccessEntitlementElements = () => {
    setQuery({ isEmpty: false, value: "" });
    deleteAccessEntitlementElement(
      selectedManageAccessEntitlements?.def_entitlement_id
        ? selectedManageAccessEntitlements.def_entitlement_id
        : 0,
      selectedAccessEntitlementElements
    );
    tableRow();
    setSelectedAccessEntitlementElements([]);
  };

  return (
    <div>
      <div className="flex gap-4">
        <div className="h-[12rem] w-80 overflow-y-auto scrollbar-thin border rounded-sm ">
          <input
            type="text"
            className="sticky top-0 w-full bg-light-100 border-b border-light-400 outline-none px-2 py-1"
            placeholder="Search Access Point Name"
            autoFocus
            value={query.value}
            onChange={handleQueryChange}
          />
          <div className="flex flex-col gap-2 p-2">
            {unLinkedAccessPoints?.length > 1 && (
              <span
                onClick={
                  selectedItem?.length !== unLinkedAccessPoints?.length
                    ? handleSelectAll
                    : handleRemoveSeletedItems
                }
                className="flex justify-between px-2 items-center hover:bg-light-200 cursor-pointer border rounded"
              >
                <p>
                  {unLinkedAccessPoints?.length > 1 &&
                    !isLoadingUnLinkedAccessPoints &&
                    "All"}
                </p>
                {selectedItem?.length === unLinkedAccessPoints?.length &&
                unLinkedAccessPoints?.length > 1 ? (
                  <Check size={14} color="#038C5A" />
                ) : null}
              </span>
            )}
            {unLinkedAccessPoints.length === 0 &&
              !isLoadingUnLinkedAccessPoints && <div>No results.</div>}
            {isLoadingUnLinkedAccessPoints ? (
              <div className="flex justify-center mt-5">
                <Spinner color="black" size="40" />
              </div>
            ) : (
              unLinkedAccessPoints?.map((item) => (
                <div
                  onClick={() => handleSelect(item)}
                  key={item.def_access_point_id}
                  className="flex justify-between px-2 items-center hover:bg-light-200 cursor-pointer border rounded"
                >
                  <p className="text-sm">
                    {item.access_point_name.slice(0, 23)}
                    {item.access_point_name.slice(0, 23).length === 23 && "..."}
                  </p>
                  {selectedItem?.some(
                    (selected) =>
                      selected.def_access_point_id === item.def_access_point_id
                  ) ? (
                    <Check size={14} color="#038C5A" />
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>

        {/* w-[calc(100%-11rem)] */}
        <div className="w-[calc(100%-11rem)] relative scrollbar-thin border rounded-sm p-3 overflow-y-scroll">
          <div className="rounded-sm scrollbar-thin flex flex-wrap justify-end gap-2">
            <p className="text-sm absolute left-0 top-0 p-1">
              {selectedItem.length}
            </p>
            {selectedItem?.map((rec) => (
              <div
                key={rec.def_access_point_id}
                className="flex gap-1 bg-winter-100 h-8 px-3 items-center rounded-full"
              >
                <p className="text-sm">{rec.access_point_name}</p>
                <div
                  onClick={() => handleRemoveReciever(rec)}
                  className="flex h-[65%] items-end cursor-pointer"
                >
                  <Delete size={18} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* <div className="flex items-center justify-between py-4"> */}
      <div className="flex gap-2 my-2">
        <Button
          onClick={handleAdd}
          disabled={selectedItem?.length === 0}
          className="h-8"
        >
          <h3>Add</h3>
        </Button>

        {/* <Alert actionName="delete" onContinue={handleRemoveAccessEntitlementElements}
        disabled={selectedAccessEntitlementElements?.length === 0}/> */}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={selectedAccessEntitlementElements?.length === 0}
              className="h-8"
            >
              Remove
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will be remove selected Access Point.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveAccessEntitlementElements}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      {/* </div> */}
    </div>
  );
};
export default RelationAccessPoint;
