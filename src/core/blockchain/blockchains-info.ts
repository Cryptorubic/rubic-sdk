import { blockchains } from '@core/blockchain/constants/blockchains';
import { Blockchain } from '@core/blockchain/models/blockchain';
import { BlockchainName } from '@core/blockchain/models/blockchain-name';
import BigNumber from 'bignumber.js';

export class BlockchainsInfo {
    public static readonly blockchains: ReadonlyArray<Blockchain> = blockchains;

    public static getBlockchainById(chainId: string | number): Blockchain | undefined {
        const chainIdNumber = new BigNumber(chainId).toNumber();
        return BlockchainsInfo.blockchains.find(blockchain => blockchain.id === chainIdNumber);
    }

    public static getBlockchainByName(blockchainName: BlockchainName): Blockchain {
        return BlockchainsInfo.blockchains.find(blockchain => blockchain.name === blockchainName)!;
    }
}
