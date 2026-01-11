import { useEffect, useState } from "react";
import DataSources from "./DataSources/DataSources";
import DataTables from "./DataTables/DataTables";
import { loadData } from "@/Utility/funtion";
import { FLASK_URL, flaskApi } from "@/Api/Api";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";

interface TableSchema {
  schema: string;
  tables: string[];
}

const ManageDataSource = () => {
  const { token } = useGlobalContext();
  const [dataSourceName, setDataSourceName] = useState("");
  const [dataSourceLimit, setDataSourceLimit] = useState<number>(2);
  const [dataTableLimit, setDataTableLimit] = useState<number>(8);
  const [tableSchema, setTableSchema] = useState<TableSchema[]>([]);
  const [schemas, setSchemas] = useState<string[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<string>("");
  const [isSchemaLoaded, setIsSchemaLoaded] = useState(false);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [isSchemaLoading, setIsSchemaLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const response = await loadData({
        baseURL: FLASK_URL,
        url: `${flaskApi.DataSourceMetadata}?datasource_name=${dataSourceName}`,
        accessToken: token.access_token,
        setLoading: setIsSchemaLoading,
      });
      // console.log(response);
      if (response) {
        setTableSchema(response.result);
        const schemas = response.result.map((item: any) => item.schema);
        setSchemas(schemas);
        setIsSchemaLoaded(true);
      }
    };
    fetchData();
  }, [dataSourceName, token.access_token]);

  useEffect(() => {
    if (tableSchema) {
      const tablles = tableSchema.find(
        (item) => item.schema === selectedSchema
      )?.tables;
      setTables(tablles as string[]);
    }
  }, [selectedSchema, tableSchema]);

  return (
    <>
      <div className="flex flex-col gap-6">
        <DataSources
          dataSourceLimit={dataSourceLimit}
          setDataSourceLimit={setDataSourceLimit}
          setDataSourceName={setDataSourceName}
        />

        <DataTables
          dataSourceName={dataSourceName}
          dataTableLimit={dataTableLimit}
          setDataTableLimit={setDataTableLimit}
          selectedSchema={selectedSchema}
          selectedTable={selectedTable}
          schemas={schemas}
          tables={tables}
          setSelectedSchema={setSelectedSchema}
          setSelectedTable={setSelectedTable}
          isSchemaLoaded={isSchemaLoaded}
          isSchemaLoading={isSchemaLoading}
        />
      </div>
    </>
  );
};

export default ManageDataSource;
