import React, { useState } from "react";
import { v4 as uuid } from "uuid";
export interface FieldData {
  name: string | number | (string | number)[];
  value?: any;
  touched?: boolean;
  validating?: boolean;
  errors?: string[];
}

export const AttributesForm: React.FC<{ register: any }> = ({ register }) => {
  const [attributes, setAttributes] = useState<
    { id: string; value: { trait_type: string; value: string } }[]
  >([]);
  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">Attributes</span>
      </label>

      {attributes.map((attr, i) => {
        return (
          <label key={attr.id} className="my-2 input-group">
            <input
              type="text"
              placeholder="Trait Name"
              className="flex-1 input input-bordered"
              {...register(`attributes.${i}.trait_type`)}
            />
            <input
              type="text"
              placeholder="Value"
              className="flex-1 input input-bordered"
              {...register(`attributes.${i}.value`)}
            />

            <button
              onClick={(e) => {
                e.preventDefault();
                const updated = attributes.filter((a) => a.id !== attr.id);
                setAttributes(updated);
              }}
              className="btn btn-primary"
            >
              -
            </button>
          </label>
        );
      })}

      <button
        className={`mt-5 btn`}
        onClick={(e) => {
          e.preventDefault();
          setAttributes([
            ...attributes,
            { id: uuid(), value: { trait_type: "", value: "" } },
          ]);
        }}
      >
        Add attribute
      </button>
    </div>
  );
};