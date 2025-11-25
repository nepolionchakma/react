export interface ProfilePicture {
  original: string;
  thumbnail: string;
}

export interface Token {
  isLoggedIn: boolean;
  access_token: string;
  refresh_token: string;
  user_id: number;
}

export interface Users {
  user_id: number;
  user_name: string;
  user_type: string;
  email_address: string;
  date_of_birth?: string;
  created_by?: number;
  created_on?: string;
  last_updated_by?: number;
  last_updated_on?: string;
  tenant_id?: number;
  profile_picture: ProfilePicture;
  user_invitation_id?: number;
}

export interface IPersonsTypes {
  user_id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  job_title_id: number;
}
export interface IUsersInfoTypes extends Users, IPersonsTypes {}
export interface IUpdateUserTypes {
  user_name: string;
  email_address: string;
  first_name: string;
  middle_name: string | undefined;
  last_name: string;
  job_title_id: number;
  password?: string;
  date_of_birth?: string;
}
export interface ICombinedUser extends Users {
  person: IPersonsTypes;
}

export interface UserModel {
  name: string;
  profile_picture: string;
}

export interface Message {
  id: string;
  sender: UserModel;
  recivers: UserModel[];
  subject: string;
  body: string;
  date: Date;
  status: string;
  parentid: string;
  involvedusers: string[];
  readers?: string[];
  holders?: string[];
  recyclebin?: string[];
}

export interface Notification {
  user_id: number;
  notification_id: string;
  notification_type: string;
  subject?: string;
  notification_body?: string;
  status: string;
  parent_notification_id: string;
  involved_users: number[];
  action_item_id?: number;
  alert_id?: number;
  sender: number;
  recipients: number[];
  recipient: boolean;
  reader: boolean;
  holder: boolean;
  recycle_bin: boolean;
  created_by?: number;
  creation_date: Date;
  last_updated_by?: number;
  last_update_date: Date;
}

export type NotificationType = "Drafts" | "Sent" | "Inbox" | "Recycle";
export type DraftNotificationType = "New" | "Old";
export type SentNotificationType = "Sent" | "Draft";

export type MessagePayload = {
  notification: Notification;
  type: NotificationType;
};
export type DraftPayload = {
  notification: Notification;
  type: DraftNotificationType;
};
export type SentPayload = {
  notification: Notification;
  type: SentNotificationType;
};

export interface IAddUserTypes {
  user_type: string;
  user_name: string;
  email_address: string;
  created_by: number | undefined;
  last_updated_by: number | undefined;
  tenant_id: number;
  first_name: string;
  middle_name: string | undefined;
  last_name: string;
  job_title_id: number;
  password: string;
}
export interface ITenantsTypes {
  tenant_id: number;
  tenant_name: string;
}
export interface IEnterprisesTypes {
  tenant_id: number;
  tenant_name: string;
  enterprise_name: string;
  enterprise_type: string;
  user_invitation_validity: string;
  created_by?: number;
  creation_date: Date;
  last_updated_by?: number;
  last_update_date: Date;
}

export interface IGetResponeUsersInfoTypes {
  result: IUsersInfoTypes[];
  total: number;
  page: number;
  pages: number;
}

export interface IUserPasswordResetTypes {
  user_id: number;
  old_password: string;
  new_password: string;
}

export interface SessionLog {
  session_id: string;
  connect_time?: Date;
  disconnect_time?: Date;
}

export interface audit {
  signon_id: string;
  login?: Date;
  logout?: Date;
  session_log?: SessionLog[];
}

export interface IUserLinkedDevices {
  id: number;
  user_id?: number;
  os: string;
  browser_name: string;
  device_type: string;
  browser_version: string;
  user_agent: string;
  is_active: number;
  added_at?: string;
  user?: string;
  ip_address?: string;
  location?: string;
  signon_audit?: audit[];
  signon_id: string;
  is_online: boolean;
}

export interface IProfilesType {
  primary_yn: string;
  profile_id: string;
  profile_type: string;
  serial_number: number;
  user_id: number;
}

export interface IJobTitle {
  job_title_id: number;
  job_title_name: string;
  tenant_id: number;
  created_by?: number;
  created_on?: Date;
  last_updated_by?: number;
  last_updated_on?: Date;
}

export interface IRole {
  role_id: number;
  role_name: string;
}

export interface IPrivilege {
  privilege_id: number;
  privilege_name: string;
}

export interface IPrivilegeAndRole {
  user_id: number;
  user_name: string;
  tenant_id: number;
  granted_roles: IRole[];
  granted_privileges: IPrivilege[];
}
