import { useEffect } from "react";

function InvitationPage() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
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
            "https://play.google.com/store/apps/details?id=com.elearning.voa";
        } else if (/iphone|ipad/i.test(navigator.userAgent)) {
          window.location.href = "https://apps.apple.com/app/myapp/id123456789";
        }
      }, 1000);
    }
  }, []);

  return <div>Redirecting to app...</div>;
}

export default InvitationPage;
