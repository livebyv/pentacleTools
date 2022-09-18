import { toast } from "react-toastify";
import { GithubIcon, HeartIcon, TwitterIcon } from "./icons";
import { CopyToClipboard } from "../components/copy-to-clipboard";

export function MadeWithLove() {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col justify-center items-center text-center">
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-primary"
          href="https://github.com/21e8/cryptostraps.tools/"
        >
          <i>
            <GithubIcon />
          </i>
        </a>
        {/* <div className="text-sm text-center transition-colors hover:text-primary">
          <CopyToClipboard
            text={"GWGjF2iYHrzwNh6un8sfnz6RieXWXTBD9mEzh7GFraFR"}
            onCopy={() =>
              toast("Copied to clipboard!", {
                autoClose: 2000,
              })
            }
          >
            <span className={`ml-1 cursor-pointer`}>
              Donations: GWGjF2iYHrzwNh6un8sfnz6RieXWXTBD9mEzh7GFraFR
            </span>
          </CopyToClipboard>
        </div> */}
      </div>
    </div>
  );
}
