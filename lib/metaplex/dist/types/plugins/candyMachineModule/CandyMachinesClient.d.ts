import type { PublicKey } from '@solana/web3.js';
import type { Metaplex } from "../../Metaplex";
import { CreateCandyMachineInput, CreateCandyMachineInputWithoutConfigs, CreateCandyMachineOutput } from './createCandyMachine';
import { Task } from "../../utils";
import { CandyMachine } from './CandyMachine';
import { CandyMachineJsonConfigs } from './CandyMachineJsonConfigs';
import { FindCandyMachineByAddressInput } from './findCandyMachineByAddress';
import { FindCandyMachinesByPublicKeyFieldInput } from './findCandyMachinesByPublicKeyField';
import { UpdateCandyMachineInput, UpdateCandyMachineInputWithoutConfigs, UpdateCandyMachineOutput } from './updateCandyMachine';
import { InsertItemsToCandyMachineInput, InsertItemsToCandyMachineOutput } from './insertItemsToCandyMachine';
import { CandyMachinesBuildersClient } from './CandyMachinesBuildersClient';
export declare class CandyMachinesClient {
    readonly metaplex: Metaplex;
    constructor(metaplex: Metaplex);
    builders(): CandyMachinesBuildersClient;
    create(input: CreateCandyMachineInput): Task<CreateCandyMachineOutput & {
        candyMachine: CandyMachine;
    }>;
    createFromJsonConfig(input: CreateCandyMachineInputWithoutConfigs & {
        json: CandyMachineJsonConfigs;
    }): Task<CreateCandyMachineOutput & {
        candyMachine: Readonly<{
            model: "candyMachine";
            address: PublicKey;
            authorityAddress: PublicKey;
            walletAddress: PublicKey;
            tokenMintAddress: import("../../utils").Option<PublicKey>;
            uuid: string;
            price: import("../..").Amount;
            symbol: string;
            sellerFeeBasisPoints: number;
            isMutable: boolean;
            retainAuthority: boolean;
            goLiveDate: import("../../utils").Option<import("../..").DateTime>;
            maxEditionSupply: import("../..").BigNumber;
            items: Readonly<{
                name: string;
                uri: string;
            }>[];
            itemsAvailable: import("../..").BigNumber;
            itemsMinted: import("../..").BigNumber;
            itemsRemaining: import("../..").BigNumber;
            itemsLoaded: import("../..").BigNumber;
            isFullyLoaded: boolean;
            endSettings: import("../../utils").Option<import("./CandyMachine").EndSettings>;
            hiddenSettings: import("../../utils").Option<import("./CandyMachine").HiddenSettings>;
            whitelistMintSettings: import("../../utils").Option<import("./CandyMachine").WhitelistMintSettings>;
            gatekeeper: import("../../utils").Option<import("./CandyMachine").Gatekeeper>;
            creators: Readonly<{
                address: PublicKey;
                verified: boolean;
                share: number;
            }>[];
        }>;
    }, []>;
    findAllByWallet(wallet: PublicKey, options?: Omit<FindCandyMachinesByPublicKeyFieldInput, 'type' | 'publicKey'>): Task<CandyMachine[]>;
    findAllByAuthority(authority: PublicKey, options?: Omit<FindCandyMachinesByPublicKeyFieldInput, 'type' | 'publicKey'>): Task<CandyMachine[]>;
    findByAddress(address: PublicKey, options?: Omit<FindCandyMachineByAddressInput, 'type' | 'publicKey'>): Task<CandyMachine>;
    insertItems(candyMachine: CandyMachine, input: Omit<InsertItemsToCandyMachineInput, 'candyMachine'>): Task<InsertItemsToCandyMachineOutput & {
        candyMachine: CandyMachine;
    }>;
    update(candyMachine: CandyMachine, input: Omit<UpdateCandyMachineInput, 'candyMachine'>): Task<UpdateCandyMachineOutput & {
        candyMachine: CandyMachine;
    }>;
    updateFromJsonConfig(candyMachine: CandyMachine, input: Omit<UpdateCandyMachineInputWithoutConfigs, 'candyMachine'> & {
        json: CandyMachineJsonConfigs;
    }): Task<UpdateCandyMachineOutput & {
        candyMachine: Readonly<{
            model: "candyMachine";
            address: PublicKey;
            authorityAddress: PublicKey;
            walletAddress: PublicKey;
            tokenMintAddress: import("../../utils").Option<PublicKey>;
            uuid: string;
            price: import("../..").Amount;
            symbol: string;
            sellerFeeBasisPoints: number;
            isMutable: boolean;
            retainAuthority: boolean;
            goLiveDate: import("../../utils").Option<import("../..").DateTime>;
            maxEditionSupply: import("../..").BigNumber;
            items: Readonly<{
                name: string;
                uri: string;
            }>[];
            itemsAvailable: import("../..").BigNumber;
            itemsMinted: import("../..").BigNumber;
            itemsRemaining: import("../..").BigNumber;
            itemsLoaded: import("../..").BigNumber;
            isFullyLoaded: boolean;
            endSettings: import("../../utils").Option<import("./CandyMachine").EndSettings>;
            hiddenSettings: import("../../utils").Option<import("./CandyMachine").HiddenSettings>;
            whitelistMintSettings: import("../../utils").Option<import("./CandyMachine").WhitelistMintSettings>;
            gatekeeper: import("../../utils").Option<import("./CandyMachine").Gatekeeper>;
            creators: Readonly<{
                address: PublicKey;
                verified: boolean;
                share: number;
            }>[];
        }>;
    }, []>;
}
