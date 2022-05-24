let getDataTransfer = () => new DataTransfer();
try {
  getDataTransfer();
} catch {
  getDataTransfer = () => new ClipboardEvent("").clipboardData;
}

function createFileList(files: File[]) {
  let index = 0;
  const { length } = files;

  const dataTransfer = getDataTransfer();

  for (; index < length; index++) {
    dataTransfer.items.add(files[index]);
  }

  return dataTransfer.files;
}

export default createFileList;
