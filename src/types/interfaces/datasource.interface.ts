export interface IDataSourceTypes {
  def_data_source_id: number;
  datasource_name: string;
  description: string;
  application_type: string;
  application_type_version: string;
  last_access_synchronization_date: Date;
  last_access_synchronization_status: string;
  last_transaction_synchronization_date: Date;
  last_transaction_synchronization_status: string;
  default_datasource: string;
  created_by?: number;
  creation_date: string;
  last_updated_by: number;
  last_update_date: string;
}
export interface IManageAccessEntitlementsPerPageTypes {
  results: IDataSourceTypes[];
  totalPages: number;
  currentPage: number;
}

export interface IDataSourcePostTypes {
  def_data_source_id?: number;
  datasource_name: string;
  description: string;
  application_type: string;
  application_type_version: string;
  last_access_synchronization_status: string;
  last_access_synchronization_date: string;
  last_transaction_synchronization_status: string;
  last_transaction_synchronization_date: string;
  default_datasource: string;
  created_by: number;
  created_on?: Date;
  last_updated_by: number;
  last_updated_on?: Date;
}

export interface IDataSourceConnectorProperties {
  def_connection_id: number;
  def_data_source_id: number;
  connection_type: string;
  database_name?: string;
  host: string;
  port?: number;
  username?: string;
  password?: string;
  is_active: boolean;
  additional_params?: Record<string, string | number | boolean>;
  created_by: number;
  creation_date: Date;
  last_updated_by: number;
  last_update_date: Date;
}

export interface IApplicationType {
  def_application_type_id: number;
  application_type: string;
  description: string;
  versions: string[];
  created_by: number;
  creation_date: Date;
  last_updated_by: number;
  last_update_date: Date;
}
