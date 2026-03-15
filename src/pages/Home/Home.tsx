import { useEffect } from "react";
import { loadData } from "@/Utility/funtion";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { useState } from "react";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import Spinner from "@/components/Spinner/Spinner";
import { Link } from "react-router-dom";

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

const StatCard = ({
  title,
  value,
  color = "blue",
}: {
  title: string;
  value: number | string | undefined;
  color?: string;
}) => (
  <div className={`bg-${color}-50 border border-${color}-200 rounded-lg p-4`}>
    <h4 className="text-sm font-medium text-gray-600">{title}</h4>
    <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
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

  useEffect(() => {
    (async () => {
      const alertDataParams = {
        baseURL: FLASK_URL,
        url: `${flaskApi.Home}`,
        setLoading: setIsLoading,
        accessToken: token?.access_token || "",
      };
      console.log(alertDataParams, "alertDataParams");
      const res = await loadData(alertDataParams);
      setData(res);
      console.log(res, "Dashboard data");
    })();
  }, [token?.access_token]);

  if (isLoading) {
    return (
      <div className="h-[65vh] flex items-center justify-center">
        <Spinner size="80" color="red" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Overview of your system metrics and activities
        </p>
      </div> */}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Async Tasks"
          value={data.async_tasks.total}
          color="blue"
        />
        <StatCard
          title="Active Tasks"
          value={data.async_tasks.active}
          color="green"
        />
        <StatCard
          title="Total Scheduled Tasks"
          value={data.scheduled_tasks.total}
          color="purple"
        />
        <StatCard title="Total Users" value={data.users.total} color="orange" />
      </div>
      {/* Other Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Async Tasks Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Async Tasks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            <StatCard
              title="Total"
              value={data.async_tasks.total}
              color="blue"
            />
            <StatCard
              title="Active"
              value={data.async_tasks.active}
              color="green"
            />
            <StatCard
              title="Cancelled"
              value={data.async_tasks.cancelled}
              color="red"
            />
            <StatCard title="SRS" value={data.async_tasks.srs} color="indigo" />
            <StatCard title="SF" value={data.async_tasks.sf} color="indigo" />
          </div>
          <ItemsTable
            items={data.async_tasks.items || []}
            title="Recent Async Tasks"
            url="/asynchronous-request-manager/development/register-edit-asynchronous-tasks"
          />
        </div>

        {/* Scheduled Tasks Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Scheduled Tasks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total"
              value={data.scheduled_tasks.total}
              color="purple"
            />
            <StatCard
              title="Scheduled"
              value={data.scheduled_tasks.scheduled}
              color="blue"
            />
            <StatCard
              title="Cancelled"
              value={data.scheduled_tasks.cancelled}
              color="red"
            />
          </div>
          <ItemsTable
            items={data.scheduled_tasks.items || []}
            title="Recent Scheduled Tasks"
            url="/asynchronous-requests-and-task-schedules/view-edit-scheduled-tasks"
          />
        </div>

        {/* Executors */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Executors
          </h2>
          <div className="mb-4">
            <StatCard
              title="Total Executors"
              value={data.executors.total}
              color="teal"
            />
          </div>
          <ItemsTable
            items={data.executors.items || []}
            title="Available Executors"
            url="/asynchronous-request-manager/development/manage-execution-methods"
          />
        </div>

        {/* Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Users</h2>
          <div className="mb-4">
            <StatCard
              title="Total Users"
              value={data.users.total}
              color="orange"
            />
          </div>
          <ItemsTable
            items={data.users.items || []}
            title="Recent Users"
            url="/tools/security-console/manage-users"
          />
        </div>

        {/* Tenants */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Tenants</h2>
          <div className="mb-4">
            <StatCard
              title="Total Tenants"
              value={data.tenants.total}
              color="pink"
            />
          </div>
          <ItemsTable
            items={data.tenants.items || []}
            title="Recent Tenants"
            url="/tools/manage-tenancy-and-enterprise-setup"
          />
        </div>

        {/* Enterprises */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Enterprises
          </h2>
          <div className="mb-4">
            <StatCard
              title="Total Enterprises"
              value={data.enterprises.total}
              color="yellow"
            />
          </div>
          <ItemsTable
            items={data.enterprises.items || []}
            title="Recent Enterprises"
            url="/tools/manage-tenancy-and-enterprise-setup"
          />
        </div>
      </div>

      {/* Workflows Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Workflows</h2>
        <div className="mb-4">
          <StatCard
            title="Total Workflows"
            value={data.workflows.total}
            color="cyan"
          />
        </div>
        <ItemsTable
          items={data.workflows.items || []}
          title="Recent Workflows"
          url="/tools/enterprise-process-modeler/orchestration-studio"
        />
      </div>
    </div>
  );
};

export default Home;
