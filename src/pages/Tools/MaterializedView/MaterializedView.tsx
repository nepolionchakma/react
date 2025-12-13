import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import CreateAggregateTable from "./CreateAggregateTable/CreateAggregateTable";
import CreateMaterializedView from "./CreateMaterializedView/CreateMaterializedView";

const MaterializedView = () => {
  const [tabName, setTabName] = useState<string>("createMaterializedView");
  return (
    <div>
      <Tabs defaultValue="createMaterializedView" className="w-full">
        <TabsList className="grid w-1/2  grid-cols-3 mb-1">
          <TabsTrigger
            disabled={tabName !== "createMaterializedView"}
            value="createMaterializedView"
            className={
              tabName !== "createMaterializedView"
                ? "cursor-not-allowed"
                : "cursor-pointer"
            }
            // onClick={() => setTabName("CreateMaterializedView")}
          >
            Create Materialized View
          </TabsTrigger>
          <TabsTrigger
            disabled={tabName !== "createAggregateTable"}
            value="createAggregateTable"
            className={
              tabName !== "createAggregateTable"
                ? "cursor-not-allowed"
                : "cursor-pointer"
            }
            // onClick={() => setTabName("CreateAggregateTable")}
          >
            Create Aggregate Table
          </TabsTrigger>
        </TabsList>
        <TabsContent value="createMaterializedView">
          <CreateMaterializedView setTabName={setTabName} />
        </TabsContent>
        <TabsContent value="createAggregateTable">
          <CreateAggregateTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MaterializedView;
