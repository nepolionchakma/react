import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";

const useUserDevice = () => {
  const { signonId } = useGlobalContext();

  const userDevice = () => {
    const user_agent = navigator.userAgent || navigator.vendor;
    const platform = navigator.platform || "unknown";
    const width = window.innerWidth;
    let device_type = "Desktop";
    let browser_name = "Unknown";
    let browser_version = "Unknown";
    let os = "Unknown";

    // Detect Device Type
    if (
      /macintosh|macintel|macppc|mac68k|macppc64|mac68k64/i.test(user_agent)
    ) {
      device_type = "Mac";
    } else if (
      /Mobile|Android|iP(hone|od)|IEMobile|Windows Phone|BlackBerry/i.test(
        user_agent
      )
    ) {
      device_type = "Mobile";
    } else if (/iPad|Tablet|PlayBook|Silk/i.test(user_agent)) {
      device_type = "Tablet";
    } else if (
      width >= 1440 &&
      /Windows NT 10.0|Windows NT 6.3|Windows NT 6.2|Windows NT 6.1|Windows NT 6.0|Windows NT 5.1|Windows NT 5.0|X11|Linux/i.test(
        user_agent
      )
    ) {
      device_type = "Desktop";
    } else {
      device_type = "Laptop";
    }

    // Detect Browser Name and Version
    if (/Edg/i.test(user_agent)) {
      browser_name = "Microsoft Edge";
      browser_version = user_agent.match(/Edg\/([\d.]+)/)?.[1] || "Unknown";
    } else if (/Chrome/i.test(user_agent) && !/OPR|Edg/i.test(user_agent)) {
      browser_name = "Google Chrome";
      browser_version = user_agent.match(/Chrome\/([\d.]+)/)?.[1] || "Unknown";
    } else if (/Safari/i.test(user_agent) && !/Chrome/i.test(user_agent)) {
      browser_name = "Apple Safari";
      browser_version = user_agent.match(/Version\/([\d.]+)/)?.[1] || "Unknown";
    } else if (/Firefox/i.test(user_agent)) {
      browser_name = "Mozilla Firefox";
      browser_version = user_agent.match(/Firefox\/([\d.]+)/)?.[1] || "Unknown";
    } else if (/Opera|OPR/i.test(user_agent)) {
      browser_name = "Opera";
      browser_version =
        user_agent.match(/(Opera|OPR)\/([\d.]+)/)?.[2] || "Unknown";
    } else if (/Trident/i.test(user_agent)) {
      browser_name = "Internet Explorer";
      browser_version = user_agent.match(/rv:([\d.]+)/)?.[1] || "Unknown";
    }

    // Detect OS
    if (/Win/i.test(platform)) {
      os = "Windows";
    } else if (/Mac/i.test(platform)) {
      os = "MacOS";
    } else if (/Linux/i.test(platform)) {
      os = "Linux";
    } else if (/Android/i.test(user_agent)) {
      os = "Android";
    } else if (/iOS|iPhone|iPad|iPod/i.test(user_agent)) {
      os = "iOS";
    }

    // Update State
    const userDevice = {
      id: 0,
      device_type,
      browser_name,
      browser_version,
      os,
      user_agent,
      is_active: 1,
      signon_id: signonId,
    };
    return userDevice;
  };
  return userDevice;
};
export default useUserDevice;
