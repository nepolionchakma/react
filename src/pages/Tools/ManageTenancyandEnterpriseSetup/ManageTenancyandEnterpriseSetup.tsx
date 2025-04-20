import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TenancyDataTable from "./TenancyDataTable.js";
import EnterpriseDataTable from "./EnterpriseDataTable.js";

const ManageTenancyandEnterpriseSetup = () => {
  return (
    <div className="mt-16">
      <Tabs defaultValue="tenancy" className="w-full">
        <TabsList className="grid w-1/2  grid-cols-2 mb-8">
          <TabsTrigger value="tenancy">Tenancy</TabsTrigger>
          <TabsTrigger value="enterprise">Enterprise Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="tenancy">
          <div className="rounded-md border">
            <TenancyDataTable />
          </div>
        </TabsContent>

        <TabsContent value="enterprise">
          <div className="rounded-md border">
            <EnterpriseDataTable />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageTenancyandEnterpriseSetup;
