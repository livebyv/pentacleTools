import { getRange } from "../util/get-range";

const PaginationButton = ({ currentPage, i, setPage }) => (
  <button
    className={`btn btn-sm ${currentPage === i ? "bg-primary-focus" : ""}`}
    key={i + 1}
    onClick={() => setPage(i)}
  >
    {i + 1}
  </button>
);

export const Pagination = ({ pageSize, total, currentPage, setPage }) => {
  if (total <= 1) {
    return null;
  }
  // Show all buttons for 10 or less pages
  if (total * pageSize < pageSize * 10) {
    return (
      <div className="btn-group justify-center">
        {getRange(total).map((_, i) => (
          <PaginationButton
            key={i}
            currentPage={currentPage}
            i={i}
            setPage={setPage}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="btn-group justify-center">
      {currentPage + 1 < 5 &&
        getRange(5, 0).map((i) => (
          <PaginationButton
            key={i}
            currentPage={currentPage}
            i={i}
            setPage={setPage}
          />
        ))}
      {currentPage + 1 >= 5 && (
        <>
          <PaginationButton
            key={0}
            currentPage={currentPage}
            i={0}
            setPage={setPage}
          />
          <button className="btn btn-sm btn-disabled">...</button>
        </>
      )}

      {currentPage + 1 >= 5 && currentPage - 1 <= total - 5 && (
        <>
          {getRange(3, currentPage - 1).map((i) => (
            <>
              <PaginationButton
                key={i}
                currentPage={currentPage}
                i={i}
                setPage={setPage}
              />
            </>
          ))}
        </>
      )}
      {currentPage - 1 >= total - 4 && (
        <>
          {getRange(5, total - 5).map((i) => (
            <PaginationButton
              key={i}
              currentPage={currentPage}
              i={i}
              setPage={setPage}
            />
          ))}
        </>
      )}

      {currentPage - 1 <= total - 5 && (
        <>
          <button className="btn btn-sm btn-disabled">...</button>
          <PaginationButton
            key={total}
            currentPage={currentPage}
            i={total}
            setPage={setPage}
          />
        </>
      )}
    </div>
  );
};
