import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import DraggableList from "./DraggableList";
import DroppableList from "./DroppableList";
import { IManageAccessModelLogicExtendTypes as Extend } from "@/types/interfaces/ManageAccessEntitlements.interface";
import { FC, useEffect, useState } from "react";
import { useAACContext } from "@/Context/ManageAccessEntitlements/AdvanceAccessControlsContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ring } from "ldrs";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "@/components/ui/use-toast";
import { Save, X } from "lucide-react";
import DragOverlayComponent from "./DragOverlayComponent";
import ManageAccessModelUpdate from "../Update/ManageAccessModelUpdate";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
interface IManageAccessModelDNDProps {
  setOpenEditModal: React.Dispatch<React.SetStateAction<boolean>>;
  isOpenEditModal: boolean;
}
const DND: FC<IManageAccessModelDNDProps> = ({
  setOpenEditModal,
  isOpenEditModal,
}) => {
  const api = useAxiosPrivate();
  const {
    isLoading,
    selectedAccessModelItem: selectedItem,
    fetchDefAccessModelLogics,
    manageAccessModelAttrMaxId,
    isActionLoading,
    setIsActionLoading,
    // setStateChange,
  } = useAACContext();

  const [rightWidgets, setRightWidgets] = useState<Extend[]>([]);
  const [originalData, setOriginalData] = useState<Extend[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);

  const iniLeftWidget = [
    {
      id: manageAccessModelAttrMaxId ? manageAccessModelAttrMaxId + 1 : 1,
      def_access_model_logic_id: manageAccessModelAttrMaxId
        ? manageAccessModelAttrMaxId + 1
        : 1,
      def_access_model_id: selectedItem[0].def_access_model_id ?? 0,
      filter: "",
      object: "",
      attribute: "",
      condition: "",
      value: "",
      widget_position: 0,
      widget_state: 0,
    },
  ];
  const [leftWidgets, setLeftWidgets] = useState<Extend[]>(iniLeftWidget);

  useEffect(() => {
    const fetchDataFunc = async () => {
      try {
        const fetchData = await fetchDefAccessModelLogics(
          selectedItem[0]?.def_access_model_id ?? 0
        );
        const sortedData = fetchData?.sort(
          (a, b) => a.widget_position - b.widget_position
        );
        setRightWidgets(sortedData as Extend[]);
        setOriginalData(sortedData as Extend[]);
      } catch (error) {
        console.log(error);
      }
    };
    fetchDataFunc();
  }, []);
  // console.log(selectedItem[0], "selectedManageGlobalConditionItem[0]");
  //Top Form Start
  const FormSchema = z.object({
    model_name: z.string(),
    description: z.string(),
    state: z.string(),
    datasource_name: z.string(),
  });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      model_name: selectedItem[0].model_name ?? "",
      description: selectedItem[0].description ?? "",
      datasource_name: selectedItem[0].datasource_name ?? "",
      state: selectedItem[0].state ?? "",
    },
  });

  //changed Access GlobalCondition Value
  const changedAccessModel = form.watch();
  const isChangedAccessAccessModel = form.formState.isDirty;

  //Top Form END
  ring.register(); // Default values shown

  //DND START
  //Active Item
  const leftWidget = leftWidgets.find(
    (item) => item.def_access_model_logic_id === activeId
  );
  const rightWidget = rightWidgets.find(
    (item) => item.def_access_model_logic_id === activeId
  );

  const attrmaxId =
    rightWidgets.length > 0
      ? Math.max(...rightWidgets.map((item) => item.id))
      : 0;
  const getId = rightWidgets.length > 0 ? attrmaxId + 1 : 1;

  useEffect(() => {
    if (leftWidgets.length === 0) {
      const newItem = {
        id: getId,
        def_access_model_logic_id: getId,
        def_access_model_id: selectedItem[0].def_access_model_id ?? 0,
        filter: "",
        object: "",
        attribute: "",
        condition: "",
        value: "",
        widget_position: 0,
        widget_state: 0,
      };
      setLeftWidgets((prev) => [...prev, newItem]);
    }
  }, [leftWidgets.length, getId, selectedItem]);

  const activeItem = activeId ? leftWidget || rightWidget : null;
  const findEmptyInput = rightWidgets.filter(
    (item) =>
      item.object === "" ||
      item.attribute === "" ||
      item.condition === "" ||
      item.value === ""
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };
  const findContainer = (id: string | number | undefined) => {
    if (leftWidgets.some((item) => item.def_access_model_logic_id === id)) {
      return "left";
    }
    if (rightWidgets.some((item) => item.def_access_model_logic_id === id)) {
      return "right";
    }
    return id; // important for find Container where DND item
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    console.log(active.id, over?.id, "handleDragOver");
    if (!over) return;

    // Find containers for active and over items
    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    console.log(activeContainer, overContainer);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }
    const activeItemId = active.id;
    const overItemId = over.id;
    // console.log(activeItemId, overItemId, " handleDragOver");
    // console.log(activeContainer, overContainer, " handleDragOver 2");

    // Ensure that leftEmptyWidget and users are arrays
    if (!Array.isArray(leftWidgets) || !Array.isArray(rightWidgets)) {
      console.error("Expected leftWidgets and users to be arrays");
      return;
    }

    const activeIndexInLeft = leftWidgets.findIndex(
      (item) => item.def_access_model_logic_id === activeItemId
    );
    // const activeIndexInRight = rightWidgets.findIndex(
    //   (item) => item.manage_access_model_logic_id === activeItemId
    // );
    let newIndex = rightWidgets.length; // Default new index at end

    if (overItemId) {
      // Determine new index for the item being moved
      const overIndexInRight = rightWidgets.findIndex(
        (item) => item.def_access_model_logic_id === overItemId
      );
      newIndex =
        overIndexInRight === -1 ? rightWidgets.length : overIndexInRight;
    }
    if (findEmptyInput.length === 0) {
      // console.log(rightWidgets, "right widgets");
      if (activeContainer === "left" && overContainer === "right") {
        // Move item from leftEmptyWidget to users
        setRightWidgets((prev) => {
          const updatedRight = [...prev];
          const [movedItem] = leftWidgets.splice(activeIndexInLeft, 1);
          updatedRight.splice(newIndex, 0, movedItem);
          return updatedRight;
        });
      }
    } else if (findEmptyInput.length > 0) {
      toast({
        variant: "destructive",
        title: "Info",
        description: ` "warning", " Please fill in the empty input"`,
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log(active.id, over?.id, "handleDragEnd");
    if (over) {
      const activeItemId = active.id;
      const overItemId = over.id;

      if (active.data.current?.sortable?.containerId === "right") {
        const oldIndex = rightWidgets.findIndex(
          (item) => item.def_access_model_logic_id === activeItemId
        );
        const newIndex = rightWidgets.findIndex(
          (item) => item.def_access_model_logic_id === overItemId
        );

        if (oldIndex !== -1 && newIndex !== -1) {
          setRightWidgets(
            arrayMove(rightWidgets, oldIndex, newIndex).map((item, index) => ({
              ...item,
              widget_position: index,
            }))
          );
        }
      }
    }
  };
  //function handleSave
  const items = rightWidgets.filter(
    (item) =>
      !originalData.some(
        (ori) =>
          ori.filter === item.filter &&
          ori.object === item.object &&
          ori.attribute === item.attribute &&
          ori.condition === item.condition &&
          ori.value === item.value &&
          ori.widget_position === item.widget_position &&
          ori.widget_state === item.widget_state
      )
  );

  const handleSave = async () => {
    const upsertLogics = items.map((item) => ({
      def_access_model_logic_id: item.def_access_model_logic_id,
      def_access_model_id: item.def_access_model_id,
      filter: item.filter,
      object: item.object,
      attribute: item.attribute,
      condition: item.condition,
      value: item.value,
    }));

    const upsertAttributes = items.map((item) => ({
      id: item.id,
      def_access_model_logic_id: item.def_access_model_logic_id,
      widget_position: item.widget_position,
      widget_state: item.widget_state,
    }));

    try {
      setIsActionLoading(true);
      if (isChangedAccessAccessModel) {
        api
          .put(
            `/def-access-models/${selectedItem[0].def_access_model_id}`,
            changedAccessModel
          )
          .then((logicResult) => {
            if (logicResult?.status === 200) {
              toast({
                description: logicResult.data.message,
              });
            } else {
              toast({
                description: "Select Data Source",
                variant: "destructive",
              });
            }
            // console.log("Logic Result:", logicResult);
          })
          .catch((error) => {
            if (error instanceof Error) {
              toast({
                title: error.message,
                variant: "destructive",
              });
            }
          })
          .finally(() => {
            setIsActionLoading(false);
          });
      }
      if (items.length > 0) {
        Promise.all([
          api.post(`/def-access-model-logics/upsert`, upsertLogics),
          api.post(
            `/def-access-model-logic-attributes/upsert`,
            upsertAttributes
          ),
        ])
          .then(([logicResult, attributeResult]) => {
            if (logicResult.status === 200 && attributeResult.status === 200) {
              toast({
                description: "Save data successfully.",
              });

              setOriginalData([...rightWidgets]);
            }
            // console.log("Logic Result:", logicResult);
            // console.log("Attribute Result:", attributeResult);
          })
          .catch((error) => {
            console.error("Error occurred:", error);
          })
          .finally(() => {
            setIsActionLoading(false);
          });
      }
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      form.reset(form.getValues());
    }
  };

  return (
    <div>
      <div className="flex justify-between sticky top-0 p-2 bg-slate-300 z-50 overflow-hidden">
        <h2 className="font-bold">Edit Access Model</h2>
        <div className="flex gap-2 rounded-lg ">
          {isActionLoading ? (
            <div className="flex items-center rounded p-1 duration-300 z-50 cursor-not-allowed">
              <l-ring
                size="20"
                stroke="3"
                bg-opacity="0"
                speed="2"
                color="white"
              />
            </div>
          ) : (
            <Save
              onClick={
                items.length > 0 || isChangedAccessAccessModel
                  ? handleSave
                  : undefined
              }
              size={30}
              className={`rounded p-1 duration-300 z-50 ${
                items.length > 0 || isChangedAccessAccessModel
                  ? "bg-slate-300 hover:text-white hover:bg-slate-500 hover:scale-110 cursor-pointer"
                  : "opacity-40 cursor-not-allowed"
              }`}
            />
          )}

          <X
            size={30}
            onClick={() => {
              setOpenEditModal(!isOpenEditModal);
              // Change the state
              // setStateChange((prev) => prev + 1);
            }}
            className="cursor-pointer hover:text-white bg-slate-300 hover:bg-slate-500  rounded p-1 hover:scale-110 duration-300 z-50"
          />
        </div>
      </div>
      <div className="p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          autoScroll
        >
          <div className="flex gap-4 mt-3">
            <div className="w-1/3">
              <DraggableList id="left" items={leftWidgets} />
            </div>
            <div className="w-2/3">
              {/* Top Form */}
              <div className="px-4 pb-2">
                <ManageAccessModelUpdate form={form} />
              </div>
              <div className="border rounded-lg">
                {isLoading ? (
                  <div className="w-10 mx-auto mt-10">
                    <l-ring
                      size="40"
                      stroke="5"
                      bg-opacity="0"
                      speed="2"
                      color="black"
                    ></l-ring>
                  </div>
                ) : (
                  <DroppableList
                    id="right"
                    items={rightWidgets}
                    originalData={originalData}
                    setItems={setRightWidgets}
                  />
                )}
              </div>
            </div>
          </div>
          <DragOverlay>
            {activeItem ? (
              <DragOverlayComponent
                item={activeItem}
                id={String(activeItem.def_access_model_logic_id)}
                items={
                  leftWidgets.includes(activeItem) ? leftWidgets : rightWidgets
                }
                setItems={
                  leftWidgets.includes(activeItem)
                    ? setLeftWidgets
                    : setRightWidgets
                }
                index={0}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};
export default DND;
