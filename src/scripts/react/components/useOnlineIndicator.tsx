/// <reference types="@overwolf/types" />
import { useEffect, useState } from "react";

const getOnlineStatus = () => {
  return navigator.onLine ?? true;
};

export const useOnlineIndicator = () => {
  const [status, setStatus] = useState(getOnlineStatus());

  const setOnline = () => setStatus(true);
  const setOffline = () => setStatus(false);

  useEffect(() => {
    window.addEventListener("online", setOnline);
    window.addEventListener("offline", setOffline);

    return () => {
      window.removeEventListener("online", setOnline);
      window.removeEventListener("offline", setOffline);
    };
  }, []);

  return status;
};
