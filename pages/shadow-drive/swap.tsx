import Head from "next/head";
import JupiterForm from "../../components/jupiter-swap";
import { BalanceProvider, useBalance } from "../../contexts/BalanceProvider";
import { ImageURI } from "../../util/image-uri";

function ShdwSwapPage() {
  const { shdwBalance, solBalance } = useBalance();

  return (
    <>
      <Head>
        <title>🛠️ Pentacle Tools - SHDW Swap</title>
      </Head>
      <div className="mb-3 max-w-full text-center">
        <h1 className="text-4xl text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ImageURI.GenesysGo}
            alt=""
            className="mr-3"
            style={{
              width: 48,
              height: 48,
              display: "inline",
            }}
          />
        SHDW Swap
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ImageURI.GenesysGo}
            alt=""
            className="ml-3"
            style={{
              width: 48,
              height: 48,
              display: "inline",
            }}
          />
        </h1>
        {!!shdwBalance && (
          <div className="mt-3">
            <span className="badge badge-success">{shdwBalance} SHDW</span>
            <span className="ml-3 badge badge-primary">{solBalance} SOL</span>
          </div>
        )}
        <hr className="my-4 opacity-10" />
      </div>
      <JupiterForm />
    </>
  );
}

const Wrapped = () => {
  return (
    <BalanceProvider>
      <ShdwSwapPage />
    </BalanceProvider>
  );
};

export default Wrapped;
