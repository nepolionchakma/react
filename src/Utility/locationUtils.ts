export const getGeoPermissionState = async (): Promise<PermissionState> => {
  if (!navigator.permissions) {
    console.warn("Permissions API not supported.");
    return "prompt";
  }

  try {
    const status = await navigator.permissions.query({ name: "geolocation" });
    return status.state; // "granted", "denied", or "prompt"
  } catch (error) {
    console.error("Error checking geolocation permission:", error);
    return "prompt";
  }
};

export const getUserLocation = async (): Promise<string> => {
  if (!("geolocation" in navigator)) {
    console.error("Geolocation not supported.");
    return "Geolocation not supported";
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();

          const location = `${
            data.address.city ||
            data.address.town ||
            data.address.village ||
            "Unknown"
          }, ${data.address.county || "Unknown"}, ${
            data.address.country_code?.toUpperCase() || "XX"
          }`;

          resolve(location);
        } catch (error) {
          console.error("Error fetching location details:", error);
          resolve("Unknown (Location off)");
        }
      },
      (error) => {
        console.error("Error getting geolocation:", error.message);
        resolve("Unknown (Location off)");
      }
    );
  });
};

// watchGeoPermission
export const watchGeoPermission = async (
  onGranted: () => void | Promise<void>,
  onDenied?: () => void | Promise<void>
) => {
  if (!navigator.permissions) {
    console.warn("Permissions API not supported.");
    return;
  }

  try {
    const status = await navigator.permissions.query({ name: "geolocation" });

    // Trigger immediately if already granted
    if (status.state === "granted") {
      await onGranted();
    }

    // Listen for permission changes
    status.onchange = async () => {
      console.log("Geolocation permission changed to:", status.state);

      if (status.state === "granted") {
        await onGranted();
      } else if (status.state === "denied" && onDenied) {
        await onDenied();
      }
    };
  } catch (error) {
    console.error("Failed to monitor geolocation permission:", error);
  }
};
