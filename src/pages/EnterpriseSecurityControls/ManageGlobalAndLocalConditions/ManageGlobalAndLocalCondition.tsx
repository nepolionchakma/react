import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import ManageGlobalConditions from "../ManageGlobalConditions/ManageGlobalConditions";
import ManageLocalConditions from "../ManageLocalConditions/ManageLocalConditions";
import { useAACContext } from "@/Context/ManageAccessEntitlements/AdvanceAccessControlsContext";

const ManageGlobalAndLocalCondition = () => {
  const { setSelectedManageGlobalConditionItem } = useAACContext();
  const [tabName, setTabName] = useState<string>("Global");
  const [globalLimit, setGlobalLimit] = useState(8);
  const [localLimit, setLocalLimit] = useState(8);
  const [selectedGlobalIds, setSelecteGlobalIds] = useState<number[]>([]);

  console.log(tabName);

  useEffect(() => {
    setSelectedManageGlobalConditionItem([]);
  }, []);

  return (
    <div>
      <Tabs defaultValue="global" className="w-full">
        <TabsList className="grid w-1/2  grid-cols-2 mb-1">
          <TabsTrigger value="global" onClick={() => setTabName("Global")}>
            Global Conditions
          </TabsTrigger>
          <TabsTrigger value="local" onClick={() => setTabName("Local")}>
            Local Conditions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global">
          <ManageGlobalConditions
            globalLimit={globalLimit}
            setGlobalLimit={setGlobalLimit}
            selectedGlobalIds={selectedGlobalIds}
            setSelecteGlobalIds={setSelecteGlobalIds}
          />
        </TabsContent>

        <TabsContent value="local">
          <ManageLocalConditions
            localLimit={localLimit}
            setLocalLimit={setLocalLimit}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageGlobalAndLocalCondition;
