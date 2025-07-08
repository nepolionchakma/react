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
import { IManageGlobalConditionLogicExtendTypes as Extend } from "@/types/interfaces/ManageAccessEntitlements.interface";
import { FC, useEffect, useState } from "react";
import { useAACContext } from "@/Context/ManageAccessEntitlements/AdvanceAccessControlsContext";
import ManageGlobalConditionUpdate from "../Update/ManageGlobalConditionUpdate";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ring } from "ldrs";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "@/components/ui/use-toast";
import { Save, X } from "lucide-react";
import DragOverlayComponent from "./DragOverlayComponent";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { putData, postData } from "@/Utility/funtion";

const DND: FC = () => {
  const {
    isLoading,
    setStateChange,
    setIdStateChange,
    isEditModalOpen,
    setIsEditModalOpen,
    selectedManageGlobalConditionItem: selectedItem,
    setSelectedManageGlobalConditionItem,
    fetchManageGlobalConditionLogics,
    attrMaxId,
    isActionLoading,
    setIsActionLoading,
  } = useAACContext();
  const [rightWidgets, setRightWidgets] = useState<Extend[]>([]);
  const [originalData, setOriginalData] = useState<Extend[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);

  const iniLeftWidget = [
    {
      id: attrMaxId ? attrMaxId + 1 : 1,
      def_global_condition_logic_id: attrMaxId ? attrMaxId + 1 : 1,
      def_global_condition_id: selectedItem[0]?.def_global_condition_id,
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
        const fetchData = await fetchManageGlobalConditionLogics(
          selectedItem[0]?.def_global_condition_id
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
    name: z.string(),
    description: z.string(),
    datasource: z.string(),
    status: z.string().min(3, {
      message: "Select a option",
    }),
  });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: selectedItem[0]?.name ?? "",
      description: selectedItem[0]?.description ?? "",
      datasource: selectedItem[0]?.datasource ?? "",
      status: selectedItem[0]?.status ?? "",
    },
  });
  //changed Access GlobalCondition Value
  const changedAccessGlobalCondition = form.watch();
  const isChangedAccessGlobalCondition = form.formState.isDirty;
  //Top Form END
  ring.register(); // Default values shown

  //DND START
  //Active Item
  const leftWidget = leftWidgets.find(
    (item) => item.def_global_condition_logic_id === activeId
  );
  const rightWidget = rightWidgets.find(
    (item) => item.def_global_condition_logic_id === activeId
  );

  const newId =
    rightWidgets.length > 0
      ? Math.max(...rightWidgets.map((item) => item.id))
      : 0;

  const getId = rightWidgets.length > 0 ? newId + 1 : 1;

  const newItem = {
    id: getId,
    def_global_condition_logic_id: getId,
    def_global_condition_id: selectedItem[0]?.def_global_condition_id,
    object: "",
    attribute: "",
    condition: "",
    value: "",
    widget_position: 0,
    widget_state: 0,
  };
  useEffect(() => {
    if (leftWidgets.length === 0) {
      setLeftWidgets((prev) => [...prev, newItem]);
    }
  }, [leftWidgets.length]);

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
    if (leftWidgets.some((item) => item.def_global_condition_logic_id === id)) {
      return "left";
    }
    if (
      rightWidgets.some((item) => item.def_global_condition_logic_id === id)
    ) {
      return "right";
    }
    return id; // important for find Container where DND item
  };
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    // console.log(active, over, "handleDragOver");
    if (!over) return;

    // Find containers for active and over items
    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

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
      (item) => item.def_global_condition_logic_id === activeItemId
    );
    // const activeIndexInRight = rightWidgets.findIndex(
    //   (item) => item.manage_global_condition_logic_id === activeItemId
    // );
    let newIndex = rightWidgets.length; // Default new index at end

    if (overItemId) {
      // Determine new index for the item being moved
      const overIndexInRight = rightWidgets.findIndex(
        (item) => item.def_global_condition_logic_id === overItemId
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
    if (over) {
      const activeItemId = active.id;
      const overItemId = over.id;

      if (active.data.current?.sortable?.containerId === "right") {
        const oldIndex = rightWidgets.findIndex(
          (item) => item.def_global_condition_logic_id === activeItemId
        );
        const newIndex = rightWidgets.findIndex(
          (item) => item.def_global_condition_logic_id === overItemId
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
          ori.attribute === item.attribute &&
          ori.object === item.object &&
          ori.condition === item.condition &&
          ori.value === item.value &&
          ori.widget_position === item.widget_position &&
          ori.widget_state === item.widget_state
      )
  );

  const handleSave = async () => {
    const upsertLogics = items.map((item) => ({
      def_global_condition_logic_id: item.def_global_condition_logic_id,
      def_global_condition_id: item.def_global_condition_id,
      object: item.object,
      attribute: item.attribute,
      condition: item.condition,
      value: item.value,
    }));
    const upsertAttributes = items.map((item) => ({
      id: item.id,
      def_global_condition_logic_id: item.def_global_condition_logic_id,
      widget_position: item.widget_position,
      widget_state: item.widget_state,
    }));

    const putParams = {
      baseURL: FLASK_URL,
      url:
        flaskApi.DefGlobalConditions +
        "/" +
        selectedItem[0]?.def_global_condition_id,
      setLoading: setIsActionLoading,
      payload: changedAccessGlobalCondition,
    };

    const postGlobalConditionLogicsParams = {
      baseURL: FLASK_URL,
      url: `${flaskApi.DefGlobalConditionLogics}/upsert`,
      setLoading: setIsActionLoading,
      payload: upsertLogics,
    };

    const postGlobalConditionAttributeParams = {
      baseURL: FLASK_URL,
      url: `${flaskApi.DefGlobalConditionLogicAttributes}/upsert`,
      setLoading: setIsActionLoading,
      payload: upsertAttributes,
    };

    if (isChangedAccessGlobalCondition) {
      const res = await putData(putParams);
      if (res) {
        setStateChange((prev) => prev + 1);
        setIsEditModalOpen(false);
        setSelectedManageGlobalConditionItem([]);
        // form.reset(form.getValues());
      }
    }

    if (items.length > 0) {
      const [response1, response2] = await Promise.all([
        postData(postGlobalConditionLogicsParams),
        postData(postGlobalConditionAttributeParams),
      ]);

      if (response1.status === 200 && response2.status === 200) {
        setOriginalData([...rightWidgets]);
        setIdStateChange((prev) => prev + 1);
      }
    }
  };
  return (
    <div>
      <div className="flex justify-between sticky top-0 p-2 bg-slate-300 z-50 overflow-hidden">
        <h2 className="font-bold">Edit Global Conditions</h2>
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
                items.length > 0 || isChangedAccessGlobalCondition
                  ? handleSave
                  : undefined
              }
              size={30}
              className={`rounded p-1 duration-300 z-50 ${
                items.length > 0 || isChangedAccessGlobalCondition
                  ? "bg-slate-300 hover:text-white hover:bg-slate-500 hover:scale-110 cursor-pointer"
                  : "opacity-40 cursor-not-allowed"
              }`}
            />
          )}

          <X
            size={30}
            onClick={() => {
              setIsEditModalOpen(!isEditModalOpen);
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
                <ManageGlobalConditionUpdate form={form} />
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
                id={String(activeItem.def_global_condition_logic_id)}
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
