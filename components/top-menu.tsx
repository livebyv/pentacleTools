
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { useRouter } from "next/router";
import { ImageURI } from "../util/image-uri";

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
        <div className="flex items-center flex-no-shrink text-white mr-4" style={{width: 128}}>
          <a
            href="https://pentacle.xyz"
            target="_blank"
            rel="noreferrer noopener"
            className="py-2 grid place-content-center"
          >
            <Image
              src={ImageURI.PentacleLogo}
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
