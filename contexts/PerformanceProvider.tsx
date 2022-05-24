import { useConnection } from "@solana/wallet-adapter-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const INTERVAL_TIMEOUT = process.env.NEXT_TPS_TIMEOUT
  ? +process.env.NEXT_TPS_TIMEOUT
  : 60000;
const MIN_TPS = process.env.NEXT_MIN_TPS ? +process.env.NEXT_MIN_TPS : 1500;

const PerformanceContext = createContext({
  warning: "",
  tps: 0,
});

export const usePerformance = () => useContext(PerformanceContext);
export function PerformanceProvider({ children }) {
  const [warning, setWarning] = useState<string>("");
  const [tps, setTps] = useState(0);
  const { connection } = useConnection();

  const getPerformance = useCallback(async () => {
    const performance = (
      await connection.getRecentPerformanceSamples(5)
    ).reduce((acc, curr) => {
      const tps = curr.numTransactions / curr.samplePeriodSecs;
      acc.push(tps);
      return acc;
    }, []);

    const _tps = performance.reduce((a, b) => a + b, 0) / performance.length;
    setTps(_tps);
    setWarning(
      _tps < MIN_TPS
        ? `Solanas TPS are lower than 1500 (${Math.round(
            _tps
          )}). Network peformance might be degraded and transactions might fail.`
        : ""
    );
  }, [connection]);

  useEffect(() => {
    (async () => {
      await getPerformance();
      const iv = setInterval(async () => {
        await getPerformance();
      }, INTERVAL_TIMEOUT);
      return () => clearInterval(iv);
    })();
  }, [connection]);

  return (
    <PerformanceContext.Provider value={{ warning, tps }}>
      {warning && (
        <div className="bg-red-800 text-white fixed left-0 lg:left-64 p-1 right-0 text-center bottom-0 lg:bottom-auto lg:top-0 z-50">
          {warning}
        </div>
      )}
      {children}
    </PerformanceContext.Provider>
  );
}
