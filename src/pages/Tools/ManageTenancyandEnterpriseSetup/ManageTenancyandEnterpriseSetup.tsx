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
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "@/components/ui/use-toast";

const ManageTenancyandEnterpriseSetup = () => {
  const api = useAxiosPrivate();
  const [tabName, setTabName] = useState<string>("tenancy");
  const [action, setAction] = useState("");
  const [selectedTenancyRows, setSelectedTenancyRows] = useState<
    ITenantsTypes[]
  >([]);
  const [selectedEnterpriseRows, setSelectedEnterpriseRows] = useState<
    IEnterprisesTypes[]
  >([]);
  const [stateChanged, setStateChanged] = useState<number>(0);

  const handleDelete = async () => {
    try {
      if (tabName === "tenancy") {
        const res = await api.delete(
          `/def-tenants/${selectedTenancyRows[0].tenant_id}`
        );
        if (res) {
          toast({
            description: `${res.data.message}`,
          });
        }
      } else {
        const res = await api.delete(
          `/def-tenant-enterprise-setup/${selectedEnterpriseRows[0].tenant_id}`
        );
        if (res) {
          toast({
            description: `${res.data.message}`,
          });
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setStateChanged(Math.random() + 23 * 3000);
    }
  };

  return (
    <div>
      <div className="flex gap-3 mb-1">
        <div className="flex gap-3 items-center px-4 py-2 border rounded">
          <div className="flex gap-3">
            <button
              disabled={
                (tabName === "enterprise" &&
                  (selectedEnterpriseRows[0]?.enterprise_name !== null ||
                    selectedEnterpriseRows[0]?.enterprise_type !== null)) ||
                selectedEnterpriseRows.length > 1
              }
              className=" disabled:text-slate-200 disabled:cursor-not-allowed"
            >
              <PlusIcon onClick={() => setAction("create")} />
            </button>
            <button
              disabled={
                (selectedTenancyRows.length > 1 ||
                  selectedTenancyRows.length === 0) &&
                (selectedEnterpriseRows.length > 1 ||
                  selectedEnterpriseRows.length === 0 ||
                  !selectedEnterpriseRows[0]?.enterprise_name)
                // || !selectedEnterpriseRows[0]?.enterprise_type
              }
            >
              <FileEdit
                className={`${
                  (selectedTenancyRows.length > 1 ||
                    selectedTenancyRows.length === 0) &&
                  (selectedEnterpriseRows.length > 1 ||
                    selectedEnterpriseRows.length === 0 ||
                    !selectedEnterpriseRows[0]?.enterprise_name)
                    ? //  !selectedEnterpriseRows[0]?.enterprise_type
                      "text-slate-200 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                onClick={() => setAction("edit")}
              />
            </button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  disabled={
                    (selectedTenancyRows.length > 1 ||
                      selectedTenancyRows.length === 0) &&
                    (selectedEnterpriseRows.length > 1 ||
                      selectedEnterpriseRows.length === 0 ||
                      !selectedEnterpriseRows[0]?.enterprise_name)
                    // || !selectedEnterpriseRows[0]?.enterprise_type
                  }
                >
                  <Trash
                    className={`${
                      (selectedTenancyRows.length > 1 ||
                        selectedTenancyRows.length === 0) &&
                      (selectedEnterpriseRows.length > 1 ||
                        selectedEnterpriseRows.length === 0 ||
                        !selectedEnterpriseRows[0]?.enterprise_name)
                        ? // ||  !selectedEnterpriseRows[0]?.enterprise_type
                          "cursor-not-allowed text-slate-200"
                        : "cursor-pointer"
                    }`}
                  />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {tabName === "tenancy"
                      ? selectedTenancyRows.map((item, index) => (
                          <span
                            key={item.tenant_id}
                            className="block text-black"
                          >
                            {index + 1}. Tenant Name : {item.tenant_name}
                          </span>
                        ))
                      : selectedEnterpriseRows.map((item, index) => (
                          <span
                            key={item.tenant_id}
                            className="block text-black"
                          >
                            {index + 1}. Enterprise Name :{" "}
                            {item.enterprise_name}
                          </span>
                        ))}
                    <span className="mt-2 text-sm text-muted-foreground block">
                      This action cannot be undone. This will permanently delete
                      your account and remove your data from our servers.
                    </span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
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
            Enterprise
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tenancy">
          <div className="rounded-md border">
            <TenancyDataTable
              tabName={tabName}
              action={action}
              setAction={setAction}
              selectedTenancyRows={selectedTenancyRows}
              setSelectedTenancyRows={setSelectedTenancyRows}
              stateChanged={stateChanged}
              setStateChanged={setStateChanged}
            />
          </div>
        </TabsContent>

        <TabsContent value="enterprise">
          <div className="rounded-md border">
            <EnterpriseDataTable
              tabName={tabName}
              action={action}
              setAction={setAction}
              selectedEnterpriseRows={selectedEnterpriseRows}
              setSelectedEnterpriseRows={setSelectedEnterpriseRows}
              stateChanged={stateChanged}
              setStateChanged={setStateChanged}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageTenancyandEnterpriseSetup;
