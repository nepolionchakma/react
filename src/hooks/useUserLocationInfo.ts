import { useEffect, useState } from "react";

const useUserLocationInfo = () => {
  const [location, setLocation] = useState<string | null>(null);

  const getLocation = async (): Promise<void> => {
    try {
      if (!("geolocation" in navigator)) {
        console.error("Geolocation is not supported by this browser.");
        setLocation("Geolocation not supported");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();

            const loc = `${
              data.address.city ||
              data.address.town ||
              data.address.village ||
              "Unknown"
            }, ${data.address.county || "Unknown"}, ${
              data.address.country_code?.toUpperCase() || "XX"
            }`;

            setLocation(loc);
          } catch (error) {
            console.error("Error fetching location details:", error);
            setLocation("Unknown (Location off)");
          }
        },
        (error) => {
          console.error("Error getting geolocation:", error.message);
          setLocation("Unknown (Location off)");
        }
      );
    } catch (error) {
      console.error("Unexpected error in getLocation:", error);
      setLocation("Unknown (Location off)");
    }
  };

  useEffect(() => {
    getLocation();
    let permissionStatus: PermissionStatus;

    const watchPermission = async () => {
      if (!navigator.permissions) {
        getLocation(); // fallback
        return;
      }

      try {
        permissionStatus = await navigator.permissions.query({
          name: "geolocation",
        });
        if (permissionStatus.state === "granted") {
          getLocation();
        } else {
          setLocation("Unknown (Location off)");
        }

        permissionStatus.onchange = () => {
          if (permissionStatus.state === "granted") {
            getLocation();
          } else {
            setLocation("Unknown (Location off)");
          }
        };
      } catch (err) {
        console.error("Permission API error:", err);
        setLocation("Unknown (Location off)");
      }
    };

    watchPermission();

    return () => {
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, []);

  return { location, getLocation };
};

export default useUserLocationInfo;
