import { IRole } from "./users.interface";

export interface IAPIEndpoint {
  api_endpoint_id: number;
  api_endpoint: string;
  parameter1?: string;
  parameter2?: string;
  method: string;
  privilege_id: number;
  created_by: number;
  creation_date: Date;
  last_updated_by: number;
  last_update_date: Date;
}

export interface IAPIEndpointRole {
  api_endpoint_id: number;
  api_endpoint: string;
  method: string;
  assigned_role_count: number;
  assigned_roles: IRole[];
  created_by: number;
  creation_date: Date;
  last_updated_by: number;
  last_update_date: Date;
}
