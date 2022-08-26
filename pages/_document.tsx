import Document, { Html, Head, Main, NextScript } from "next/document";
import { ImageURI } from "../util/image-uri";

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          {/* eslint-disable-next-line @next/next/no-title-in-document-head */}
          <meta name="description" content="Solana Tools" />
          <link
            rel="icon"
            href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⭐</text></svg>"
          />
          <meta name="twitter:card" content="summary_large_image" />
          <meta property="og:site_name" content="Solana Tools" />
          <meta name="twitter:image" content={'/cs-logo.webp'} />
          <meta
            name="twitter:image:alt"
            content="Solana Tools"
          />
          <meta name="twitter:title" content="Cryptostraps SOL Tools" />
          <meta
            name="twitter:description"
            content="Solana Tools"
          />
          <meta name="og:url" content="https://cryptostraps.tools" />
          <meta name="og:title" content="Solana Tools" />
          <meta name="og:image" content={'/cs-logo.webp'} />
          <meta
            property="og:description"
            content="Solana Tools"
          />
          <html data-theme="dark" />
          <link
            rel="stylesheet"
            href="https://use.typekit.net/aqh6ylh.css"
          ></link>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
