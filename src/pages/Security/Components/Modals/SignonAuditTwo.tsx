import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { IUserLinkedDevices } from "@/types/interfaces/users.interface";
import { X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { convertDate } from "@/Utility/DateConverter";

interface Props {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedDevice: IUserLinkedDevices | null;
}

const SignonAuditTwo = ({ showModal, setShowModal, selectedDevice }: Props) => {
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
            <div className="max-h-[70vh] overflow-auto scrollbar-thin">
              <div className="flex flex-col gap-4 p-4">
                {selectedDevice &&
                  selectedDevice.signon_audit &&
                  selectedDevice.signon_audit.map((item, index) => (
                    <Card key={item.signon_id} className="py-4">
                      <CardContent className="flex flex-col">
                        <p className="font-semibold">Serial No: {index + 1}</p>
                        <div className="flex justify-between items-center text-gray-700 text-sm">
                          <p>
                            Signon Time:{" "}
                            {item.login ? `${convertDate(item.login)}` : "Null"}
                          </p>
                          {/* <div className="bg-gray-500 w-[0.5px] h-4" /> */}
                          <p>
                            Signout Time:{" "}
                            {item.logout
                              ? `${convertDate(item.logout)}`
                              : "Null"}
                          </p>
                        </div>
                        <div className="bg-gray-300 h-[0.2px] w-full my-2" />
                        <p className="font-semibold">Session Log</p>
                        <div className="flex flex-col gap-2 text-gray-600 text-sm">
                          {item.session_log &&
                            item.session_log.map((session, index) => (
                              <div className="flex items-center">
                                <p>{index + 1}.</p>
                                <div className="flex flex-1 justify-between items-center ml-2">
                                  <p>
                                    Connect Time:{" "}
                                    {session.connect_time
                                      ? convertDate(session.connect_time)
                                      : "Null"}
                                  </p>
                                  {/* <div className="bg-gray-500 w-[0.5px] h-4" /> */}
                                  <p>
                                    Disconnect Time:{" "}
                                    {session.disconnect_time
                                      ? convertDate(session.disconnect_time)
                                      : "Null"}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
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
