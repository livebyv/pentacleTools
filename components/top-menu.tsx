import Link from "next/link";
import React from "react";
import { useRouter } from "next/router";
import { MenuIcon } from "./icons";

export default function TopMenu() {
  const router = useRouter();
  const { asPath } = router;
  const getClass = (path) => (asPath === path ? "border-b-2" : "");

  const TopMenuLink = ({ path, children }) => {
    return (
      <li className={getClass(path) + " border-primary-focus"}>
        <Link href={{ pathname: path }} passHref>
          <a className="py-4 border-0">
            <span className="border-0">{children}</span>
          </a>
        </Link>
      </li>
    );
  };

  return (
    <div className="w-full text-center">
      <nav
        style={{ gridTemplateColumns: "1fr auto 1fr" }}
        // TODO: create class for this
        className="top-menu-nav"
      >
        <div
          className="flex items-center mr-4 text-white flex-no-shrink"
          style={{ width: 128 }}
        >
          <a
            href="https://pentacle.xyz"
            target="_blank"
            rel="noreferrer noopener"
            className="grid place-content-center py-2"
          >
            <img
              src="/pentacle.svg"
              width={221}
              height={65}
              alt="Pentacle"
            />
          </a>
        </div>
        <div className="flex col-start-4 w-1/4 xl:hidden">
          <label htmlFor="my-drawer" id="app" className="btn">
            <i>
              <MenuIcon />
            </i>
          </label>
        </div>
        <ul
          className="hidden flex-grow justify-center w-full menu horizontal lg:items-center lg:w-auto xl:flex"
          id="menu"
        ></ul>
        <div className="hidden w-1/4 xl:block"></div>
      </nav>
    </div>
  );
}
