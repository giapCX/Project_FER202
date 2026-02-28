import { useAppContext } from "../provider/AppProvider";

export const useAuth = () => {
  const { user, login, logout } = useAppContext();
  const isLoggedIn = !!user;
  const isManager = user?.roleId && user.roleId !== 1;

  return { user, login, logout, isLoggedIn, isManager };
};