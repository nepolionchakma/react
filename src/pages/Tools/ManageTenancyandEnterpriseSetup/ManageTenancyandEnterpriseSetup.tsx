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
  // const [openedModalName, setOpenedModalName] = useState<string>("");
  const [selectedTenancyRows, setSelectedTenancyRows] = useState<
    ITenantsTypes[]
  >([]);
  const [selectedEnterpriseRows, setSelectedEnterpriseRows] = useState<
    IEnterprisesTypes[]
  >([]);

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
      }
    } catch (error) {
      console.log(error);
    }
  };
  console.log(selectedTenancyRows);
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
              disabled={
                (selectedTenancyRows.length > 1 ||
                  selectedTenancyRows.length === 0) &&
                (selectedEnterpriseRows.length > 1 ||
                  selectedEnterpriseRows.length === 0)
              }
            >
              <FileEdit
                className={`${
                  (selectedTenancyRows.length > 1 ||
                    selectedTenancyRows.length === 0) &&
                  (selectedEnterpriseRows.length > 1 ||
                    selectedEnterpriseRows.length === 0)
                    ? "text-slate-200 cursor-not-allowed"
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
                      selectedEnterpriseRows.length === 0)
                  }
                >
                  <Trash
                    className={`${
                      (selectedTenancyRows.length > 1 ||
                        selectedTenancyRows.length === 0) &&
                      (selectedEnterpriseRows.length > 1 ||
                        selectedEnterpriseRows.length === 0)
                        ? "cursor-not-allowed text-slate-200"
                        : "cursor-pointer"
                    }`}
                  />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {selectedTenancyRows
                      ? selectedTenancyRows.map((item, index) => (
                          <span
                            key={item.tenant_id}
                            className="block text-red-500"
                          >
                            {index + 1}. Tenant Name : {item.tenant_name}
                          </span>
                        ))
                      : selectedEnterpriseRows.map((item, index) => (
                          <span
                            key={item.tenant_id}
                            className="block text-red-500"
                          >
                            {index + 1}. enterprise_name :{" "}
                            {item.enterprise_name}
                          </span>
                        ))}
                    <p className="mt-2 text-sm text-muted-foreground">
                      This action cannot be undone. This will permanently delete
                      your account and remove your data from our servers.
                    </p>
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
            Enterprise Setup
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
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageTenancyandEnterpriseSetup;
