import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnterpriseDataTable } from "./Enterprise/EnterpriseDataTable";
import { TenancyDataTable } from "./Tenancy/TenancyDataTable";
import { useState } from "react";
import {
  IEnterprisesTypes,
  ITenantsTypes,
} from "@/types/interfaces/users.interface";

const ManageTenancyandEnterpriseSetup = () => {
  // const api = useAxiosPrivate();
  const [tabName, setTabName] = useState<string>("Tenancy");
  const [action, setAction] = useState("");
  const [selectedTenancyRows, setSelectedTenancyRows] = useState<
    ITenantsTypes[]
  >([]);
  const [selectedEnterpriseRows, setSelectedEnterpriseRows] = useState<
    IEnterprisesTypes[]
  >([]);

  return (
    <div>
      <Tabs defaultValue="tenancy" className="w-full">
        <TabsList className="grid w-1/2  grid-cols-2 mb-1">
          <TabsTrigger value="tenancy" onClick={() => setTabName("Tenancy")}>
            Tenancy
          </TabsTrigger>
          <TabsTrigger
            value="enterprise"
            onClick={() => setTabName("Enterprise")}
          >
            Enterprise Setup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tenancy">
          <TenancyDataTable
            tabName={tabName}
            action={action}
            setAction={setAction}
            selectedTenancyRows={selectedTenancyRows}
            setSelectedTenancyRows={setSelectedTenancyRows}
          />
        </TabsContent>

        <TabsContent value="enterprise">
          <EnterpriseDataTable
            tabName={tabName}
            action={action}
            setAction={setAction}
            selectedEnterpriseRows={selectedEnterpriseRows}
            setSelectedEnterpriseRows={setSelectedEnterpriseRows}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageTenancyandEnterpriseSetup;
