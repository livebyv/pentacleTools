import React from "react";
import { useFiles } from "../contexts/FileProvider";
import { UploadIcon } from "./icons";
import PaginatedFiles from "./paginated-files";

export function FileUpload() {
  const { setFiles, files } = useFiles();

  const handleAddFiles = (e) => {
    setFiles([...files, ...(e.target as HTMLInputElement).files]);
  };
  const handleSelectFiles = (e) => {
    setFiles([...(e.target as HTMLInputElement).files]);
  };
  const handleClearFiles = () => setFiles([]);
  const handleRemoveFile = (name: string) =>
    setFiles(files.filter((f) => f.name !== name));

  return (
    <>
      {!files?.length && (
        <>
          <h2 className="mb-6 text-3xl text-center">Upload</h2>
          <div className="flex gap-3 justify-center items-center">
            <label className="w-64 file-upload" tabIndex={0}>
              <i>
                <UploadIcon />
              </i>
              <span className="mt-2 text-base leading-normal">
                Select files
              </span>
              <input
                type="file"
                multiple
                onChange={handleSelectFiles}
                className="hidden"
              />
            </label>
            <span>OR</span>

            <label className="w-64 file-upload" tabIndex={0}>
              <i>
                <UploadIcon />
              </i>
              <span className="mt-2 text-base leading-normal">
                Select a folder *
              </span>
              <input
                type="file"
                // @ts-ignore
                webkitdirectory="true"
                multiple
                onChange={handleSelectFiles}
                className="hidden"
              />
            </label>
          </div>

          <br />
          <div className="flex mt-4">
            <span className="ml-auto label-text">
              * may not work with every browser
            </span>
          </div>
        </>
      )}
      <PaginatedFiles
        addMore={handleAddFiles}
        files={files}
        handleClear={handleClearFiles}
        handleRemoveFile={handleRemoveFile}
      />
    </>
  );
}
