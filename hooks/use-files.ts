import { useState } from 'react';
export function useFiles() {
  const [files, setFiles] = useState<File[]>([]);
  return { files, setFiles };
}