import { loadData } from "@/Utility/funtion";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function InvitationRedirectPage() {
  const [isLoading, setIsLoading] = useState(false);
  const nodeUrl = import.meta.env.VITE_NODE_ENDPOINT_URL;
  const [isValid, setIsValid] = useState(false);
  const [response, setResponse] = useState("");

  const { user_invitation_id, token } = useParams();

  // const urlParams = new URLSearchParams(window.location.search);
  // const token = urlParams.get("token");

  useEffect(() => {
    if (!token) return;
    (async () => {
      const postParams = {
        baseURL: nodeUrl,
        url: `/invitation/verify?user_invitation_id=${user_invitation_id}&token=${token}`,
        setLoading: setIsLoading,
        accessToken: token,
      };

      const res = await loadData(postParams);
      console.log(res, "res");
      if (res) {
        setIsValid(res.valid);
        setResponse(res.message);
      }
    })();
  }, [nodeUrl, token, user_invitation_id]);

  useEffect(() => {
    if (token && isValid) {
      // Store token in localStorage or pass to backend
      console.log("Invitation token:", token);

      // Deep link schema for mobile app
      const appLink = `PROCG://invitation?user_invitation_id=${user_invitation_id}&token=${token}`;

      // Try opening mobile app
      window.location.href = appLink;

      // Fallback: after 1s redirect to store
      setTimeout(() => {
        if (/android/i.test(navigator.userAgent)) {
          window.location.href =
            "https://play.google.com/store/apps/details?id=gov.bbg.voa";
        } else if (/iphone|ipad/i.test(navigator.userAgent)) {
          window.location.href = "https://apps.apple.com/app/myapp/id123456789";
        }
      }, 1000);
    }
  }, [isValid, token, user_invitation_id]);

  return (
    <div className="flex justify-center items-center h-screen">
      {isLoading ? (
        "Loading..."
      ) : (
        <div>
          <div>
            {isValid ? (
              <div>
                <p>Invitation is valid</p>
                <p>Redirecting to app...</p>
              </div>
            ) : (
              <div>
                <p>Invitation is invalid</p>
                <p>{response}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default InvitationRedirectPage;
