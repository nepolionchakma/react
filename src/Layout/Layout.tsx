import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import MainApp from "./MainApp";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Spinner from "@/components/Spinner/Spinner";
import { useEffect } from "react";
import { api } from "@/Api/Api";

const Layout = () => {
  const { token, isUserLoading } = useGlobalContext();
  const location = useLocation();
  const navigate = useNavigate();
  const { presentDevice } = useGlobalContext();

  useEffect(() => {
    if (presentDevice.is_active === 0) {
      const logout = async () => {
        await api.get(`/logout`);
        navigate("/login");
      };
      logout();
    }
  }, [presentDevice.id, presentDevice.is_active, navigate]);

  if (isUserLoading) {
    return (
      <div className="flex flex-row min-h-screen justify-center items-center">
        <Spinner size="100" color="red"></Spinner>
      </div>
    );
  }

  if (
    token?.user_id === 0 &&
    token.access_token === "" &&
    token.isLoggedIn === false &&
    token.issuedAt === ""
  ) {
    return <Navigate state={location.pathname} to="/login" replace />;
  }

  return <MainApp />;
};

export default Layout;
