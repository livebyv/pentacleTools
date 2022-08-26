import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { download } from "../util/download";

export default function DownloadHistory({
  localstorageId,
  localStorageItems = [],
  setLocalStorageItems,
}: {
  localstorageId: string;
  localStorageItems: { name: string; timestamp: number; items: any[] }[];
  setLocalStorageItems;
}) {
  const { register, handleSubmit } = useForm();

  useEffect(() => {
    const items = localStorage.getItem(`previous-jobs_${localstorageId}`);
    if (items) {
      const parsed = JSON.parse(items);
      setLocalStorageItems(parsed);
    }
  }, [localstorageId, setLocalStorageItems]);

  useEffect(() => {
    const updatedItemsAsString = JSON.stringify([...localStorageItems]);
    localStorage.setItem(
      `previous-jobs_${localstorageId}`,
      updatedItemsAsString
    );
  }, [localStorageItems, localstorageId]);

  return (localStorageItems as any)?.items?.length ? (
    <form
      onSubmit={handleSubmit(({ selectedItem }) =>
        download(`${selectedItem.name}.json`, JSON.stringify(selectedItem))
      )}
    >
      <label className="label">Previous Jobs</label>
      <div
        className="flex flex-row gap-3 justify-center"
        style={{ flexWrap: "wrap" }}
      >
        <select className="select" {...register("selectedItem")}>
          {localStorageItems.map((item) => (
            <>
              <option>
                CM-ID: {item.name.split(localstorageId)[1]} -
                {new Date(item.timestamp).toLocaleString()} -{" "}
                {item.items.length} mints
              </option>
            </>
          ))}
        </select>
        <button className="shadow-lg btn btn-primary rounded-box" type="submit">
          <Image
            src="/download-icon.png"
            height={48}
            width={48}
            alt="download"
          />
        </button>
      </div>
    </form>
  ) : (
    <></>
  );
}
