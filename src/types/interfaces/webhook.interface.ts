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
