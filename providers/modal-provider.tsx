import { createContext, ReactElement, useContext, useState } from "react";

const initialState: ModalContextState = {
  modalState: { open: false, message: <></> },
};
export const ModalContext = createContext(initialState);
export const useModal = () => useContext(ModalContext);

export function ModalProvider({ children }) {
  const [modalState, setModalState] = useState<ModalState>({
    open: false,
    message: "",
  });
  return (
    <ModalContext.Provider value={{ setModalState, modalState }}>
      {children}
      <input
        type="checkbox"
        id="my-modal-2"
        checked={modalState.open}
        className="modal-toggle"
        readOnly
      />
      <div className="modal">
        <div className="modal-box">
          <p>{modalState.message}</p>
          <div className="modal-action">
            <label onClick={() => setModalState(initialState.modalState)} htmlFor="my-modal-2" className="btn">
              Close
            </label>
          </div>
        </div>
      </div>
    </ModalContext.Provider>
  );
}

interface ModalState {
  open: boolean; message: ReactElement | string
}
interface ModalContextState {
  modalState: ModalState;
  setModalState?: (opts: ModalState) => void
}