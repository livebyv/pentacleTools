import { GithubIcon, HeartIcon, TwitterIcon } from "./icons";

export function MadeWithLove() {
  return (
    <div className="flex flex-row gap-3">
      <a
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors hover:text-primary"
        href="https://github.com/21e8/pentacle.tools/"
      >
        <i>
          <GithubIcon />
        </i>
      </a>
      <div className="flex flex-col justify-center items-center text-center">
        <span>
          Made with{" "}
          <i className="inline ml-1">
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
        className="transition-colors hover:text-primary"
      >
        <i>
          <TwitterIcon />
        </i>
      </a>
    </div>
  );
}
