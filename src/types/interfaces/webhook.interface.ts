export interface IWebhook {
  webhook_id: number;
  tenant_id: number;
  webhook_name: string;
  webhook_url: string;
  table_name: string;
  http_methods: string[]; // JSON -> array of strings (e.g. ["POST"])
  selected_columns?: string[] | null;
  secret_key?: string;
  extra_headers?: Record<string, any> | null;
  filters?: Record<string, any> | null;
  is_active: "Y" | "N"; // since it's Char(1)
  failure_count: number;
  max_retries: number;
  created_by: number;
  creation_date: Date;
  last_updated_by?: number | null;
  last_update_date?: Date | null;
}

export interface IWebhookDeliveryLog {
  delivery_id: number;
  webhook_id: number;
  tenant_id: number;
  table_name: string;
  event_name: string;
  trigger_method: string;
  payload: any;
  attempt_number: number;
  delivery_status: string;
  http_status_code?: number;
  response_body?: string;
  error_message?: string;
  duration_ms?: number;
  next_retry_date?: Date;
  creation_date: Date;
}
