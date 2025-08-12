export interface Alerts {
  alert_id: number;
  user_id: number;
  alert_name: string;
  description: string;
  last_update_by: number;
  last_update_date: Date;
  acknowledge: boolean;
}
