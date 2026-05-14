export const convertDate = (isoDateString: Date | undefined) => {
  if (!isoDateString) return;
  const date = new Date(isoDateString);
  const formattedDate = date.toLocaleString();
  return formattedDate;
};
