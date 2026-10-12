import { useNetworkStatusStore } from "@/context/networkStatusStore";
import * as Network from "expo-network";
import { useEffect } from "react";

export default function NetworkStatusInitializer() {
  const { checkConnectivity } = useNetworkStatusStore();

  useEffect(() => {
    checkConnectivity();
  }, [checkConnectivity]);
  useEffect(() => {
    const subscription = Network.addNetworkStateListener((state) => {
      const currentStatus = useNetworkStatusStore.getState().status;
      if (state.isConnected && currentStatus === "NO_INTERNET") {
        checkConnectivity();
      } else if (!state.isConnected) {
        useNetworkStatusStore.getState().setStatus("NO_INTERNET");
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkConnectivity]);

  return null;
}
