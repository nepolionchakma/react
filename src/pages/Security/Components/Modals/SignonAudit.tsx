import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { IUserLinkedDevices } from "@/types/interfaces/users.interface";
import { X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SignonAuditProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedDevice: IUserLinkedDevices | null;
}

export default function SignonAudit({
  showModal,
  setShowModal,
  selectedDevice,
}: SignonAuditProps) {
  const convertDate = (isoDateString: Date) => {
    const date = new Date(isoDateString);
    const formattedDate = date.toLocaleString();
    return formattedDate;
  };
  return (
    <>
      {showModal && (
        <CustomModal4>
          <div className="w-[500px]">
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
              <Table>
                <TableHeader>
                  <TableRow className="p-1">
                    <TableHead>SL</TableHead>
                    <TableHead>Login Time</TableHead>
                    <TableHead className="text-right">Logout Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedDevice &&
                    selectedDevice.signon_audit &&
                    selectedDevice.signon_audit.map((data, index) => (
                      <TableRow key={data.signon_id} className="py-1">
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          {data.login ? `${convertDate(data.login)}` : "Null"}
                        </TableCell>
                        <TableCell className="text-right">
                          {data.logout ? `${convertDate(data.logout)}` : "Null"}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CustomModal4>
      )}
    </>
  );
}
