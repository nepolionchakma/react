import { useEffect, useCallback } from "react";
import { loadData } from "@/Utility/funtion";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { useState } from "react";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import Spinner from "@/components/Spinner/Spinner";
import { Link } from "react-router-dom";
import { RefreshCcw } from "lucide-react";

interface DashboardItem {
  id: string;
  name: string;
  creation_date: string | null;
}

interface DashboardSection {
  total?: number;
  active?: number;
  cancelled?: number;
  scheduled?: number;
  srs?: number;
  sf?: number;
  items?: DashboardItem[];
}

interface DashboardData {
  async_tasks: DashboardSection;
  scheduled_tasks: DashboardSection;
  executors: DashboardSection;
  users: DashboardSection;
  tenants: DashboardSection;
  enterprises: DashboardSection;
  workflows: DashboardSection;
}
const switchFunc = (title: string) => {
  switch (title.toLocaleLowerCase()) {
    case "total":
      return "blue";
    case "active":
      return "green";
    case "scheduled":
      return "green";
    case "cancelled":
      return "red";
    case "srs":
      return "gray";
    case "sf":
      return "gray";
    case "active tasks":
      return "green";
    case "total scheduled tasks":
      return "orange";
    case "total users":
      return "gray";
    case "total async tasks":
      return "gray";
    default:
      return "black";
  }
};

const StatCard = ({
  title,
  value,
}: {
  title: string;
  value: number | string | undefined;
}) => (
  <div
    className={`bg-${switchFunc(title)}-50 border border-${switchFunc(title)}-200 rounded-lg p-4`}
  >
    <h4 className="text-sm font-medium text-gray-600">{title}</h4>
    <p className={`text-2xl font-bold text-${switchFunc(title)}-600`}>
      {value}
    </p>
  </div>
);

const ItemsTable = ({
  items,
  title,
  url,
}: {
  items: DashboardItem[];
  title: string;
  url?: string;
}) => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between">
      <h3 className="font-semibold text-gray-800">{title}</h3>
      {url && (
        <Link to={url} className="text-blue-600 hover:underline">
          View All
        </Link>
      )}
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items?.slice(0, 5).map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-sm text-gray-900">{item.id}</td>
              <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
              <td className="px-4 py-2 text-sm text-gray-500">
                {item.creation_date
                  ? new Date(item.creation_date).toLocaleDateString()
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {items?.length > 5 && (
        <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600 text-center">
          ... and {items.length - 5} more items
        </div>
      )}
    </div>
  </div>
);

const Home = () => {
  const { token } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshData, setIsRefreshData] = useState(false);
  console.log("Home");
  const fetchDashboardData = useCallback(
    async (isManualRefresh: boolean = false) => {
      const alertDataParams = {
        baseURL: FLASK_URL,
        url: `${flaskApi.Home}`,
        setLoading: isManualRefresh ? setIsRefreshData : setIsLoading,
        accessToken: token?.access_token || "",
      };

      const res = await loadData(alertDataParams);
      setData(res);
      setLastUpdated(new Date());
    },
    [token?.access_token],
  );

  useEffect(() => {
    fetchDashboardData(false);

    // Auto-refresh every 30 seconds
    // const interval = setInterval(fetchDashboardData, 30000);

    // return () => clearInterval(interval);
  }, [token?.access_token, fetchDashboardData]);

  const handleManualRefresh = () => {
    fetchDashboardData(true);
  };

  if (isLoading) {
    return (
      <div className="h-[65vh] flex items-center justify-center">
        <Spinner size="80" color="red" />
      </div>
    );
  }

  // if (isRefreshData) {
  //   return (
  //     <div className="h-[65vh] flex items-center justify-center z-50 bg-transparent">
  //       <Spinner size="80" color="red" />
  //     </div>
  //   );
  // }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">
              Overview of your system metrics and activities
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              {lastUpdated && (
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              )}
            </div>
            <button
              onClick={handleManualRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <RefreshCcw
                size={15}
                className={isRefreshData ? "animate-spin" : ""}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Async Tasks" value={data.async_tasks.total} />
        <StatCard title="Active Tasks" value={data.async_tasks.active} />
        <StatCard
          title="Total Scheduled Tasks"
          value={data.scheduled_tasks.total}
        />
        <StatCard title="Total Users" value={data.users.total} />
      </div>

      {/* Dynamic Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {Object.keys(data).map((sectionKey, index, arr) => {
          const section = data[sectionKey as keyof DashboardData];
          const sectionTitle = sectionKey
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
          const isLast = index === arr.length - 1;

          // Define URLs for different sections
          const sectionUrls: { [key: string]: string } = {
            async_tasks:
              "/asynchronous-request-manager/development/register-edit-asynchronous-tasks",
            scheduled_tasks:
              "/asynchronous-requests-and-task-schedules/view-edit-scheduled-tasks",
            executors:
              "/asynchronous-request-manager/development/manage-execution-methods",
            users: "/tools/security-console/manage-users",
            tenants: "/tools/manage-tenancy-and-enterprise-setup",
            enterprises: "/tools/manage-tenancy-and-enterprise-setup",
            workflows: "/tools/enterprise-process-modeler/orchestration-studio",
          };

          // Define colors for different sections
          // const sectionColors: { [key: string]: string } = {
          //   async_tasks: "blue",
          //   scheduled_tasks: "purple",
          //   executors: "teal",
          //   users: "orange",
          //   tenants: "pink",
          //   enterprises: "yellow",
          //   workflows: "cyan",
          // };

          return (
            <div
              key={sectionKey}
              className={`${
                isLast ? "md:col-span-2" : " "
              } bg-white rounded-lg shadow-sm border border-gray-200 p-6`}
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {sectionTitle}
              </h2>

              {/* Stat Cards for this section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
                {Object.keys(section).map((statKey) => {
                  if (statKey === "items") return null;
                  const value =
                    section[statKey as keyof Omit<DashboardSection, "items">];
                  if (typeof value === "number") {
                    return (
                      <StatCard
                        key={statKey}
                        title={
                          statKey.charAt(0).toUpperCase() + statKey.slice(1)
                        }
                        value={value}
                        // color={sectionColors[sectionKey] || "blue"}
                      />
                    );
                  }
                  return null;
                })}
              </div>

              {/* Items Table for this section */}
              {section.items && section.items.length > 0 && (
                <ItemsTable
                  items={section.items}
                  title={`Recent ${sectionTitle}`}
                  url={sectionUrls[sectionKey]}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
