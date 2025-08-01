import LinkADevice from "./Components/LinkADevice";
import Passwords from "./Components/Passwords";
import TwoStep from "./Components/TwoStep";
import YourDevices from "./Components/YourDevices";

export default function Security() {
  return (
    <div className="grid grid-cols-3 gap-2 pb-2">
      <div className="col-span-1 flex flex-col gap-2">
        <Passwords />
        <TwoStep />
        <LinkADevice />
      </div>
      <div className="col-span-2 ">
        <YourDevices />
      </div>
    </div>
  );
}
