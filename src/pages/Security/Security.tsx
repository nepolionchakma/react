import LinkADevice from "./Components/LinkADevice";
import Passwords from "./Components/Passwords";
import TwoStep from "./Components/TwoStep";
import YourDevices from "./Components/YourDevices";

export default function Security() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-2 pb-2 overflow-y-auto scrollbar-thin ">
      <div className="col-span-1 grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-col gap-2">
        <Passwords />
        <TwoStep />
        <LinkADevice />
      </div>
      <div className="col-span-1 md:col-span-2 lg:col-span-2">
        <YourDevices />
      </div>
    </div>
  );
}
