import { ValidatorMeta } from "../util/validator-batcher";
import { LinkIcon } from "./icons";

const ValidatorCard = ({
  handleCardSelect,
  meta,
  isDelegating,
  selectedValidator,
  validatorKey,
}: {
  handleCardSelect: any;
  meta: ValidatorMeta;
  isDelegating: boolean;
  selectedValidator: string;
  validatorKey: string;
}) => {
  return (
    <div
      onClick={handleCardSelect}
      className={`border border-gray-600 card p-2  ${
        isDelegating ? "cursor-pointer" : ""
      } ${
        isDelegating && selectedValidator === validatorKey
          ? "card-selected"
          : ""
      }`}
    >
      <div className="card-body" id={`valdiator-${validatorKey}`}>
        <div className="relative">
          <div
            className="flex overflow-hidden gap-4 text-2xl truncate text-ellipsis"
            style={{ maxWidth: "calc(100% - 120px)" }}
          >
            {!!meta?.validatorInfo?.info?.keybaseUsername && (
              <img
                className="w-16 rounded-full shadow"
                src={`https://keybase.io/${meta?.validatorInfo?.info?.keybaseUsername}/picture`}
              />
            )}
            {meta?.validatorInfo?.info?.name} <br />
            {meta?.validatorInfo?.info?.keybaseUsername && (
              <>({meta?.validatorInfo?.info?.keybaseUsername})</>
            )}
          </div>{" "}
          <span className="absolute top-0 right-0 badge badge-secondary">
            Commission: {meta?.voteAccountInfo.commission} %
          </span>
        </div>
        <hr className="mt-auto opacity-10" />

        <div className="flex justify-between items-center text-lg">
          <span className="mr-3 badge">
            Identity
            <a
              href={`https://solscan.io/account/${validatorKey}`}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex justify-center items-center ml-2 cursor-pointer"
            >
              <LinkIcon width={16} height={16} />
            </a>
          </span>
          {validatorKey}
        </div>
        <hr className="opacity-10" />

        <div className="flex justify-between items-center text-lg">
          <span className="mr-3 badge">
            Vote Account
            <a
              href={`https://solscan.io/account/${meta?.voteAccountInfo?.votePubkey}`}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex justify-center items-center ml-2 cursor-pointer"
            >
              <LinkIcon width={16} height={16} />
            </a>
          </span>

          {meta?.voteAccountInfo?.votePubkey}
        </div>
        <hr className="opacity-10" />

        {!!meta?.validatorInfo?.info.website && (
          <>
            <div className="flex justify-between items-center text-lg">
              <span className="mr-3 badge">
                Website
                <a
                  href={meta?.validatorInfo?.info.website}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex justify-center items-center ml-2 cursor-pointer"
                >
                  <LinkIcon width={16} height={16} />
                </a>
              </span>

              {meta?.validatorInfo?.info.website}
            </div>
            <hr className="opacity-10" />
          </>
        )}
        <p className="mx-2">{meta?.validatorInfo?.info.details}</p>
      </div>
    </div>
  );
};

export default ValidatorCard;
