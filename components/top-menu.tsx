import Link from "next/link";
import Image from "next/image";
import React from "react";
import { useRouter } from "next/router";
import { ArweaveURI } from "../util/arweave-uri";

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
        className="grid fixed left-0 right-0 max-w-6xl
            z-50 xl:mx-auto mx-4 my-2 py-1 xl:py-0 px-4 
            bg-base-300 rounded-box items-center justify-between 
            flex-wrap bg-blue-darkshadow-lg"
      >
        <div className="flex items-center flex-no-shrink text-white mr-4" style={{width: 128}}>
          <a
            href="https://pentacle.xyz"
            target="_blank"
            rel="noreferrer noopener"
            className="py-2 grid place-content-center"
          >
            <img
              src={ArweaveURI.PentacleLogo}
              width={221}
              height={65}
              alt="Pentacle"
            />
          </a>
        </div>
        <div className="xl:hidden w-1/4 flex col-start-4">
          <label htmlFor="my-drawer" id="app" className="btn">
            <i className="fas fa-bars"></i>
          </label>
        </div>
        <ul
          className="menu horizontal justify-center w-full flex-grow lg:items-center lg:w-auto hidden xl:flex"
          id="menu"
        >
        </ul>
        <div className="w-1/4 hidden xl:block"></div>
      </nav>
    </div>
  );
}
