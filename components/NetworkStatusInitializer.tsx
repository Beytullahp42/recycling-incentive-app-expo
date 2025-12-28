import { useNetworkStatusStore } from "@/context/networkStatusStore";
import * as Network from "expo-network";
import { useEffect } from "react";

/**
 * This component initializes the network status store and sets up listeners.
 * It should be placed near the root of the app.
 */
export default function NetworkStatusInitializer() {
  const { status, checkConnectivity } = useNetworkStatusStore();

  // Initial connectivity check on mount
  useEffect(() => {
    checkConnectivity();
  }, [checkConnectivity]);

  // Listen for network state changes
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
