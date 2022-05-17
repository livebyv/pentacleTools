import { createContext, useState } from "react";

export const FileContext = createContext<{ files: File[]; setFiles: any }>({
  files: [],
  setFiles: () => {},
});

export function FileProvider({ children }: any) {
  const [files, setFiles] = useState([]);

  return (
    <FileContext.Provider value={{ files, setFiles }}>
      {children}
    </FileContext.Provider>
  );
}
