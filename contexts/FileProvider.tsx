import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

export const FileContext = createContext<{
  files: File[];
  totalSize: number;
  setFiles: Dispatch<SetStateAction<File[]>>;
}>({
  files: [],
  totalSize: 0,
  setFiles: (files: File[]) => {},
});

export const useFiles = () => useContext(FileContext);
export function FileProvider({ children }: any) {
  const [files, setFiles] = useState<File[]>([]);
  const [totalSize, setTotalSize] = useState(0);

  const _setFiles = (files: File[]) => {
    const total = files.reduce((total, file) => file.size + total, 0);
    setTotalSize(total);
    setFiles(files);
  };

  return (
    <FileContext.Provider value={{ files, setFiles: _setFiles, totalSize }}>
      {children}
    </FileContext.Provider>
  );
}
