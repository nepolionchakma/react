import { loadData } from "@/Utility/funtion";
import { useEffect, useState } from "react";

function InvitationRedirectPage() {
  const [isLoading, setIsLoading] = useState(false);
  const nodeUrl = import.meta.env.VITE_NODE_ENDPOINT_URL;
  const [isValid, setIsValid] = useState(false);
  const [response, setResponse] = useState("");

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  useEffect(() => {
    if (!token) return;
    (async () => {
      const postParams = {
        baseURL: nodeUrl,
        url: `/invitation/verify?token=${token}`,
        setLoading: setIsLoading,
      };

      const res = await loadData(postParams);
      console.log(res, "res");
      if (res) {
        setIsValid(res.valid);
        setResponse(res.message);
      }
    })();
  }, [nodeUrl, token]);

  useEffect(() => {
    if (token && isValid) {
      // Store token in localStorage or pass to backend
      console.log("Invitation token:", token);

      // Deep link schema for mobile app
      const appLink = `PROCG://invitation?token=${token}`;

      // Try opening mobile app
      window.location.href = appLink;

      // Fallback: after 1s redirect to store
      setTimeout(() => {
        if (/android/i.test(navigator.userAgent)) {
          window.location.href =
            "https://play.google.com/store/apps/details?id=com.procg";
        } else if (/iphone|ipad/i.test(navigator.userAgent)) {
          window.location.href = "https://apps.apple.com/app/myapp/id123456789";
        }
      }, 1000);
    }
  }, [isValid, token]);

  return (
    <div className="flex justify-center items-center h-screen">
      {isLoading ? (
        "Loading..."
      ) : (
        <>{isValid ? "Redirecting to app" : `${response}`}</>
      )}
    </div>
  );
}

export default InvitationRedirectPage;
