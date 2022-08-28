import CloudUploadIcon from "@heroicons/react/solid/CloudUploadIcon";
import DotsHorizontalIcon from "@heroicons/react/solid/DotsHorizontalIcon";
import PhotographIcon from "@heroicons/react/solid/PhotographIcon";
import SwitchHorizontalIcon from "@heroicons/react/solid/SwitchHorizontalIcon";
import TerminalIcon from "@heroicons/react/solid/TerminalIcon";
import { ImageURI } from "../util/image-uri";
import { FingerPrintIcon, InfoIcon, CameraIcon, CoinsIcon, FireIcon, HammerIcon, SendIcon, GetCashIcon, BankIcon } from "./icons";
import { MenuLink } from "./menu-link";

export default function SideMenuLarge() {
  return (
    <ul className="side-menu--desktop">
      <li>
        <a
          href="https://cryptostraps.io"
          target="_blank"
          rel="noreferrer noopener"
          className="flex flex-col items-center hover:bg-opacity-0 focus:bg-opacity-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/cs-logo.webp"
            width={375}
            height={154}
            alt="CryptoStraps"
            className="p-4"
            style={{maxHeight: 96, width: 'auto'}}
          />

          <span className="text-2xl">Tools</span>
        </a>
      </li>

      <li className="px-1">
        <hr className="my-2 opacity-20"></hr>
        <div className="flex gap-3 items-center px-2">
          <PhotographIcon width={16} height={16} className="mr-3" />
          <span>NFT</span>
        </div>
        <hr className="my-2 opacity-20"></hr>
      </li>
      <MenuLink activatesDrawer={false} href="/nft-mints">
        <div>
          <i className="mr-3">
            <FingerPrintIcon />
          </i>
          <span>Get NFT Mints</span>
        </div>
      </MenuLink>
      <MenuLink activatesDrawer={false} href="/token-metadata">
        <i className="mr-3">
          <InfoIcon />
        </i>
        <span>Token Metadata</span>
      </MenuLink>
      <MenuLink activatesDrawer={false} href="/holder-snapshot">
        <i className="inline-block mr-3">
          <CameraIcon width={16} height={16} />
        </i>
        <span>Holder Snapshot</span>
      </MenuLink>
      <MenuLink activatesDrawer={false} href="/nft-minters">
        <i className="inline-block mr-3">
          <CoinsIcon width={16} height={16} />
        </i>
        <span>NFT Minters</span>
      </MenuLink>
      <MenuLink activatesDrawer={false} href="/burn-nfts">
        <i className="mr-3">
          <FireIcon />
        </i>
        <span>Burn NFTs</span>
      </MenuLink>
      <MenuLink activatesDrawer={false} href="/mint-nft">
        <i className="mr-3">
          <HammerIcon />
        </i>
        <span>Mint NFT</span>
      </MenuLink>

      <MenuLink activatesDrawer={false} href="/send-nfts">
        <i className="mr-3">
          <SendIcon />
        </i>
        Send Multiple NFTs
      </MenuLink>
      <li className="px-1">
        <hr className="my-2 opacity-20"></hr>

        <div className="flex gap-3 items-center px-2">
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
        <hr className="my-2 opacity-20"></hr>
      </li>
      <MenuLink activatesDrawer={false} href="/shadow-drive">
        <TerminalIcon width={16} height={16} className="mr-3" />
        <span>SHDW Drive Console</span>
      </MenuLink>
      <MenuLink activatesDrawer={false} href="/shadow-drive/sned">
        <CloudUploadIcon className="mr-3" width={16} height={16} />
        SHDW Sned 9000
      </MenuLink>
      <MenuLink activatesDrawer={false} href="/shadow-drive/swap">
        <SwitchHorizontalIcon className="mr-3" width={16} height={16} />
        <span>SHDW Swap</span>
      </MenuLink>

      <li className="px-1">
        <hr className="my-2 opacity-20"></hr>

        <div className="flex gap-3 items-center px-2">
          <DotsHorizontalIcon className="mr-3" width={16} height={16} />
          <span>Misc</span>
        </div>
        <hr className="my-2 opacity-20"></hr>
      </li>

      <MenuLink activatesDrawer={false} href="/snedmaster">
        <i className="mr-3">
          <GetCashIcon width={16} height={16} />
        </i>
        <span>SnedMaster 9000</span>
      </MenuLink>

      <MenuLink activatesDrawer={false} href="/stake">
        <i className="mr-3">
          <BankIcon width={16} height={16} />
        </i>
        <span>Stake View</span>
      </MenuLink>
    </ul>
  );
}
