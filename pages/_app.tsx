import "../styles/globals.css";

import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { AppProps } from "next/app";
import dynamic from "next/dynamic";
import Head from "next/head";
import React, { useEffect } from "react";

import { AlertProvider, useAlert } from "../contexts/AlertProvider";
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
const endpoint = process.env.NEXT_PUBLIC_RPC;

const WalletProvider = dynamic(
  () => import("../contexts/ClientWalletProvider"),
  {
    ssr: false,
  }
);

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <FileProvider>
      {/* @ts-ignore */}
      <WalletProvider>
        <AlertProvider>
          <ModalProvider>{children}</ModalProvider>
        </AlertProvider>
      </WalletProvider>
    </FileProvider>
  );
};

function Context({ children }: { children: React.ReactNode }) {
  const { setAlertState } = useAlert();
  if (endpoint === undefined) {
    throw new Error('Missing NEXT_PUBLIC_RPC in env file');
  }

  return (
    <ConnectionProvider
      endpoint={endpoint}
      config={{
        confirmTransactionInitialTimeout: 120000,
        commitment: 'finalized'
      }}
    >
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
          <ul className="hidden overflow-y-auto relative top-0 bottom-0 left-0 p-4 space-y-2 w-64 lg:inline-block lg:fixed menu bg-base-300 text-base-content">
            <li>
              <a
                href="https://pentacle.xyz"
                target="_blank"
                rel="noreferrer noopener"
                className="hover:bg-opacity-0 focus:bg-opacity-0"
              >
                <img
                  src="/pentacle.svg"
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
              <img
                src={ImageURI.GenesysGo}
                alt="GenesysGo"
                className="mr-2"
                style={{
                  filter: " grayscale(100%)",
                  width: 16,
                  height: 16,
                  display: "inline",
                }}
              />
              <span> Shadow Drive Console</span>
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
            <MenuLink activatesDrawer={false} href="/arweave-upload">
              <i className="mr-3">
                <img
                  src="https://shdw-drive.genesysgo.net/FihpNAwDm8i6gBsqeZjV9fn8SkkpYFgcWt5BSszPusnq/arweave.png"
                  width={16}
                  height={16}
                />
              </i>
              <span>Arweave Upload</span>
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

            <div className="absolute left-0 bottom-4 w-full">
              <div
                className={`flex flex-row gap-4 justify-center items-center text-center`}
              >
                <MadeWithLove />
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
                  <img
                    src="/1618983297-powered-by-vercel.svg"
                    style={{ width: 120 }}
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
              {/* <div className="mb-8 alert alert-warning">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0 w-6 h-6 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span className="ml-3">
                    {" "}
                    Solana has pushed out some changes which affect many of the
                    tools here. Errors are expected.
                    <br/>
                    <strong>There is no support for these tools, they are open source and free to use!</strong>
                  </span>
                </div>
              </div> */}
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
    
    `)
  }, [])
  return (
    <Providers>
      <Context>
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
              <img
                src="/1618983297-powered-by-vercel.svg"
                style={{ width: 120 }}
                alt=""
              />
            </a>
          </div>
        </PerformanceProvider>
      </Context>
    </Providers>
  );
}
export default MyApp;
