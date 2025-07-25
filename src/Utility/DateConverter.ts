export const convertDate = (isoDateString: Date) => {
  const date = new Date(isoDateString);
  const formattedDate = date.toLocaleString();
  return formattedDate;
};
