import { createContext, Dispatch, SetStateAction, useState } from "react";

const initialState: {
  alertState: AlertState;
  setAlertState?: Dispatch<SetStateAction<AlertState>>;
} = {
  alertState: {
    open: false,
    message: "",
    severity: undefined,
  },
};

export const AlertContext = createContext(initialState);

export function AlertProvider({ children }) {
  const [alertState, _setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });
  const setAlertState = (state: AlertState) => {
    if (!state.open && state.open !== false) {
      state.duration = 1000;
    }
    if (state?.duration && !isNaN(state.duration)) {
      const timeout = setTimeout(() => {
        _setAlertState({
          open: false,
          message:'',
          severity: null
        })
      }, state.duration);

      _setAlertState(state);
      return () => clearTimeout(timeout);
    }
    _setAlertState(state);
  }
  return (
    <AlertContext.Provider value={{ alertState, setAlertState }}>
      {children}
      {!!alertState?.open && (
        <div
          className={`
        alert ${typeof alertState?.message === 'string' ? 'p-4' : 'p-0'} absolute bottom-2 left-2 right-2 lg:bottom-auto lg:left-72 border border-gray-700 shadow lg:top-8 w-72 text-white
        ${alertState.severity === "error" ? "alert-error" : ""}
        ${alertState.severity === "info" ? "alert-info" : ""}
        ${alertState.severity === "success" ? "alert-success" : ""}
        ${alertState.severity === "warning" ? "alert-warning" : ""}
        `}
        // @ts-ignore
        style={{'--tw-bg-opacity': '0.7'}}
        >
          {alertState.message}
        </div>
      )}
    </AlertContext.Provider>
  );
}

interface AlertState {
  open?: boolean;
  message?: string | JSX.Element;
  severity?: "success" | "info" | "warning" | "error" | undefined;
  duration?: number
}
