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
          <label key={attr.id} className="input-group my-2">
            <input
              type="text"
              placeholder="Trait Name"
              className="input input-bordered flex-1"
              {...register(`attributes.${i}.trait_type`)}
            />
            <input
              type="text"
              placeholder="Value"
              className="input input-bordered flex-1"
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
        className={`btn mt-5`}
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