import { IJobTitle, ITenantsTypes } from "@/types/interfaces/users.interface";

export const toTitleCase = (str: string) => {
  return str
    .toLowerCase() // first make everything lowercase
    .replace(/\b\w/g, (char) => char.toUpperCase()); // capitalize first letter of each word
};

export const renderTenantsNames = (id: number, tenants: ITenantsTypes[]) => {
  const tenant = tenants.find((item) => item.tenant_id === id);

  return tenant?.tenant_name;
};

export const convertToTitleCase = (str: string) => {
  // convert "profile_type_one" to 'Profile Type One'
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const jobTitleName = (id: number, jobTitles: IJobTitle[]) => {
  if (id) {
    const jobTitle = jobTitles.find((item) => item.job_title_id === id);

    return jobTitle?.job_title_name ?? "";
  }
};

export const tenantNames = (id: number, data: ITenantsTypes[]) => {
  if (id) {
    const name = data.find((item) => item.tenant_id === id);

    return name?.tenant_name ?? "";
  }
};

export const maskEmail = (email: string) => {
  if (!email.includes("@")) return email;

  const [username, domain] = email.split("@");

  // If username is too short, mask everything except first char
  if (username.length <= 4) {
    return (
      username.charAt(0) +
      "*".repeat(Math.max(username.length - 1, 0)) +
      "@" +
      domain
    );
  }

  const start = username.slice(0, 2);
  const end = username.slice(-2);
  const maskedCount = Math.max(username.length - 4, 0);

  return start + "*".repeat(maskedCount) + end + "@" + domain;
};
