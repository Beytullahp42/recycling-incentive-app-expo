import BinScanner from "@/components/BinScanner";
import RecyclingScanner from "@/components/RecyclingScanner";
import { useRecyclingSession } from "@/context/RecyclingContext";

export default function ScanScreen() {
  const { isSessionActive } = useRecyclingSession();

  // State A: No Session -> Show Bin Scanner
  if (!isSessionActive) {
    return <BinScanner />;
  }

  // State B: Session Active -> Show Item Scanner
  return <RecyclingScanner />;
}
