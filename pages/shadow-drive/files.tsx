import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "../../hooks/use-debounce";


export default function ShadowFiles() {
  const { query } = useRouter();
  const [loading, setLoading] = useState(true);
  const data = useRef<any[]>();
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  // Effect for API call
  useEffect(
    () => {
      if (debouncedSearchTerm) {
        setFilteredData(
          data.current
            .filter((d) =>
              (d || "")
                .toLowerCase()
                .includes((debouncedSearchTerm || "").toLowerCase())
            )
            ?.sort((a, b) => a.localeCompare(b))
            .reduce((acc, curr) => {
              const idx = acc.findIndex(
                (a) => a.title === curr[0].toUpperCase()
              );
              if (idx >= 0) {
                acc[idx].items.push(curr);
              } else {
                acc.push({
                  title: curr[0].toUpperCase(),
                  items: [curr],
                });
              }
              return acc;
            }, [])
        );
      } else {
        setFilteredData(
          data.current
            ?.sort((a, b) => a.localeCompare(b))
            .reduce((acc, curr) => {
              const idx = acc.findIndex(
                (a) => a.title === curr[0].toUpperCase()
              );
              if (idx >= 0) {
                acc[idx].items.push(curr);
              } else {
                acc.push({
                  title: curr[0].toUpperCase(),
                  items: [curr],
                });
              }
              return acc;
            }, [])
        );
      }
    },
    [debouncedSearchTerm] // Only call effect if debounced search term changes
  );

  useEffect(() => {
    (async () => {
      if (query.storageAccount) {
        const d = await fetch(
          "https://shadow-storage.genesysgo.net/list-objects",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ storageAccount: query.storageAccount }),
          }
        ).then((res) => res.json());
        data.current = d.keys;
        setFilteredData(
          d.keys
            ?.sort((a, b) => a.localeCompare(b))
            .reduce((acc, curr) => {
              const idx = acc.findIndex(
                (a) => a.title === curr[0].toUpperCase()
              );
              if (idx >= 0) {
                acc[idx].items.push(curr);
              } else {
                acc.push({
                  title: curr[0].toUpperCase(),
                  items: [curr],
                });
              }
              return acc;
            }, [])
        );
      }
      setLoading(false);
    })();
  }, [query.storageAccount]);

  if (loading) {
    return (
      <>
        Please wait... <button className="btn btn-ghost loading"></button>
      </>
    );
  }

  if (!query.storageAccount) {
    return (
      <>
        You have to select a storage account! <br /> <br />
        <Link href={`/shadow-drive`}>
          <button className="btn"> Go Back</button>
        </Link>
      </>
    );
  }
  if (!data?.current?.length) {
    return (
      <>
        No files in this storage account! <br /> <br />
        <Link href={`/shadow-drive`}>
          <button className="btn"> Go Back</button>
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="form-control fixed top-0 bg-black z-30 pb-5 w-full">
        <label className="label">
          <span className="label-text">Search</span>
        </label>

        <input
          type="text"
          placeholder="file name"
          className="input input-bordered w-64"
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
        />
      </div>
      <div className="">
        {!!filteredData?.length &&
          filteredData.map((item) => (
            <div key={item.storageAccount} className="">
              <div className=" sticky top-24 bg-black h-24  flex items-center border-b pb-5">
                <h2 className="text-5xl">{item.title}</h2>
              </div>
              <div
                className="flex gap-x-3 gap-y-2 pt-5"
                style={{ flexWrap: "wrap" }}
              >
                {item.items?.map((it) => (
                  <a
                    key={it}
                    href={`https://shdw-drive.genesysgo.net/${query.storageAccount}/${it}`}
                    rel="noreferrer"
                    target={"_blank"}
                  >
                    <span className="badge badge-outline">{it}</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
      </div>
    </>
  );
}
