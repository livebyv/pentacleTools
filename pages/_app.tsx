import "../styles/globals.css";

import {
  ConnectionProvider,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { AppProps } from "next/app";
import dynamic from "next/dynamic";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import DotsHorizontalIcon from "@heroicons/react/solid/DotsHorizontalIcon";
import SwitchHorizontalIcon from "@heroicons/react/solid/SwitchHorizontalIcon";
import PhotographIcon from "@heroicons/react/solid/PhotographIcon";
import TerminalIcon from "@heroicons/react/solid/TerminalIcon";
import { ModalProvider } from "../contexts/ModalProvider";
import SideMenu from "../components/side-menu";
import TopMenu from "../components/top-menu";
import { MenuLink } from "../components/menu-link";
import { ImageURI } from "../util/image-uri";
import { FileProvider } from "../contexts/FileProvider";
import { MadeWithLove } from "../components/made-with-love";
import { CopyToClipboard } from "../components/copy-to-clipboard";
import { PerformanceProvider } from "../contexts/PerformanceProvider";
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
} from "../components/icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { JupiterProvider } from "@jup-ag/react-hook";
import { getPlatformFeeAccounts } from "@jup-ag/core";
import { PublicKey } from "@solana/web3.js";
import CloudUploadIcon from "@heroicons/react/solid/CloudUploadIcon";
import { BalanceProvider } from "../contexts/BalanceProvider";

const endpoint = process.env.NEXT_PUBLIC_RPC;

const WalletProvider = dynamic(
  () => import("../contexts/ClientWalletProvider"),
  {
    ssr: false,
  }
);

const Providers = ({ children }: { children: React.ReactNode }) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [platformFeeAndAccounts, setPlatformFeeAndAccounts] =
    useState(undefined);
  useEffect(() => {
    (async () => {
      if (process.env.NEXT_PUBLIC_JUPITER_FEE_DESTINATION) {
        const feeAccs = await getPlatformFeeAccounts(
          connection,
          new PublicKey(process.env.NEXT_PUBLIC_JUPITER_FEE_DESTINATION)
        );
        setPlatformFeeAndAccounts({
          feeBps: +(process.env.NEXT_PUBLIC_JUPITER_FEE_AMOUNT || 0),
          feeAccounts: feeAccs,
        });
      }
    })();
  }, [connection]);
  return (
    <FileProvider>
      {/* @ts-ignore */}

      <ToastContainer theme="dark" />
      <ModalProvider>
        <JupiterProvider
          connection={connection}
          cluster="mainnet-beta"
          userPublicKey={publicKey}
          platformFeeAndAccounts={platformFeeAndAccounts}
        >
          {children}
        </JupiterProvider>
      </ModalProvider>
    </FileProvider>
  );
};

function Context({ children }: { children: React.ReactNode }) {
  if (endpoint === undefined) {
    throw new Error("Missing NEXT_PUBLIC_RPC in env file");
  }

  return (
    <ConnectionProvider
      endpoint={endpoint}
      config={{
        confirmTransactionInitialTimeout: 120000,
        commitment: "finalized",
      }}
    >
      <WalletProvider>
        <BalanceProvider>
          <>
            <Head>
              <title>🛠️ Pentacle Tools</title>
            </Head>
            <div className="drawer drawer-end">
              <input id="my-drawer" type="checkbox" className="drawer-toggle" />
              <div className="relative h-screen drawer-content lg:ml-64">
                <div className="hidden absolute right-0 top-4 z-50 p-4 lg:inline-block">
                  <WalletMultiButton className="w-full" />
                </div>
                <div className="lg:hidden">
                  <TopMenu />
                </div>
                <ul className="side-menu--desktop">
                  <li>
                    <a
                      href="https://pentacle.xyz"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="hover:bg-opacity-0 focus:bg-opacity-0"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/pentacle.svg"
                        className="mb-6"
                        width={221}
                        height={65}
                        alt="Pentacle"
                      />
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
                      Get NFT Mints
                    </div>
                  </MenuLink>
                  <MenuLink activatesDrawer={false} href="/token-metadata">
                    <div>
                      <i className="mr-3">
                        <InfoIcon />
                      </i>
                      Token Metadata
                    </div>
                  </MenuLink>
                  <MenuLink activatesDrawer={false} href="/holder-snapshot">
                    <i className="inline-block mr-3">
                      <CameraIcon width={16} height={16} />
                    </i>
                    <span> Holder Snapshot</span>
                  </MenuLink>
                  <MenuLink activatesDrawer={false} href="/nft-minters">
                    <i className="inline-block mr-3">
                      <CoinsIcon width={16} height={16} />
                    </i>
                    NFT Minters
                  </MenuLink>
                  <MenuLink activatesDrawer={false} href="/burn-nfts">
                    <i className="mr-3">
                      <FireIcon />
                    </i>
                    <span> Burn NFTs</span>
                  </MenuLink>
                  <MenuLink activatesDrawer={false} href="/mint-nft">
                    <i className="mr-3">
                      <HammerIcon />
                    </i>
                    <span> Mint NFT</span>
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
                    <span> SHDW Drive Console</span>
                  </MenuLink>
                  <MenuLink activatesDrawer={false} href="/shadow-drive/sned">
                    <CloudUploadIcon className="mr-3" width={16} height={16} />
                    SHDW Sned 9000
                  </MenuLink>
                  <MenuLink activatesDrawer={false} href="/shadow-drive/swap">
                    <SwitchHorizontalIcon
                      className="mr-3"
                      width={16}
                      height={16}
                    />
                    <span>SHDW Swap</span>
                  </MenuLink>

                  <li className="px-1">
                    <hr className="my-2 opacity-20"></hr>

                    <div className="flex gap-3 items-center px-2">
                      <DotsHorizontalIcon
                        className="mr-3"
                        width={16}
                        height={16}
                      />
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

                <main
                  className={`relative col-span-2 mt-28 mb-12 lg:col-span-1`}
                  style={{ maxWidth: "100%" }}
                >
                  <div
                    className="px-6 mx-auto max-w-full"
                    style={{ width: 1200 }}
                  >
                    {children}
                  </div>
                </main>
                <div className="hidden fixed right-6 bottom-6 text-center xl:block">
                  RPC powered by
                  <a
                    href="https://twitter.com/GenesysGo"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="mx-auto w-16"
                      src={ImageURI.GenesysGo}
                      alt="Genesysgo"
                    />
                  </a>
                </div>
              </div>

              <SideMenu />
            </div>
          </>
        </BalanceProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Context>
      <Providers>
        {/* <div className="mb-8 alert">
          <div className="block">
            Hello dear creator! pentacle.tools is a fully open-source and free
            website with MIT license. Feel free to use and modify at will, link
            can be found in the menu. Contrary to the belief of many this is a
            one-man effort with zero funding, if it helps you, consider donating
            to{" "}
            <span className="inline">
              <CopyToClipboard
                text={"lolfees.sol"}
                onCopy={() =>
                  toast("Copied to clipboard!", {
                    autoClose: 2000,
                  })
                }
              >
                <span className={`ml-1 cursor-pointer`}>lolfees.sol</span>
              </CopyToClipboard>
            </span>
          </div>
        </div> */}
        <PerformanceProvider>
          {/* @ts-ignore */}
          <Component {...pageProps} />

          <hr className="mt-8 opacity-10" />

          <div className="mt-auto w-full">
            <div
              className={`flex flex-row gap-4 justify-center items-center mt-6 text-center`}
            >
              <MadeWithLove />
            </div>
          </div>
        </PerformanceProvider>
      </Providers>
    </Context>
  );
}
export default MyApp;
