import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface RecyclingContextType {
  // State
  isSessionActive: boolean;
  sessionToken: string | null;
  binName: string | null;
  scannedItems: Set<string>;
  hasSessionProof: boolean;
  sessionStartTime: number | null;

  startSession: (token: string, name: string, timeLeft: number) => void;
  endSession: () => void;
  registerScan: (barcode: string) => void;
  unlockUnlimited: () => void;
  timeLeft: number;
}

const RecyclingContext = createContext<RecyclingContextType | undefined>(
  undefined
);

export function RecyclingProvider({ children }: { children: ReactNode }) {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [binName, setBinName] = useState<string | null>(null);
  const [scannedItems, setScannedItems] = useState<Set<string>>(new Set());
  const [hasSessionProof, setHasSessionProof] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Auto-expire session logic (Optional safety check)
  useEffect(() => {
    if (!sessionStartTime) return;

    const checkExpiry = setInterval(() => {
      const elapsed = (Date.now() - sessionStartTime) / 1000;
      if (elapsed > timeLeft) {
        // 3 Minutes hard limit
        endSession();
      }
    }, 5000);

    return () => clearInterval(checkExpiry);
  }, [sessionStartTime, timeLeft]);

  const startSession = (token: string, name: string, timeLeft: number) => {
    setSessionToken(token);
    setBinName(name);
    setSessionStartTime(Date.now());
    setScannedItems(new Set());
    setHasSessionProof(false);
    setTimeLeft(timeLeft);
  };

  const endSession = () => {
    setSessionToken(null);
    setBinName(null);
    setSessionStartTime(null);
    setScannedItems(new Set());
    setHasSessionProof(false);
  };

  const registerScan = (barcode: string) => {
    setScannedItems((prev) => {
      const newSet = new Set(prev);
      newSet.add(barcode);
      return newSet;
    });
  };

  const unlockUnlimited = () => {
    setHasSessionProof(true);
  };

  return (
    <RecyclingContext.Provider
      value={{
        isSessionActive: !!sessionToken,
        sessionToken,
        binName,
        scannedItems,
        hasSessionProof,
        sessionStartTime,
        startSession,
        endSession,
        registerScan,
        unlockUnlimited,
        timeLeft,
      }}
    >
      {children}
    </RecyclingContext.Provider>
  );
}

export function useRecyclingSession() {
  const context = useContext(RecyclingContext);
  if (!context) {
    throw new Error(
      "useRecyclingSession must be used within a RecyclingProvider"
    );
  }
  return context;
}
