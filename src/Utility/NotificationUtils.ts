import { Users } from "@/types/interfaces/users.interface";

export const renderUserName = (id: number, users: Users[]) => {
  const user = users.find((usr) => usr.user_id === id);

  return user?.user_name;
};

export const renderSlicedUsername = (
  id: number,
  users: Users[],
  limit: number
) => {
  const user = users.find((usr) => usr.user_id === id);

  if (user) {
    const userName = user?.user_name;
    if (userName.length > 0) {
      return userName.slice(0, limit);
    }
  }
};

export const renderProfilePicture = (id: number, users: Users[]) => {
  const user = users.find((usr) => usr.user_id === id);

  return user?.profile_picture.thumbnail;
};
