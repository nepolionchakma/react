import { Card } from "@/components/ui/card";
import { CircleCheckBig } from "lucide-react";

const ActionItems = () => {
  return (
    <div className="flex flex-col gap-4">
      <Card className="flex gap-4 p-4">
        <div className="bg-blue-500 w-[40px] h-[40px] flex justify-center items-center rounded-full">
          <CircleCheckBig color="white" />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex justify-between w-full">
            <div>
              <p>Action Item 1</p>
              <p className="text-gray-600">Lorem ipsum dolor</p>
            </div>
            <p className="text-blue-600">Time</p>
          </div>
          <div>
            <p className="font-semibold mb-1">
              Lorem ipsum lorem ipsum lorem lorem lorem
            </p>
            <p className="text-gray-600">
              Lorem ipsum dolor sit amet consectetur. Eget lobortis tristique
              amet urna. Posuere semper nunc malesuada non massa blandit sit
              posuere. Elit duis neque nec tincidunt est lacus vitae id non.
            </p>
          </div>
          <div className="flex justify-between gap-1">
            <button className="w-[49%] h-10 rounded-sm flex justify-center items-center bg-gray-300">
              <p>ITEM 1</p>
            </button>
            <button className="w-[49%] h-10 rounded-sm flex justify-center items-center bg-gray-300">
              <p>ITEM 2</p>
            </button>
          </div>
        </div>
      </Card>

      <Card className="flex gap-4 p-4">
        <div className="w-[40px] h-[40px] flex justify-center items-center rounded-full border-2 border-[#3b82f6]">
          <CircleCheckBig color="#3b82f6" />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex justify-between w-full">
            <div>
              <p>Action Item 2</p>
              <p className="text-gray-600">Lorem ipsum dolor</p>
            </div>
            <p className="text-blue-600">Time</p>
          </div>
          <div>
            <p className="font-semibold mb-1">
              Lorem ipsum lorem ipsum lorem lorem lorem
            </p>
            <p className="text-gray-600">
              Lorem ipsum dolor sit amet consectetur. Eget lobortis tristique
              amet urna. Posuere semper nunc malesuada non massa blandit sit
              posuere. Elit duis neque nec tincidunt est lacus vitae id non.
            </p>
          </div>
          <div className="flex justify-between gap-1">
            <button className="w-[49%] h-10 rounded-sm flex justify-center items-center bg-gray-300">
              <p>ITEM 1</p>
            </button>
            <button className="w-[49%] h-10 rounded-sm flex justify-center items-center bg-gray-300">
              <p>ITEM 2</p>
            </button>
          </div>
        </div>
      </Card>

      <Card className="flex gap-4 p-4">
        <div className="w-[40px] h-[40px] flex justify-center items-center rounded-full border-2 border-[#3b82f6]">
          <CircleCheckBig color="#3b82f6" />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex justify-between w-full">
            <div>
              <p>Action Item 3</p>
              <p className="text-gray-600">Lorem ipsum dolor</p>
            </div>
            <p className="text-blue-600">Time</p>
          </div>
          <div>
            <p className="font-semibold mb-1">
              Lorem ipsum lorem ipsum lorem lorem lorem
            </p>
            <p className="text-gray-600">
              Lorem ipsum dolor sit amet consectetur. Eget lobortis tristique
              amet urna. Posuere semper nunc malesuada non massa blandit sit
              posuere. Elit duis neque nec tincidunt est lacus vitae id non.
            </p>
          </div>
          <div className="flex justify-between gap-1">
            <button className="w-[49%] h-10 rounded-sm flex justify-center items-center bg-gray-300">
              <p>ITEM 1</p>
            </button>
            <button className="w-[49%] h-10 rounded-sm flex justify-center items-center bg-gray-300">
              <p>ITEM 2</p>
            </button>
          </div>
        </div>
      </Card>

      <Card className="flex gap-4 p-4">
        <div className="bg-blue-500 w-[40px] h-[40px] flex justify-center items-center rounded-full">
          <CircleCheckBig color="white" />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex justify-between w-full">
            <div>
              <p>Action Item 4</p>
              <p className="text-gray-600">Lorem ipsum dolor</p>
            </div>
            <p className="text-blue-600">Time</p>
          </div>
          <div>
            <p className="font-semibold mb-1">
              Lorem ipsum lorem ipsum lorem lorem lorem
            </p>
            <p className="text-gray-600">
              Lorem ipsum dolor sit amet consectetur. Eget lobortis tristique
              amet urna. Posuere semper nunc malesuada non massa blandit sit
              posuere. Elit duis neque nec tincidunt est lacus vitae id non.
            </p>
          </div>
          <div className="flex justify-between gap-1">
            <button className="w-[49%] h-10 rounded-sm flex justify-center items-center bg-gray-300">
              <p>ITEM 1</p>
            </button>
            <button className="w-[49%] h-10 rounded-sm flex justify-center items-center bg-gray-300">
              <p>ITEM 2</p>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
export default ActionItems;
