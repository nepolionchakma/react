export interface Alerts {
  user_id: number;
  user_name: string;
  notification_id: string;
  alert_id: number;
  alert_name: string;
  description: string;
  acknowledge: boolean;
  notification_status: string;
  created_by: number;
  creation_date: Date;
  last_update_by: number;
  last_update_date: Date;
}

export type AlertPayload = {
  alert: Alerts;
  isAcknowledge: boolean;
};
