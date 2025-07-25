import { Card } from "@/components/ui/card";
import { CircleAlert } from "lucide-react";

const Alerts = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="flex gap-4 p-4">
        <div className="bg-red-600 w-[40px] h-[36px] flex justify-center items-center rounded-full">
          <CircleAlert color="white" />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex justify-between w-full">
            <p className="font-semibold mb-1">Alert 1</p>
            <p className="text-gray-700">7/1/2025, 5:50:24 PM</p>
          </div>
          <div>
            <p className="text-gray-600">
              Lorem ipsum dolor sit amet consectetur. Eget lobortis tristique
              amet urna. Posuere semper nunc malesuada non massa blandit sit
              posuere. Elit duis neque nec tincidunt est lacus vitae id non...
            </p>
            <p className="text-blue-600 font-semibold">View Details</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-32 h-10 rounded-sm flex justify-center items-center bg-gray-300">
              <p>Button 1</p>
            </button>
          </div>
        </div>
      </Card>

      <Card className="flex gap-4 p-4">
        <div className="bg-red-600 w-[40px] h-[36px] flex justify-center items-center rounded-full">
          <CircleAlert color="white" />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex justify-between w-full">
            <p className="font-semibold mb-1">Alert 2</p>
            <p className="text-gray-700">7/1/2025, 5:52:24 PM</p>
          </div>
          <div>
            <p className="text-gray-600">
              Lorem ipsum dolor sit amet consectetur. Eget lobortis tristique
              amet urna. Posuere semper nunc malesuada non massa blandit sit
              posuere. Elit duis neque nec tincidunt est lacus vitae id non...
            </p>
            <p className="text-blue-600 font-semibold">View Details</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-32 h-10 rounded-sm flex justify-center items-center bg-gray-300">
              <p>Button 1</p>
            </button>
          </div>
        </div>
      </Card>

      <Card className="flex gap-4 p-4">
        <div className="bg-red-600 w-[40px] h-[36px] flex justify-center items-center rounded-full">
          <CircleAlert color="white" />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex justify-between w-full">
            <p className="font-semibold mb-1">Alert 3</p>
            <p className="text-gray-700">7/1/2025, 5:53:24 PM</p>
          </div>
          <div>
            <p className="text-gray-600">
              Lorem ipsum dolor sit amet consectetur. Eget lobortis tristique
              amet urna. Posuere semper nunc malesuada non massa blandit sit
              posuere. Elit duis neque nec tincidunt est lacus vitae id non...
            </p>
            <p className="text-blue-600 font-semibold">View Details</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-32 h-10 rounded-sm flex justify-center items-center bg-gray-300">
              <p>Button 1</p>
            </button>
          </div>
        </div>
      </Card>

      <Card className="flex gap-4 p-4">
        <div className="bg-red-600 w-[40px] h-[36px] flex justify-center items-center rounded-full">
          <CircleAlert color="white" />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex justify-between w-full">
            <p className="font-semibold mb-1">Alert 4</p>
            <p className="text-gray-700">7/1/2025, 5:54:24 PM</p>
          </div>
          <div>
            <p className="text-gray-600">
              Lorem ipsum dolor sit amet consectetur. Eget lobortis tristique
              amet urna. Posuere semper nunc malesuada non massa blandit sit
              posuere. Elit duis neque nec tincidunt est lacus vitae id non...
            </p>
            <p className="text-blue-600 font-semibold">View Details</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-32 h-10 rounded-sm flex justify-center items-center bg-gray-300">
              <p>Button 1</p>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
export default Alerts;
