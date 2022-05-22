import Image from "next/image";
import { ImageURI } from "../util/image-uri";
import { MenuLink } from "./menu-link";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useContext } from "react";
import { AlertContext } from "../providers/alert-provider";

export default function SideMenu() {
  const { setAlertState } = useContext(AlertContext);

  return (
    <div className="drawer-side lg:hidden">
      <label htmlFor="my-drawer" className="drawer-overlay"></label>
      <ul className="menu p-4 overflow-y-auto w-80 bg-base-300 border-l flex flex-col border-gray-700 shadow text-base-content gap-2">
        <li>
          <a
            href="https://pentacle.xyz"
            target="_blank"
            rel="noreferrer noopener"
            className="py-2 hover:bg-opacity-0 focus:bg-opacity-0"
          >
            <Image
              src={ImageURI.PentacleLogo}
              width={221}
              height={64}
              alt="Pentacle"
            />
          </a>
        </li>
        <MenuLink href="/nft-mints">
          <div>
            <i className="fa-solid fa-fingerprint mr-3"></i>
            Get NFT Mints
          </div>
        </MenuLink>
        <MenuLink href="/token-metadata">
          <div>
            <div
              style={{ width: 14 }}
              className="inline-flex items-center justify-center mr-3"
            >
              <i className="fa-solid fa-info"></i>
            </div>
            Token Metadata
          </div>
        </MenuLink>
        <MenuLink href="/holder-snapshot">
          <i className="fa-solid fa-camera mr-3"></i>
          <span> Holder Snapshot</span>
        </MenuLink>
        <MenuLink href="/nft-minters">
          <i className="fa-solid fa-coins mr-3"></i>
          <span> NFT Minters</span>
        </MenuLink>
        <MenuLink href="/shadow-drive">
          <img
            src={ImageURI.GenesysGo}
            alt=""
            className="mr-2"
            style={{
              filter: " grayscale(100%)",
              width: 16,
              height: 16,
              display: "inline",
            }}
          />
          Shadow Drive Viewer
        </MenuLink>
        <MenuLink href="/burn-nfts">
          <i className="fa-solid fa-fire mr-3"></i>
          <span>Burn NFTs</span>
        </MenuLink>
        <MenuLink href="/mint-nft">
          <i className="fa-solid fa-hammer mr-3"></i>
          Mint NFT
        </MenuLink>
        {/* <MenuLink href="/find-stuck-sol">Find Stuck SOL</MenuLink> */}
        <MenuLink href="/arweave-upload">
          <i className="fa-solid fa-file-arrow-up mr-3"></i>
          <span>Arweave Upload</span>
        </MenuLink>
        <MenuLink href="/snedmaster">
          <i className="fa-solid fa-hand-holding-dollar mr-3"></i>
          <span>SnedMaster</span>
        </MenuLink>

        <li className="mt-auto w-full">
          <div className={`flex gap-6 items-center justify-center`}>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/penta-fun/sol-nft-tools/"
            >
              <i
                className="fab fa-github"
                style={{ fontStyle: "normal", fontSize: 24 }}
              ></i>
            </a>
            <div className="text-center flex items-center justify-center flex-col">
              <span>
                Made with <i className="fa-solid fa-heart ml-1"></i>
              </span>
              <a
                href="https://twitter.com/pentaclexyz"
                target="_blank"
                rel="noopener noreferrer"
              >
                by 0xAlice
              </a>
            </div>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://twitter.com/pentaclexyz"
            >
              <i
                className="fab fa-twitter"
                style={{ fontStyle: "normal", fontSize: 24 }}
              ></i>
            </a>
          </div>
          <div>
            <div className="text-sm text-center">
              <CopyToClipboard
                text={"lolfees.sol"}
                onCopy={() =>
                  setAlertState({
                    message: "Copied to clipboard!",
                    duration: 2000,
                    open: true,
                  })
                }
              >
                <span className={`cursor-pointer ml-1`}>
                  Donations: lolfees.sol
                </span>
              </CopyToClipboard>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
}
