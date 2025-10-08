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
  user_type?: string;
  email_addresses: string;
  created_by?: number;
  created_on?: string;
  last_updated_by?: number;
  last_updated_on?: string;
  tenant_id?: number;
  profile_picture: ProfilePicture;
}

export interface IPersonsTypes {
  user_id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  job_title: string;
}
export interface IUsersInfoTypes extends Users, IPersonsTypes {}
export interface IUpdateUserTypes {
  user_name: string;
  email_addresses: string[];
  first_name: string;
  middle_name: string | undefined;
  last_name: string;
  job_title: string;
  password?: string;
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
  notification_id: string;
  notification_type: string;
  sender: number;
  recipients: number[];
  subject: string;
  notification_body: string;
  creation_date: Date;
  status: string;
  parent_notification_id: string;
  involved_users: number[];
  readers: number[];
  holders: number[];
  recycle_bin: number[];
  action_item_id?: number | null;
  alert_id?: number | null;
}
export interface IAddUserTypes {
  user_type: string;
  user_name: string;
  email_addresses: string[];
  created_by: number | undefined;
  last_updated_by: number | undefined;
  tenant_id: number;
  first_name: string;
  middle_name: string | undefined;
  last_name: string;
  job_title: string;
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
}

export interface IGetResponeUsersInfoTypes {
  items: IUsersInfoTypes[];
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
}

export interface IProfilesType {
  primary_yn: string;
  profile_id: string;
  profile_type: string;
  serial_number: number;
  user_id: number;
}
