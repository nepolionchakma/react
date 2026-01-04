import { useState } from "react";
import DataSources from "./DataSources/DataSources";

const ManageDataSource = () => {
  const [dataSourceLimit, setDataSourceLimit] = useState<number>(2);

  return (
    <>
      <DataSources
        dataSourceLimit={dataSourceLimit}
        setDataSourceLimit={setDataSourceLimit}
      />
    </>
  );
};

export default ManageDataSource;
