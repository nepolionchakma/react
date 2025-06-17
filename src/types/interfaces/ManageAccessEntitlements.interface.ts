import { IDataSourcePostTypes } from "./datasource.interface";

export interface IManageAccessEntitlementsTypes {
  def_entitlement_id: number;
  entitlement_name: string;
  description: string;
  comments: string;
  status: string;
  effective_date: string;
  revison: number;
  revision_date: string;
  created_on: string;
  last_updated_on: string;
  last_updated_by: string;
  created_by: string;
}
export interface IManageAccessEntitlementsPerPageTypes {
  results: IManageAccessEntitlementsTypes[];
  totalPages: number;
  currentPage: number;
}
export interface IFetchAccessPointsElementTypes {
  def_access_point_id: number;
  def_data_source_id: number;
  element_name: string;
  description: string;
  platform: string;
  element_type: string;
  access_control: string;
  change_control: string;
  audit: string;
  created_by: string;
  created_on: string;
  last_updated_by: string;
  last_updated_on: string;
}

export interface IManageEntitlementElementDataDeleteTypes {
  entitlement_id: number;
  res: IFetchAccessPointsElementTypes[] | undefined;
}
export interface IFetchAccessEntitlementElementsTypes {
  entitlement_id: number;
  access_point_id: number;
}
export interface ICreateAccessPointsElementTypes {
  def_access_point_id?: number;
  def_data_source_id: number;
  element_name: string;
  description: string;
  platform: string;
  element_type: string;
  access_control: string;
  change_control: string;
  audit: string;
  created_by: string;
  last_updated_by: string;
  // [key: string]: any;
}
export interface IManageLocalConditonsType {
  id: string;
  instance: string;
  action: string;
  access_point_type: string;
  access_point: string;
  from_access_point_type: string;
  from_access_point: string;
  status: "Active" | "Inactive";
  comments: string;
}
export interface IManageGlobalConditionTypes {
  def_global_condition_id: number;
  name: string;
  datasource: string;
  description: string;
  status: string;
}
export interface IManageGlobalConditionLogicTypes {
  def_global_condition_logic_id: number;
  def_global_condition_id: number;
  object: string;
  attribute: string;
  condition: string;
  value: string;
}
export interface IManageGlobalConditionLogicAttributesTypes {
  id: number;
  def_global_condition_logic_id: number;
  widget_position: number;
  widget_state: number;
}
export interface IManageGlobalConditionLogicExtendTypes
  extends IManageGlobalConditionLogicTypes {
  id: number;
  def_global_condition_logic_id: number;
  widget_position: number;
  widget_state: number;
}
export interface IManageAccessModelsTypes {
  def_access_model_id?: number;
  model_name: string;
  description: string;
  type: string;
  run_status: string;
  state: string;
  created_by: string;
  last_updated_by: string;
  last_run_date?: string;
  datasource_name?: string;
}

export interface IManageAccessModelLogicsTypes {
  def_access_model_logic_id: number;
  def_access_model_id: number;
  filter: string;
  object: string;
  attribute: string;
  condition: string;
  value: string;
}

export interface IManageAccessModelLogicAttributesTypes {
  id: number;
  def_access_model_logic_id: number;
  widget_position: number;
  widget_state: number;
}

export interface IManageAccessModelLogicExtendTypes
  extends IManageAccessModelLogicsTypes {
  id: number;
  def_access_model_logic_id: number;
  widget_position: number;
  widget_state: number;
}
export interface IManageAccessModelSearchFilterTypes {
  match: string;
  created_by: string;
  model_name: string;
  state: string;
  last_run_date: string;
}

export interface IFetchCombinedAccessPointsElementAndDatasourceTypes
  extends IFetchAccessPointsElementTypes {
  dataSource: IDataSourcePostTypes;
}
