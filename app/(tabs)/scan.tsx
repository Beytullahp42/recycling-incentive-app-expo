import BinScanner from "@/components/BinScanner";
import { useRecyclingSession } from "@/context/RecyclingContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

// --- PLACEHOLDER IMPORTS (Uncomment when ready) ---
// import RecyclingScanner from '@/components/RecyclingScanner';

const RecyclingScannerPlaceholder = () => {
  const { timeLeft, sessionStartTime } = useRecyclingSession();

  // 1. Local state to force re-renders
  const [remaining, setRemaining] = React.useState(timeLeft);

  React.useEffect(() => {
    if (!sessionStartTime) return;

    const intervalId = setInterval(() => {
      // Calculate how much time has passed since start
      const elapsed = (Date.now() - sessionStartTime) / 1000;
      const newValue = Math.max(0, Math.floor(timeLeft - elapsed));

      setRemaining(newValue); // This update triggers the re-render!
    }, 1000);

    return () => clearInterval(intervalId);
  }, [sessionStartTime, timeLeft]);

  return (
    <View style={styles.placeholder}>
      <Text style={styles.text}>[ RecyclingScanner ]</Text>
      <Text style={styles.subtext}>Ready to scan.</Text>
      <Text style={[styles.subtext, { color: "yellow" }]}>
        Time Remaining: {remaining}s
      </Text>
    </View>
  );
};

export default function ScanScreen() {
  // 1. Hook into Global State
  const { isSessionActive, startSession } = useRecyclingSession();

  // 2. State A: No Session -> Show Bin Scanner
  if (!isSessionActive) {
    return (
      <BinScanner
        onSessionStarted={(token: string, name: string, timeLeft: number) => {
          startSession(token, name, timeLeft);
        }}
      />
    );
  }

  // 3. State B: Session Active -> Show Item Scanner
  // No props needed! The component is "smart" and connects to context itself.
  return <RecyclingScannerPlaceholder />;
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },
  text: { color: "white", fontSize: 24, fontWeight: "bold" },
  subtext: { color: "#3498db", marginTop: 20, fontSize: 16 },
});
