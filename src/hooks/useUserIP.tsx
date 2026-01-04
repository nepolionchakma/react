import axios from "axios";

const getUserIP = async (): Promise<string | null> => {
  try {
    const response = await axios.get("https://ifconfig.me/ip", {
      withCredentials: false,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching IP address:", error);
    return null;
  }
};
export default getUserIP;
