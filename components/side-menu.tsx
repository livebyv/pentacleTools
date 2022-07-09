import { ImageURI } from "../util/image-uri";
import { MenuLink } from "./menu-link";
import { CopyToClipboard } from "../components/copy-to-clipboard";
import { MadeWithLove } from "./made-with-love";
import {
  BankIcon,
  CameraIcon,
  CoinsIcon,
  FingerPrintIcon,
  FireIcon,
  GetCashIcon,
  HammerIcon,
  InfoIcon,
  SendIcon,
} from "./icons";
import { toast } from "react-toastify";
import SwitchHorizontalIcon from "@heroicons/react/solid/SwitchHorizontalIcon";
import CloudUploadIcon from "@heroicons/react/solid/CloudUploadIcon";
import DotsHorizontalIcon from "@heroicons/react/solid/DotsHorizontalIcon";
import PhotographIcon from "@heroicons/react/solid/PhotographIcon";
import TerminalIcon from "@heroicons/react/solid/TerminalIcon";

export default function SideMenu() {
  return (
    <div className="drawer-side lg:hidden">
      <label htmlFor="my-drawer" className="drawer-overlay"></label>
      <ul className="side-menu--mobile">
        <li>
          <a
            href="https://pentacle.xyz"
            target="_blank"
            rel="noreferrer noopener"
            className="py-2 hover:bg-opacity-0 focus:bg-opacity-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="mb-6"
              src="/pentacle.svg"
              width={221}
              height={64}
              alt="Pentacle"
            />
          </a>
        </li>
        <li className="px-1 pb-3">
          <hr className="p-0 my-2 opacity-20"></hr>
          <div className="flex gap-3 items-center px-2 py-0">
            <PhotographIcon width={16} height={16} className="mr-3" />
            <span>NFT</span>
          </div>
          <hr className="p-0 my-2 opacity-20"></hr>
        </li>
        <MenuLink href="/nft-mints">
          <i className="mr-3">
            <FingerPrintIcon />
          </i>
          <span> Get NFT Mints</span>
        </MenuLink>
        <MenuLink href="/token-metadata">
          <i className="mr-3">
            <InfoIcon />
          </i>
          Token Metadata
        </MenuLink>
        <MenuLink href="/holder-snapshot">
          <i className="mr-3">
            <CameraIcon width={16} height={16} />
          </i>
          <span> Holder Snapshot</span>
        </MenuLink>
        <MenuLink href="/nft-minters">
          <i className="mr-3">
            <CoinsIcon width={16} height={16} />
          </i>
          <span> NFT Minters</span>
        </MenuLink>
        <MenuLink href="/burn-nfts">
          <i className="mr-3">
            <FireIcon />
          </i>
          <span>Burn NFTs</span>
        </MenuLink>
        <MenuLink href="/mint-nft">
          <i className="mr-3">
            <HammerIcon />
          </i>
          Mint NFT
        </MenuLink>
        <MenuLink href="/send-nfts">
          <i className="mr-3">
            <SendIcon />
          </i>
          Send Multiple NFTs
        </MenuLink>

        <li className="px-1">
          <hr className="p-0 my-2 opacity-20"></hr>

          <div className="flex gap-3 items-center px-2 py-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ImageURI.GenesysGo}
              alt="GenesysGo"
              className="inline mr-2 grayscale"
              style={{
                width: 16,
                height: 16,
              }}
            />
            <span>Shadow</span>
          </div>
          <hr className="p-0 my-2 opacity-20"></hr>
        </li>
        <MenuLink href="/shadow-drive">
          <TerminalIcon width={16} height={16} className="mr-3" />
          Shadow Drive Console
        </MenuLink>
        <MenuLink href="/shadow-drive/sned">
          <CloudUploadIcon className="mr-3" width={16} height={16} />
          SHDW Sned 9000
        </MenuLink>
        <MenuLink activatesDrawer={false} href="/shadow-drive/swap">
          <SwitchHorizontalIcon className="mr-3" width={16} height={16} />
          <span>SHDW Swap</span>
        </MenuLink>

        <li className="px-1">
          <hr className="p-0 my-2 opacity-20"></hr>

          <div className="flex gap-3 items-center px-2 py-0">
            <DotsHorizontalIcon className="mr-3" width={16} height={16} />

            <span>Misc</span>
          </div>
          <hr className="p-0 my-2 opacity-20"></hr>
        </li>

        <MenuLink href="/snedmaster">
          <i className="mr-3">
            <GetCashIcon width={16} height={16} />
          </i>
          <span>SnedMaster</span>
        </MenuLink>
        <MenuLink href="/stake">
          <i className="mr-3">
            <BankIcon width={16} height={16} />
          </i>
          <span>Stake View</span>
        </MenuLink>

        <div className="mt-auto w-full">
          <div
            className={`flex flex-col gap-4 justify-center items-center mt-6 text-center`}
          >
            <MadeWithLove />
          </div>
          <div>
            <div className="text-sm text-center transition-colors hover:text-primary">
              <CopyToClipboard
                text={"lolfees.sol"}
                onCopy={() =>
                  toast("Copied to clipboard!", {
                    autoClose: 2000,
                  })
                }
              >
                <span className={`ml-1 cursor-pointer`}>
                  Donations: lolfees.sol
                </span>
              </CopyToClipboard>
            </div>
          </div>
        </div>
      </ul>
    </div>
  );
}
