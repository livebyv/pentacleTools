import React, { useMemo } from "react";
import { usePagination } from "react-use-pagination";
import { sizeMB } from "../util/upload-arweave-bundles/upload-generator";
import FileTile from "./file-tile";
import { TrashIcon, UploadIcon } from "./icons";
import { Pagination } from "./pagination";

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
        <div className="w-full max-w-full flex flex-row justify-between items-center mt-2 mb-6">
          <h2 className=" text-3xl m-0 text-white">
            File List | {files.length} files | {""}
            <span>{fileSizeInMb.toFixed(2)} MB</span>
          </h2>

          <button
            onClick={handleClear}
            className="btn btn-sm btn-outline btn-error "
          >
            <i className="mr-2">
              <TrashIcon width={16} height={16} />
            </i>
            Clear all
          </button>
        </div>
        <div className="grid grid-cols-6 md:grid-cols-9 lg:grid-cols-12 gap-3 my-3">
          <div className="relative col-span-3">
            <button className="card bg-base-100 h-36 bg-cover bg-center relative shadow-md w-full">
              <div className="absolute inset-0 opacity-75 bg-black"></div>
              <div className="card-body p-3 z-10  w-full">
                <label className="file-upload w-full">
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
