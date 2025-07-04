export interface IDataSourceTypes {
  def_data_source_id: number;
  datasource_name: string;
  description: string;
  application_type: string;
  application_type_version: string;
  last_access_synchronization_date: string;
  last_access_synchronization_status: string;
  last_transaction_synchronization_date: string;
  last_transaction_synchronization_status: string;
  default_datasource: string;
  created_by?: number;
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
