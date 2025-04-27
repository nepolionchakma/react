import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnterpriseDataTable } from "./Enterprise/EnterpriseDataTable";
import { TenancyDataTable } from "./Tenancy/TenancyDataTable";
import { FileEdit, PlusIcon, Trash } from "lucide-react";
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
import { useState } from "react";
import {
  IEnterprisesTypes,
  ITenantsTypes,
} from "@/types/interfaces/users.interface";

const ManageTenancyandEnterpriseSetup = () => {
  const [tabName, setTabName] = useState<string>("tenancy");
  const [action, setAction] = useState("");
  // const [openedModalName, setOpenedModalName] = useState<string>("");
  const [selectedData, setSelectedData] = useState<
    ITenantsTypes[] | IEnterprisesTypes[]
  >([]);
  return (
    <div>
      <div className="flex gap-3 mb-1">
        <div className="flex gap-3 items-center px-4 py-2 border rounded">
          <div className="flex gap-3">
            <PlusIcon
              className="cursor-pointer"
              onClick={() => setAction("create")}
            />
            <button
            // disabled={
            //   selectedUsers.length > 1 || selectedUsers.length === 0
            // }
            >
              <FileEdit
              // className={`${
              //   selectedUsers.length > 1 || selectedUsers.length === 0
              //     ? "text-slate-200 cursor-not-allowed"
              //     : "cursor-pointer"
              // }`}
              // onClick={() => handleOpenModal("edit_user")}
              />
            </button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                // disabled={
                //   token.user_type !== "system" || selectedUsers.length === 0
                // }
                >
                  <Trash
                  // className={`${
                  //   token.user_type !== "system" ||
                  //   selectedUsers.length === 0
                  //     ? "cursor-not-allowed text-slate-200"
                  //     : "cursor-pointer"
                  // }`}
                  />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {/* {selectedUsers.map((item, index) => (
                      <span key={item.user_id} className="block text-red-500">
                        {index + 1}. username : {item.user_name}
                      </span>
                    ))} */}
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                  // onClick={handleDelete}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
      <Tabs defaultValue="tenancy" className="w-full">
        <TabsList className="grid w-1/2  grid-cols-2 mb-1">
          <TabsTrigger value="tenancy" onClick={() => setTabName("tenancy")}>
            Tenancy
          </TabsTrigger>
          <TabsTrigger
            value="enterprise"
            onClick={() => setTabName("enterprise")}
          >
            Enterprise Setup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tenancy">
          <div className="rounded-md border">
            <TenancyDataTable
              tabName={tabName}
              action={action}
              setAction={setAction}
              selectedData={selectedData}
              setSelectedData={setSelectedData}
            />
          </div>
        </TabsContent>

        <TabsContent value="enterprise">
          <div className="rounded-md border">
            <EnterpriseDataTable
              tabName={tabName}
              action={action}
              setAction={setAction}
              selectedData={selectedData}
              setSelectedData={setSelectedData}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageTenancyandEnterpriseSetup;
