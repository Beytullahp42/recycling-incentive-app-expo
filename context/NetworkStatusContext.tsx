import api from "@/services/axios-config";
import * as Network from "expo-network";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type NetworkStatus =
  | "CHECKING"
  | "ONLINE"
  | "NO_INTERNET"
  | "SERVICE_UNAVAILABLE";

type NetworkStatusContextType = {
  status: NetworkStatus;
  retry: () => Promise<void>;
  isChecking: boolean;
};

const NetworkStatusContext = createContext<NetworkStatusContextType>({
  status: "CHECKING",
  retry: async () => {},
  isChecking: true,
});

export const useNetworkStatus = () => useContext(NetworkStatusContext);

export const NetworkStatusProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [status, setStatus] = useState<NetworkStatus>("CHECKING");
  const [isChecking, setIsChecking] = useState(true);

  const checkConnectivity = useCallback(async () => {
    setIsChecking(true);
    try {
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected) {
        setStatus("NO_INTERNET");
        return;
      }

      try {
        const response = await api.get("/ping", { timeout: 5000 });
        if (response.status >= 200 && response.status < 300) {
          setStatus("ONLINE");
        } else {
          setStatus("SERVICE_UNAVAILABLE");
        }
      } catch {
        setStatus("SERVICE_UNAVAILABLE");
      }
    } catch {
      setStatus("NO_INTERNET");
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkConnectivity();
  }, [checkConnectivity]);

  useEffect(() => {
    const subscription = Network.addNetworkStateListener((state) => {
      if (state.isConnected && status === "NO_INTERNET") {
        checkConnectivity();
      } else if (!state.isConnected) {
        setStatus("NO_INTERNET");
      }
    });

    return () => {
      subscription.remove();
    };
  }, [status, checkConnectivity]);

  const retry = useCallback(async () => {
    await checkConnectivity();
  }, [checkConnectivity]);

  return (
    <NetworkStatusContext.Provider value={{ status, retry, isChecking }}>
      {children}
    </NetworkStatusContext.Provider>
  );
};
