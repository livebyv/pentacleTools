import { useConnection } from "@solana/wallet-adapter-react";
import { createContext, useEffect, useState } from "react";

const PerformanceContext = createContext({
  warning: "",
  tps: 0,
});
export function PerformanceProvider({ children }) {
  const [warning, setWarning] = useState("");
  const [tps, setTps] = useState(0);
  const { connection } = useConnection();

  useEffect(() => {
    (async () => {
      const iv = setInterval(async () => {
        const performance = (
          await connection.getRecentPerformanceSamples(5)
        ).reduce((acc, curr) => {
          const tps = curr.numTransactions / curr.samplePeriodSecs;
          acc.push(tps);
          return acc;
        }, []);

        const _tps =
          performance.reduce((a, b) => a + b, 0) / performance.length;
        setTps(_tps);
        debugger;
        if (_tps < 1500) {
          setWarning(
            `Solanas TPS are lower than 1500 (${Math.round(
              _tps
            )}). Network peformance might be degraded and transactions might fail.`
          );
        }

        return () => clearInterval(iv);
      }, 60000);
    })();
  }, [connection]);

  return (
    <PerformanceContext.Provider value={{ warning, tps }}>
      {warning && (
        <div className="bg-red-800 fixed left-0 lg:left-64 p-1 right-0 text-center bottom-0 lg:bottom-auto lg:top-0">
          {warning}
        </div>
      )}
      {children}
    </PerformanceContext.Provider>
  );
}
