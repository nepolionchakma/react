import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { IPrivilege, IRole } from "@/types/interfaces/users.interface";
import Roles from "./Roles/Roles";
import Privileges from "./Privileges/Privileges";

const ManagePrivelegesAndRoles = () => {
  const { grantendEndpoints } = useGlobalContext();
  const [privilegesLimit, setPrivilegesLimit] = useState<number>(8);
  const [rolesLimit, setRolesLimit] = useState<number>(8);
  const [selectedPrivilegeRows, setSelectedPrivilegeRows] = useState<
    IPrivilege[]
  >([]);
  const [selectedRoleRows, setSelectedRoleRows] = useState<IRole[]>([]);

  const endpointIds = grantendEndpoints.map((item) => item.api_endpoint_id);
  return (
    <div>
      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="grid w-1/2  grid-cols-2 mb-1">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          {endpointIds?.includes(1152) && (
            <TabsTrigger value="privileges">Privileges </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="roles">
          <Roles
            rolesLimit={rolesLimit}
            setRolesLimit={setRolesLimit}
            selectedRoleRows={selectedRoleRows}
            setSelectedRoleRows={setSelectedRoleRows}
          />
        </TabsContent>

        {endpointIds?.includes(1152) && (
          <TabsContent value="privileges">
            <Privileges
              privilegesLimit={privilegesLimit}
              setPrivilegesLimit={setPrivilegesLimit}
              selectedPrivilegeRows={selectedPrivilegeRows}
              setSelectedPrivilegeRows={setSelectedPrivilegeRows}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ManagePrivelegesAndRoles;
