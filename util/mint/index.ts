import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  MintLayout,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createInitializeMintInstruction,
} from "@solana/spl-token-v2";
import {
  Data,
  CreateMetadataArgs,
  CreateMasterEditionArgs,
  METADATA_SCHEMA as SERIALIZE_SCHEMA,
} from "./schema";
import { serialize } from "borsh";
import {
  createMetadataInstruction,
  createMasterEditionInstruction,
} from "./utils";
import BN from "bn.js";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { METADATA_PROGRAM_ID } from "../accounts";
import { sleep } from "../sleep";
export async function mintNFT(
  connection: Connection,
  wallet: WalletContextState,
  data: Data
): Promise<string> {
  const { publicKey } = wallet;
  try {
    const mint = new Keypair();

    // Allocate memory for the account
    const mintRent = await connection.getMinimumBalanceForRentExemption(
      MintLayout.span
    );

    // Create mint account
    const createMintAccountIx = SystemProgram.createAccount({
      fromPubkey: publicKey,
      newAccountPubkey: mint.publicKey,
      lamports: mintRent,
      space: MintLayout.span,
      programId: TOKEN_PROGRAM_ID,
    });

    // Initalize mint ix
    // Creator keypair is mint and freeze authority
    const initMintIx = createInitializeMintInstruction(
      mint.publicKey,
      0,
      publicKey,
      null
    );

    // Derive associated token account for user
    const assoc = await getAssociatedTokenAddress(
      mint.publicKey,
      publicKey,
      false
    ).catch();

    // Create associated account for user
    const createAssocTokenAccountIx = createAssociatedTokenAccountInstruction(
      publicKey,
      assoc,
      publicKey,
      mint.publicKey
    );

    // Create mintTo ix; mint to user's associated account
    const mintToIx = createMintToInstruction(
      mint.publicKey,
      assoc,
      publicKey, // Mint authority
      1,
      [] // No multi-sign signers
    );

    // Derive metadata account
    const metadataSeeds = [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      mint.publicKey.toBuffer(),
    ];
    const [metadataAccount, _pda] = await PublicKey.findProgramAddress(
      metadataSeeds,
      METADATA_PROGRAM_ID
    ).catch();

    // Derive Master Edition account
    const masterEditionSeeds = [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      mint.publicKey.toBuffer(),
      Buffer.from("edition"),
    ];
    const [masterEditionAccount,  _] = await PublicKey.findProgramAddress(
      masterEditionSeeds,
      METADATA_PROGRAM_ID
    ).catch();

    let buffer = Buffer.from(
      serialize(
        SERIALIZE_SCHEMA,
        new CreateMetadataArgs({ data, isMutable: true })
      )
    );

    // Create metadata account ix
    const createMetadataIx = createMetadataInstruction(
      metadataAccount,
      mint.publicKey,
      publicKey,
      publicKey,
      publicKey,
      buffer
    );

    buffer = Buffer.from(
      serialize(
        SERIALIZE_SCHEMA,
        new CreateMasterEditionArgs({ maxSupply: new BN(0) })
      )
    );

    const createMasterEditionIx = createMasterEditionInstruction(
      metadataAccount,
      masterEditionAccount,
      mint.publicKey,
      publicKey,
      publicKey,
      publicKey,
      buffer
    );
    let blockhash;
    while (!blockhash) {
      try {
        blockhash = (await connection.getLatestBlockhash()).blockhash;
      } catch (e) {
        console.log(e);
        await sleep(1000);
      }
    }

    let tx = new Transaction({
      recentBlockhash: blockhash,
      feePayer: publicKey,
    })
      .add(createMintAccountIx)
      .add(initMintIx)
      .add(createAssocTokenAccountIx)
      .add(mintToIx)
      .add(createMetadataIx)
      .add(createMasterEditionIx);

    await tx.sign(mint);

    const txId = await wallet.sendTransaction(tx, connection);
    return txId;
  } catch (e) {
    console.log(e);

    return "failed";
  }
}
