import { Blockchain } from './models/blockchain';
import { BLOCKCHAIN_NAME } from './models/BLOCKCHAIN_NAME';
export declare class BlockchainsInfo {
    static readonly blockchains: ReadonlyArray<Blockchain>;
    static getBlockchainById(chainId: string | number): Blockchain | undefined;
    static getBlockchainByName(blockchainName: BLOCKCHAIN_NAME): Blockchain;
}
