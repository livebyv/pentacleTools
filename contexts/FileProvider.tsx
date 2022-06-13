import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

export const FileContext = createContext<{
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
}>({
  files: [],
  setFiles: (files: File[]) => {},
});

export const useFiles = () => useContext(FileContext);
export function FileProvider({ children }: { children: JSX.Element }) {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <FileContext.Provider value={{ files, setFiles }}>
      {children}
    </FileContext.Provider>
  );
}
