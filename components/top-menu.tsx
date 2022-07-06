import React from "react";
import { MenuIcon } from "./icons";

export default function TopMenu() {
  return (
    <div className="w-full text-center">
      <nav
        style={{ gridTemplateColumns: "1fr auto 1fr" }}
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/pentacle.svg"
              width={221}
              height={65}
              alt="Pentacle"
            />
          </a>
        </div>
        <div className="flex col-start-4 w-1/4 xl:hidden">
          <label htmlFor="my-drawer" id="app" className="btn btn-outline">
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
