import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnterpriseDataTable } from "./Enterprise/EnterpriseDataTable";
import { TenancyDataTable } from "./Tenancy/TenancyDataTable";
import { useState } from "react";
import {
  IEnterprisesTypes,
  IJobTitle,
  ITenantsTypes,
} from "@/types/interfaces/users.interface";
import { JobTitlesDataTable } from "./JobTitles/JobTitlesDataTable";

const ManageTenancyandEnterpriseSetup = () => {
  // const api = useAxiosPrivate();
  const [tabName, setTabName] = useState<string>("Tenancy");
  const [tenancyLimit, setTenancyLimit] = useState<number>(8);
  const [enterpriseLimit, setEnterpriseLimit] = useState<number>(8);
  const [jobTitlesLimit, setJobTitlesLimit] = useState<number>(8);
  const [action, setAction] = useState("");
  const [selectedTenancyRows, setSelectedTenancyRows] = useState<
    ITenantsTypes[]
  >([]);
  const [selectedEnterpriseRows, setSelectedEnterpriseRows] = useState<
    IEnterprisesTypes[]
  >([]);
  const [selectedJobTitlesRows, setSelectedJobTitlesRows] = useState<
    IJobTitle[]
  >([]);

  return (
    <div>
      <Tabs defaultValue="tenancy" className="w-full">
        <TabsList className="grid w-1/2  grid-cols-3 mb-1">
          <TabsTrigger value="tenancy" onClick={() => setTabName("Tenancy")}>
            Tenancy
          </TabsTrigger>
          <TabsTrigger
            value="enterprise"
            onClick={() => setTabName("Enterprise")}
          >
            Enterprise Setup
          </TabsTrigger>
          <TabsTrigger
            value="job_titles"
            onClick={() => setTabName("Job Titles")}
          >
            Job Titles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tenancy">
          <TenancyDataTable
            tabName={tabName}
            action={action}
            setAction={setAction}
            selectedTenancyRows={selectedTenancyRows}
            setSelectedTenancyRows={setSelectedTenancyRows}
            tenancyLimit={tenancyLimit}
            setTenancyLimit={setTenancyLimit}
          />
        </TabsContent>

        <TabsContent value="enterprise">
          <EnterpriseDataTable
            tabName={tabName}
            action={action}
            setAction={setAction}
            selectedEnterpriseRows={selectedEnterpriseRows}
            setSelectedEnterpriseRows={setSelectedEnterpriseRows}
            enterpriseLimit={enterpriseLimit}
            setEnterpriseLimit={setEnterpriseLimit}
          />
        </TabsContent>
        <TabsContent value="job_titles">
          <JobTitlesDataTable
            tabName={tabName}
            action={action}
            setAction={setAction}
            selectedJobTitlesRows={selectedJobTitlesRows}
            setSelectedJobTitlesRows={setSelectedJobTitlesRows}
            jobTitlesLimit={jobTitlesLimit}
            setJobTitlesLimit={setJobTitlesLimit}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageTenancyandEnterpriseSetup;
