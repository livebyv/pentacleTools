import React from "react";
import { usePagination } from "react-use-pagination";
import FileTile from "./file-tile";
import { Pagination } from "./pagination";

export default function PaginatedFiles({
  addMore,
  files,
  handleClear,
  handleRemoveFile,
}) {
  const { currentPage, totalPages, startIndex, endIndex, setPage, pageSize } =
    usePagination({ totalItems: files.length, initialPageSize: 15 });
  return (
    !!files.length && (
      <>
        <div className="prose max-w-full flex flex-row justify-between items-center mt-2 mb-6">
          <h2 className="m-0">File List ({files.length})</h2>

          <button
            onClick={handleClear}
            className="btn btn-sm btn-outline btn-error "
          >
            <i className="fas fa-trash mr-2"></i>
            Clear all
          </button>
        </div>
        <div className="grid grid-cols-6 md:grid-cols-9 lg:grid-cols-12 gap-3 my-3">
          <div className="relative col-span-3">
            <button className="card bg-base-100 h-36 bg-cover bg-center relative shadow-md w-full">
              <div className="absolute inset-0 opacity-75 bg-black"></div>
              <div className="card-body p-3 z-10  w-full">
                <label className="file-upload w-full">
                  <i className="fas fa-cloud-upload-alt fa-3x"></i>
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
