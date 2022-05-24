import { GithubIcon, HeartIcon, TwitterIcon } from "./icons";

export function MadeWithLove() {
  return (
    <>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://github.com/penta-fun/sol-nft-tools/"
      >
        <i>
          <GithubIcon />
        </i>
      </a>
      <div className="text-center flex items-center justify-center flex-col">
        <span>
          Made with{" "}
          <i className="ml-1 inline">
            <HeartIcon width={16} height={16} />
          </i>
        </span>
        <a
          href="https://twitter.com/@0xAlice_"
          target="_blank"
          rel="noopener noreferrer"
        >
          by 0xAlice
        </a>
      </div>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://twitter.com/@0xAlice_"
      >
        <i>
          <TwitterIcon />
        </i>
      </a>
    </>
  );
}
