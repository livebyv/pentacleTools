import base58 from "bs58";
import { deserializeUnchecked, BinaryReader, BinaryWriter } from "borsh";
import { Connection, PublicKey } from "@solana/web3.js";
import { from, map, mergeMap, tap, toArray } from "rxjs";
import { METADATA_PROGRAM_ID } from "./accounts";
import { toPublicKey } from "./to-publickey";

export const METADATA_PREFIX = "metadata";

class Creator {
  address: PublicKey;
  verified: boolean;
  share: number;

  constructor(args: { address: PublicKey; verified: boolean; share: number }) {
    this.address = args.address;
    this.verified = args.verified;
    this.share = args.share;
  }
}

enum MetadataKey {
  Uninitialized = 0,
  MetadataV1 = 4,
  EditionV1 = 1,
  MasterEditionV1 = 2,
  MasterEditionV2 = 6,
  EditionMarker = 7,
}

class Data {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators: Creator[] | null;
  constructor(args: {
    name: string;
    symbol: string;
    uri: string;
    sellerFeeBasisPoints: number;
    creators: Creator[] | null;
  }) {
    this.name = args.name;
    this.symbol = args.symbol;
    this.uri = args.uri;
    this.sellerFeeBasisPoints = args.sellerFeeBasisPoints;
    this.creators = args.creators;
  }
}

class Metadata {
  key: MetadataKey;
  updateAuthority: PublicKey;
  mint: PublicKey;
  data: Data;
  primarySaleHappened: boolean;
  isMutable: boolean;
  masterEdition?: PublicKey;
  edition?: PublicKey;
  constructor(args: {
    updateAuthority: PublicKey;
    mint: PublicKey;
    data: Data;
    primarySaleHappened: boolean;
    isMutable: boolean;
    masterEdition?: PublicKey;
  }) {
    this.key = MetadataKey.MetadataV1;
    this.updateAuthority = args.updateAuthority;
    this.mint = args.mint;
    this.data = args.data;
    this.primarySaleHappened = args.primarySaleHappened;
    this.isMutable = args.isMutable;
  }
}

export type StringPublicKey = string;

const METADATA_SCHEMA = new Map<any, any>([
  [
    Data,
    {
      kind: "struct",
      fields: [
        ["name", "string"],
        ["symbol", "string"],
        ["uri", "string"],
        ["sellerFeeBasisPoints", "u16"],
        ["creators", { kind: "option", type: [Creator] }],
      ],
    },
  ],
  [
    Creator,
    {
      kind: "struct",
      fields: [
        ["address", [32]],
        ["verified", "u8"],
        ["share", "u8"],
      ],
    },
  ],
  [
    Metadata,
    {
      kind: "struct",
      fields: [
        ["key", "u8"],
        ["updateAuthority", [32]],
        ["mint", [32]],
        ["data", Data],
        ["primarySaleHappened", "u8"],
        ["isMutable", "u8"],
      ],
    },
  ],
]);

const findProgramAddress = async (
  seeds: (Buffer | Uint8Array)[],
  programId: PublicKey
) => {
  const result = await PublicKey.findProgramAddress(seeds, programId);
  return [result[0].toBase58(), result[1]] as [string, number];
};

const decodeMetadata = (buffer: Buffer): Metadata => {
  const metadata = deserializeUnchecked(
    METADATA_SCHEMA,
    Metadata,
    buffer
  ) as Metadata;

  metadata.data.name = metadata.data.name.replace(/\0/g, "");
  metadata.data.symbol = metadata.data.symbol.replace(/\0/g, "");
  metadata.data.uri = metadata.data.uri.replace(/\0/g, "");
  metadata.data.name = metadata.data.name.replace(/\0/g, "");
  return metadata;
};

const extendBorsh = () => {
  (BinaryReader.prototype as any).readPubkey = function () {
    const reader = this as unknown as BinaryReader;
    const array = reader.readFixedArray(32);
    return toPublicKey(array);
  };

  (BinaryWriter.prototype as any).writePubkey = function (value: any) {
    const writer = this as unknown as BinaryWriter;
    writer.writeFixedArray(value.toBuffer());
  };

  (BinaryReader.prototype as any).readPubkeyAsString = function () {
    const reader = this as unknown as BinaryReader;
    const array = reader.readFixedArray(32);
    return base58.encode(array) as StringPublicKey;
  };

  (BinaryWriter.prototype as any).writePubkeyAsString = function (
    value: StringPublicKey
  ) {
    const writer = this as unknown as BinaryWriter;
    writer.writeFixedArray(base58.decode(value));
  };
};

extendBorsh();

async function getMetadata(pubkey: PublicKey, connection: Connection) {
  let metadata;

  try {
    const metadataPromise = await fetchMetadataFromPDA(pubkey, connection);

    if (metadataPromise && metadataPromise.data.length > 0) {
      metadata = decodeMetadata(metadataPromise.data);
    }
  } catch (e) {
    console.log(e);
  }

  return metadata;
}

async function getMetadataKey(
  tokenMint: StringPublicKey
): Promise<StringPublicKey> {
  return (
    await findProgramAddress(
      [
        Buffer.from(METADATA_PREFIX),
        METADATA_PROGRAM_ID.toBuffer(),
        toPublicKey(tokenMint).toBuffer(),
      ],
      METADATA_PROGRAM_ID
    )
  )[0];
}

async function fetchMetadataFromPDA(pubkey: PublicKey, connection: Connection) {
  const metadataKey = await getMetadataKey(pubkey.toBase58());
  const metadataInfo = await connection.getAccountInfo(
    toPublicKey(metadataKey)
  );

  return metadataInfo;
}

let mints = [];
const fetchOneMeta = async (
  key: string,
  setCounter: Function,
  connection: Connection
): Promise<unknown> => {
  const tokenMetadata = await getMetadata(toPublicKey(key), connection);
  if (!tokenMetadata?.data?.uri) {
    mints.push({
      mint: key,
      failed: true,
      message: "no associated metadata found",
    });
    return Promise.resolve();
  }
  const arweaveData = await fetch(tokenMetadata.data.uri)
    .then((res) => res.json().catch())
    .catch(() => {
      mints.push({ tokenMetadata, failed: true });
    });
  setCounter(mints.length);
  mints.push({
    tokenData: {
      ...tokenMetadata.data,
      creators: tokenMetadata.data?.creators?.map((d) => {
        return {
          share: d.share,
          address: d.address,
          verified: !!d.verified,
        };
      }),
    },
    metadata: arweaveData,
    mint: key,
  });
};

export const fetchMetaForUI = (
  tokens: string[],
  setCounter: (a: any) => void,
  connection: Connection
) => {
  return from(tokens).pipe(
    mergeMap((id) => fetchOneMeta(id, setCounter, connection), 10),
    toArray(),
    map(() =>
      [...mints.filter((m) => !m.failed)].sort((a, b) => {
        try {
          const aAddress = a.tokenData?.creators?.find(
            (c) => c.verified
          )?.address;
          const bAddress = b.tokenData?.creators?.find(
            (c) => c.verified
          )?.address;
          const parsedAAddress =
            typeof aAddress === "string"
              ? aAddress
              : aAddress instanceof Uint8Array
              ? toPublicKey(aAddress).toBase58()
              : "";
          const parsedBAddress =
            typeof bAddress === "string"
              ? bAddress
              : bAddress instanceof Uint8Array
              ? toPublicKey(bAddress).toBase58()
              : "";
          return parsedAAddress.localeCompare(parsedBAddress);
        } catch (e) {
          console.log(e);
          debugger;
        }
      })
    ),
    tap(() => (mints = []))
  );
};
