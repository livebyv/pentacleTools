import React, { useMemo } from "react";
import { usePagination } from "react-use-pagination";

import FileTile from "./file-tile";
import { TrashIcon, UploadIcon } from "./icons";
import { Pagination } from "./pagination";

export function sizeMB(bytes: number): number {
  return bytes / (1000 * 1000);
}

interface PaginateFilesProps {
  addMore: (e: any) => void;
  handleClear: () => void;
  files: File[];
  handleRemoveFile: (name: string) => void;
}

export default function PaginatedFiles({
  addMore,
  files,
  handleClear,
  handleRemoveFile,
}: PaginateFilesProps) {
  const { currentPage, totalPages, startIndex, endIndex, setPage, pageSize } =
    usePagination({ totalItems: files.length, initialPageSize: 15 });

  const fileSizeInMb = useMemo(
    () => sizeMB(files.reduce((acc, curr) => acc + curr.size, 0)),
    [files]
  );
  return (
    !!files.length && (
      <>
        <div className="flex flex-row justify-between items-center mt-2 mb-6 w-full max-w-full">
          <h2 className="m-0 text-3xl text-white">
            File List | {files.length} files | {""}
            <span>{fileSizeInMb.toFixed(2)} MB</span>
          </h2>

          <button
            onClick={handleClear}
            className="btn btn-sm btn-outline btn-error"
          >
            <i className="mr-2">
              <TrashIcon width={16} height={16} />
            </i>
            Clear all
          </button>
        </div>
        <div className="grid grid-cols-6 gap-3 my-3 md:grid-cols-9 lg:grid-cols-12">
          <div className="relative col-span-3">
            <button className="relative w-full h-36 bg-center bg-cover shadow-md card bg-base-100">
              <div className="absolute inset-0 bg-black opacity-75"></div>
              <div className="z-10 p-3 w-full card-body">
                <label className="w-full file-upload">
                  <UploadIcon />
                  <span className="mt-2 text-base leading-normal">Add</span>
                  <input
                    type="file"
                    multiple
                    onChange={addMore}
                    className="hidden"
                  />
                </label>
              </div>
            </button>
          </div>
          {files.slice(startIndex, endIndex + 1).map((f) => (
            <div key={f.name} className="col-span-3">
              <FileTile file={f} remove={handleRemoveFile} />
            </div>
          ))}
        </div>
        <Pagination
          total={totalPages}
          currentPage={currentPage}
          pageSize={pageSize}
          setPage={setPage}
        />
      </>
    )
  );
}
