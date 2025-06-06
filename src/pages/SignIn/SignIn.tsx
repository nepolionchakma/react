import SignInForm from "./SigninForm";
import logo from "../../Image/logo-2.png";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Navigate } from "react-router-dom";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import Spinner from "@/components/Spinner/Spinner";
// import google from "/social-icon/google.svg";
// import github from "/social-icon/github.svg";

const SignIn = () => {
  const { token, isUserLoading } = useGlobalContext();
  const [isWrongCredential, setIsWrongCredential] = useState(false);

  if (isUserLoading) {
    return (
      <div className="flex flex-row min-h-screen justify-center items-center">
        <Spinner size="100" color="red"></Spinner>
      </div>
    );
  }

  if (token?.user_id !== 0) {
    return <Navigate state={location.pathname} to="/" replace />;
  }
  return (
    <>
      <div className="w-[100vw] h-[100vh] flex justify-center items-center font-openSans">
        <div className="w-[496px]">
          <img src={logo} alt="logo" className="h-8 w-auto mb-2" />
          <h2 className="text-xl font-semibold  mb-2">
            Welcome to PROCG-POC Project
          </h2>
          <SignInForm setIsWrongCredential={setIsWrongCredential} />
          <div className="flex justify-between items-center mt-4">
            <div className="bg-slate-300 h-[2px] w-[198px]"></div>
            <p className="text-slate-400 ">OR</p>
            <div className="bg-slate-300 h-[2px] w-[198px]"></div>
          </div>
          <button className="w-full py-2 rounded-md bg-dark-400 hover:bg-dark-400/90 text-white mt-4 ">
            Continue with SSO
          </button>
          {isWrongCredential ? (
            <Alert variant="destructive" className="mt-4 bg-slate-100">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Unable to login</AlertTitle>
              <AlertDescription>
                Invalid credentials, Please try again.
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default SignIn;
