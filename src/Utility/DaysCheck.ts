const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days > 0) {
    return `Added ${days} day${days > 1 ? "s" : ""} ago`;
  }

  if (hours > 0) {
    return `Added ${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  return `Added ${Math.max(1, minutes)} minute${minutes !== 1 ? "s" : ""} ago`;
};

export const getDaysAgo = (dateString: string): string => {
  const createdDate = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - createdDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    const time = getTimeAgo(dateString);
    return time;
  }
  return `Added ${diffInDays} days ago`;
};
