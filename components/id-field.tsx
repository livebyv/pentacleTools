import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useForm } from "react-hook-form";

export default function IdField({ sned, loading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (value) => sned({ ids: value.ids, amount: value.amount });

  const validate = (value: string) => {
    try {
      let val;
      const getVal = () => {
        try {
          return JSON.parse(value);
        } catch {
          if (value.includes(",")) {
            return value
              .split(",")
              .map((t) => t.trim())
              .filter((a) => a);
          }
          if (/\n/.exec(value)?.length) {
            return value
              .split("\n")
              .map((t) => t.trim())
              .filter((a) => a);
          }
          if (/\r/.exec(value)?.length) {
            return value
              .split("\r")
              .map((t) => t.trim())
              .filter((a) => a);
          }
          return value;
        }
      };
      val = getVal();
      if (!val.length) {
        return false;
      }
      typeof val === "string"
        ? new PublicKey(val)
        : val.forEach((v) => new PublicKey(v));
      return true;
    } catch {
      return "Could not get addresses";
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Amount to sned in SOL</span>
        </label>
        <input
          className="input"
          required
          step={1 / LAMPORTS_PER_SOL}
          min="0.0"
          placeholder="0.5"
          type="number"
          {...register("amount")}
        />
      </div>
      <div className="form-control pb-6" style={{ position: "relative" }}>
        <label className="label">
          <span className="label-text">
            List with all addresses (JSON, comma-separated or newline-separated)
          </span>
        </label>
        <textarea
          className="textarea h-24"
          placeholder={`GoThgFHS5W9jCLX7JoWnCHtL5RMJEBWL3HVuhGjVntyg\nBiRdzfdUcssYAzMnpnFvcqP8BeTxLtZ8RqAd8cKhVD6u`}
          {...register("ids", { validate: validate })}
        ></textarea>
        {errors?.ids?.type === "validate" && "Invalid address"}
      </div>

      <div className="w-full text-center">
        <input
          type="submit"
          value="Sned!"
          className={`btn btn-primary rounded-box ${loading ? "loading" : ""}`}
        />
      </div>
    </form>
  );
}
