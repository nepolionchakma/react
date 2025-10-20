import { ITenantsTypes } from "@/types/interfaces/users.interface";

export const toTitleCase = (str: string) => {
  return str
    .toLowerCase() // first make everything lowercase
    .replace(/\b\w/g, (char) => char.toUpperCase()); // capitalize first letter of each word
};

export const renderTenantsNames = (id: number, tenants: ITenantsTypes[]) => {
  const tenant = tenants.find((item) => item.tenant_id === id);

  return tenant?.tenant_name;
};
