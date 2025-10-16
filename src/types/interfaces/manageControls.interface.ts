export interface IControlsTypes {
  // control_id: number;
  control_name: string;
  description: string;
  pending_results_count: number;
  control_type: string;
  priority: number;
  datasources: string;
  control_last_run: string;
  control_last_updated: string;
  status: string;
  state: string;
  result_investigator: string;
  authorized_data: string;
  // revision: number;
  // revision_date: String;
  // created_by: String;
  // created_date: String;
}
export interface IControlsGetTypes {
  items: IControlsTypes[];
  page: number;
  pages: number;
  total: number;
}
