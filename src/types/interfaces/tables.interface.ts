export interface ISchema {
  schema: string;
  tables: string[];
}

export interface IColumns {
  default: string;
  name: string;
  nullable: boolean;
  primary_key: boolean;
  type: string;
}
