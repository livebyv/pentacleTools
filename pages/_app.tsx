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
import SwitchHorizontalIcon from "@heroicons/react/solid/SwitchHorizontalIcon";
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
      const feeAccs = await getPlatformFeeAccounts(
        connection,
        new PublicKey("9B9bvFT5JSFfGRcx4fTX1cpiiHMLAZn5vzUSTKnRtxLL") // The platform fee account owner
      );
      setPlatformFeeAndAccounts({
        feeBps: 50,
        feeAccounts: feeAccs,
      });
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
              <MenuLink activatesDrawer={false} href="/shadow-drive">
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
                <span> Shadow Drive Console</span>
              </MenuLink>
              <MenuLink activatesDrawer={false} href="/shadow-drive/sned">
                {/*  eslint-disable-next-line @next/next/no-img-element */}
                <CloudUploadIcon className="mr-3" width={16} height={16} />
                SHDW Sned 9000
              </MenuLink>
              <MenuLink activatesDrawer={false} href="/shadow-drive/swap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <SwitchHorizontalIcon className="mr-3" width={16} height={16} />
                <span>SHDW Swap</span>
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

              <div className="mt-auto w-full">
                <div
                  className={`flex flex-row gap-4 justify-center items-center mt-6 text-center`}
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

                <div className="flex justify-center items-center my-2 w-full">
                  <a
                    className="inline-block mx-auto"
                    href="https://vercel.com?utm_source=madteaparty&utm_campaign=oss"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/1618983297-powered-by-vercel.svg"
                      style={{ width: 120 }}
                      alt="vercel"
                    />
                  </a>
                </div>
              </div>
            </ul>

            <main
              className={`relative col-span-2 mt-28 mb-12 lg:col-span-1`}
              style={{ maxWidth: "100%" }}
            >
              <div className="px-6 mx-auto max-w-full" style={{ width: 1200 }}>
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
      </WalletProvider>
    </ConnectionProvider>
  );
}

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    console.log(`


Thank you to the community, and in special to Pentacle and Nomad for inspiring me to make this site what it is today.
A beloved tool in the Solana community. Most the energy I put into it is largely in tribute to both of you.

Pentacle, you pulled me into the boat and gave me clout. You reminded me of what good UI design means. Thank you, you are the most valuable of friends.
Nomad, you drove me to make this site better and better. To make it the best. It is sometimes still wonky but I am giving her all I got, promise. I wish to meet you one day.
    
Thanks guys. You made a difference. Even if it's just on my small scale.
    
    `);
  }, []);
  return (
    <Context>
      <Providers>
        <PerformanceProvider>
          {/* @ts-ignore */}
          <Component {...pageProps} />

          <div className="mt-8 text-center lg:hidden">
            <a
              className="inline-block mx-auto"
              href="https://vercel.com?utm_source=madteaparty&utm_campaign=oss"
              target="_blank"
              rel="noopener noreferrer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/1618983297-powered-by-vercel.svg"
                style={{ width: 120 }}
                alt=""
              />
            </a>
          </div>
        </PerformanceProvider>
      </Providers>
    </Context>
  );
}
export default MyApp;
