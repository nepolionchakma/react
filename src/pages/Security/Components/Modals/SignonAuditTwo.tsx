import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { IUserLinkedDevices } from "@/types/interfaces/users.interface";
import { X } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
import { convertDate } from "@/Utility/DateConverter";
import { useState } from "react";

interface Props {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedDevice: IUserLinkedDevices | null;
}

const SignonAuditTwo = ({ showModal, setShowModal, selectedDevice }: Props) => {
  const [selectedItem, setSelectedItem] = useState("");

  const handleSelect = (item: string) => {
    if (selectedItem === item) {
      setSelectedItem("");
    } else {
      setSelectedItem(item);
    }
  };
  return (
    <>
      {showModal && (
        <CustomModal4>
          <div className="w-[700px]">
            <div className="flex justify-between items-center bg-[#CEDEF2] p-2">
              <h3 className="font-semibold">
                IP Address: {selectedDevice?.ip_address}
              </h3>
              <X
                onClick={() => setShowModal(false)}
                className="cursor-pointer"
              />
            </div>
            <div className="max-h-[70vh] overflow-auto scrollbar-thin p-4">
              <div className="flex items-center w-full bg-winter-300 p-2 font-semibold">
                <p className="w-[8%]">SL</p>
                <p className="w-[35%]">Signin Time</p>
                <p className="w-[35%] ">Signout Time</p>
                <p className="w-[22%] text-end">Action</p>
              </div>
              <div className="flex flex-col">
                {selectedDevice &&
                  selectedDevice.signon_audit &&
                  selectedDevice.signon_audit.map((item, index) => (
                    <div key={item.signon_id} className="border-b ">
                      <div
                        className={`flex items-center w-full p-2 ${
                          item.signon_id === selectedItem && "bg-blue-50"
                        }`}
                      >
                        <p className="w-[8%]">{index + 1}</p>
                        {item.login ? (
                          <p className="w-[35%]">{convertDate(item.login)}</p>
                        ) : (
                          <p className="w-[35%]">Null</p>
                        )}
                        {item.logout ? (
                          <p className="w-[35%]">{convertDate(item.logout)}</p>
                        ) : (
                          <p className="w-[35%]">Null</p>
                        )}
                        <p
                          className="w-[22%] font-semibold text-blue-600 text-end cursor-pointer"
                          onClick={() => handleSelect(item.signon_id)}
                        >
                          Session Log
                        </p>
                      </div>
                      {item.signon_id === selectedItem && (
                        <div className="bg-blue-50">
                          <div className="flex items-center w-full bg-gray-100 p-2">
                            <p className="w-[10%]"></p>
                            <p className="w-[45%]">Connection In Time</p>
                            <p className="w-[45%] text-end">
                              Connection Out Time
                            </p>
                          </div>
                          <div className="flex flex-col">
                            {item.session_log &&
                              item.session_log.map((session, sessionIndex) => (
                                <div
                                  key={session.session_id}
                                  className="flex items-center w-full p-2"
                                >
                                  <p className="w-[10%] text-end pr-8">
                                    {" "}
                                    {sessionIndex + 1}
                                  </p>
                                  {session.connect_time ? (
                                    <p className="w-[45%]">
                                      {convertDate(session.connect_time)}
                                    </p>
                                  ) : (
                                    <p className="w-[45%]">Null</p>
                                  )}
                                  {session.disconnect_time ? (
                                    <p className="w-[45%] text-end">
                                      {convertDate(session.disconnect_time)}
                                    </p>
                                  ) : (
                                    <p className="w-[45%] text-end">Null</p>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CustomModal4>
      )}
    </>
  );
};

export default SignonAuditTwo;
