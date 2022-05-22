import "../styles/globals.css";
import "@fortawesome/fontawesome-free/css/all.css";

import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { tokenAuthFetchMiddleware } from "@strata-foundation/web3-token-auth";
import { AppProps } from "next/app";
import dynamic from "next/dynamic";
import Image from "next/image";
import Head from "next/head";
import React from "react";

import { AlertProvider, useAlert } from "../providers/alert-provider";
import { ModalProvider } from "../providers/modal-provider";
import SideMenu from "../components/side-menu";
import TopMenu from "../components/top-menu";
import { MenuLink } from "../components/menu-link";
import { BundlrProvider } from "../providers/bundlr-provider";
import { ImageURI } from "../util/image-uri";
import { FileProvider } from "../hooks/use-files";
import { MadeWithLove } from "../components/made-with-love";
import { CopyToClipboard } from "../components/copy-to-clipboard";
const endpoint = process.env.NEXT_PUBLIC_RPC!;

const WalletProvider = dynamic(
  () => import("../contexts/ClientWalletProvider"),
  {
    ssr: false,
  }
);

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <FileProvider>
      <WalletProvider>
        <AlertProvider>
          <ModalProvider>
            <BundlrProvider>{children}</BundlrProvider>
          </ModalProvider>
        </AlertProvider>
      </WalletProvider>
    </FileProvider>
  );
};

function Context({ children }: { children: React.ReactNode }) {
  const { setAlertState } = useAlert();

  const fetchMiddleware = tokenAuthFetchMiddleware({
    getToken: async () => {
      const req = await fetch("/api/get-token");
      const { access_token }: { access_token: string } = await req.json();
      return access_token;
    },
  });

  return (
    <ConnectionProvider
      endpoint={endpoint}
      config={{
        confirmTransactionInitialTimeout: 120000,
        fetchMiddleware,
      }}
    >
      <Head>
        <title>🛠️ Pentacle Tools</title>
      </Head>
      <div className="drawer drawer-end">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="h-screen drawer-content lg:ml-64 relative">
          <div className="hidden lg:inline-block p-4 absolute right-0 top-4 z-50">
            <WalletMultiButton className="w-full" />
          </div>
          <div className="lg:hidden">
            <TopMenu />
          </div>
          <ul className="hidden lg:inline-block lg:fixed left-0 top-0 bottom-0 menu p-4 overflow-y-auto w-64 bg-base-300 text-base-content space-y-2 relative">
            <li>
              <a
                href="https://pentacle.xyz"
                target="_blank"
                rel="noreferrer noopener"
                className="hover:bg-opacity-0 focus:bg-opacity-0"
              >
                <Image
                  src="/pentacle.svg"
                  width={221}
                  height={65}
                  alt="Pentacle"
                />
              </a>
            </li>
            <MenuLink activatesDrawer={false} href="/nft-mints">
              <div>
                <i className="fa-solid fa-fingerprint mr-3"></i>
                Get NFT Mints
              </div>
            </MenuLink>
            <MenuLink activatesDrawer={false} href="/token-metadata">
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
            <MenuLink activatesDrawer={false} href="/holder-snapshot">
              <div>
                <i className="fa-solid fa-camera mr-3"></i>
                Holder Snapshot
              </div>
            </MenuLink>
            <MenuLink activatesDrawer={false} href="/nft-minters">
              <i className="fa-solid fa-coins mr-3"></i>
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
              Shadow Drive Viewer
            </MenuLink>
            <MenuLink activatesDrawer={false} href="/burn-nfts">
              <i className="fa-solid fa-fire mr-3"></i>
              Burn NFTs
            </MenuLink>
            <MenuLink activatesDrawer={false} href="/mint-nft">
              <i className="fa-solid fa-hammer mr-3"></i>
              Mint NFT
            </MenuLink>
            <MenuLink activatesDrawer={false} href="/arweave-upload">
              <i className="fa-solid fa-file-arrow-up mr-3"></i>
              Arweave Upload
            </MenuLink>
            <MenuLink activatesDrawer={false} href="/snedmaster">
              <i className="fa-solid fa-hand-holding-dollar mr-3"></i>
              <span>SnedMaster 9000</span>
            </MenuLink>

            <li className="absolute bottom-4 left-0 w-full">
              <div
                className={`text-center flex items-center justify-center flex-row gap-4`}
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
                    <span className={`cursor-pointer ml-1`}>
                      Donations: lolfees.sol
                    </span>
                  </CopyToClipboard>
                </div>
              </div>
            </li>
          </ul>

          <main
            className={`my-28 px-3 lg:col-span-1 col-span-2 relative`}
            style={{ maxWidth: "100%" }}
          >
            <div className="mx-auto" style={{ maxWidth: "100%", width: 800 }}>
              {/* <div className="alert alert-warning mb-8">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current flex-shrink-0 h-6 w-6"
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
          <div className="text-center fixed right-6 bottom-6 hidden xl:block">
            RPC powered by
            <a
              href="https://twitter.com/GenesysGo"
              target="_blank"
              rel="noreferrer noopener"
            >
              <img
                className="w-16 mx-auto"
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
  return (
    <Providers>
      <Context>
        <Component {...pageProps} />
      </Context>
    </Providers>
  );
}
export default MyApp;
