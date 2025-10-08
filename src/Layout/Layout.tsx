import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import MainApp from "./MainApp";
import { Navigate, useLocation } from "react-router-dom";
import Spinner from "@/components/Spinner/Spinner";
import { useEffect } from "react";
import { useSocketContext } from "@/Context/SocketContext/SocketContext";

const Layout = () => {
  const { token, isUserLoading, presentDevice } = useGlobalContext();
  const location = useLocation();
  const { addDevice } = useSocketContext();

  useEffect(() => {
    const hasDevice = localStorage.getItem("presentDevice");

    if (presentDevice.id !== 0 && hasDevice === "true") {
      addDevice(presentDevice.id);

      localStorage.removeItem("presentDevice");
    }
  }, [addDevice, presentDevice]);

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
    token.isLoggedIn === false
  ) {
    return <Navigate state={location.pathname} to="/login" replace />;
  }

  return <MainApp />;
};

export default Layout;
