interface TechnicalDetails {
  path: string;
  method: "POST" | "PUT" | "DELETE" | "GET" | "PATCH";
}

export interface IEvent {
  event_id: number;
  tenant_id: number;
  api_endpoint_id: number;
  entity_name: string;
  action_type: "CREATE" | "UPDATE" | "DELETE";
  description: string;
  created_by: number;
  creation_date: string;
  last_updated_by: number;
  last_update_date: string;
  technical_details: TechnicalDetails;
}

export interface IWebhook {
  webhook_id: number;
  tenant_id: number;
  webhook_name: string;
  webhook_url: string;
  is_active: "Y" | "N"; // since it's Char(1)
  failure_count: number;
  max_retries: number;
  events: IEvent[];
  created_by: number;
  creation_date: Date;
  last_updated_by?: number | null;
  last_update_date?: Date | null;
}

export interface IWebhookDeliveryLog {
  delivery_id: number;
  webhook_id: number;
  tenant_id: number;
  event_id: number;
  webhook_name: string;
  event_name: string;
  payload: any;
  attempt_number: number;
  delivery_status: string;
  http_status?: number;
  response_body?: string;
  // error_message?: string;
  duration_ms?: number;
  next_retry_date?: Date;
  creation_date: Date;
}
