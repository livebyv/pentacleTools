import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useReducer, useRef } from "react";
import { useDebounce } from "../../hooks/use-debounce";
import { DownloadIcon } from "../../components/icons";
import { download } from "../../util/download";
import jsonFormat from "json-format";

export default function ShadowFiles() {
  const { query } = useRouter();
  const initState: {
    balance: string;
    searchTerm: string;
    loading: boolean;
    filteredData: any[];
  } = {
    balance: "",
    searchTerm: "",
    loading: true,
    filteredData: [],
  };
  const [state, dispatch] = useReducer(
    (
      state: typeof initState,
      action:
        | { type: "loading"; payload?: { loading: boolean } }
        | { type: "balance"; payload?: { balance: string } }
        | { type: "searchTerm"; payload?: { searchTerm: string } }
        | { type: "filteredData"; payload?: { filteredData: any[] } }
    ) => {
      switch (action.type) {
        case "loading":
          return { ...state, loading: action.payload.loading };
        case "balance":
          return { ...state, balance: action.payload.balance };
        case "searchTerm":
          return { ...state, searchTerm: action.payload.searchTerm };
        case "filteredData":
          return { ...state, filteredData: action.payload.filteredData };
        default: {
          throw new Error(
            "unsupported action type given on SHDW Drive reducer"
          );
        }
      }
    },
    initState
  );
  const data = useRef<any[]>();
  const debouncedSearchTerm = useDebounce(state.searchTerm, 500);
  const filterData = ({ data }) => {
    return data
      ?.sort((a, b) => a.localeCompare(b))
      .reduce((acc, curr) => {
        const idx = acc.findIndex((a) => a.title === curr[0].toUpperCase());
        if (idx >= 0) {
          acc[idx].items.push(curr);
        } else {
          acc.push({
            title: curr[0].toUpperCase(),
            items: [curr],
          });
        }
        return acc;
      }, []);
  };
  // Effect for API call
  useEffect(
    () => {
      if (debouncedSearchTerm) {
        const filtered = filterData({
          data: data.current.filter((d) =>
            (d || "")
              .toLowerCase()
              .includes((debouncedSearchTerm || "").toLowerCase())
          ),
        });
        dispatch({ type: "filteredData", payload: { filteredData: filtered } });
      } else {
        const filtered = filterData({ data: data.current });
        dispatch({
          type: "filteredData",
          payload: {
            filteredData: filtered,
          },
        });
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
        const filtered = filterData({ data: d.keys });
        dispatch({
          type: "filteredData",
          payload: {
            filteredData: filtered,
          },
        });
      }
      dispatch({ type: "loading", payload: { loading: false } });
    })();
  }, [query.storageAccount]);

  if (state.loading) {
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
        <Link href={`/shadow-drive`} passHref>
          <button className="btn"> Go Back</button>
        </Link>
      </>
    );
  }
  if (!data?.current?.length) {
    return (
      <>
        No files in this storage account! <br /> <br />
        <Link href={`/shadow-drive`} passHref>
          <button className="btn"> Go Back</button>
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="fixed top-0 z-30 pb-5 w-full bg-black form-control">
        <label className="label">
          <span className="label-text">Search</span>
        </label>

        <input
          type="text"
          placeholder="file name"
          className="w-64 input input-bordered"
          onChange={(e) =>
            dispatch({
              type: "searchTerm",
              payload: { searchTerm: e.target.value },
            })
          }
        />
      </div>
      <div>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => {
            download(
              `shdw-files-${query.storageAccount}-${Date.now()}.json`,
              jsonFormat(
                state.filteredData
                  .map((i) => i.items)
                  .flat()
                  .map(
                    (l) =>
                      `https://shdw-drive.genesysgo.net/${query.storageAccount}/${l}`
                  )
              )
            );
          }}
        >
          Download File List
          <DownloadIcon width={16} />{" "}
        </button>
      </div>
      <div>
        {!!state.filteredData?.length &&
          state.filteredData.map((item) => (
            <div key={item.storageAccount}>
              <div className="flex sticky top-24 items-center pb-5 h-24 bg-black border-b">
                <h2 className="text-5xl">{item.title}</h2>
              </div>
              <div
                className="flex gap-y-2 gap-x-3 pt-5"
                style={{ flexWrap: "wrap" }}
              >
                {item.items?.map((it) => (
                  <a
                    key={it}
                    href={`https://shdw-drive.genesysgo.net/${query.storageAccount}/${it}`}
                    rel="noopener noreferrer"
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
