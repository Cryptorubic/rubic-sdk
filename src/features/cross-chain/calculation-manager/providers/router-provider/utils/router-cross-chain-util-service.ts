import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { SolanaWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/solana-web3-public/solana-web3-public';
import { TronWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/tron-web3-public';
import { Injector } from 'src/core/injector/injector';

import { RouterCrossChainSupportedBlockchains } from '../constants/router-cross-chain-supported-chains';

export class RouterCrossChainUtilService {
    private static get tronWeb3Public(): TronWeb3Public {
        return Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.TRON);
    }

    private static get solanaWeb3Public(): SolanaWeb3Public {
        return Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.SOLANA);
    }

    public static async checkAndConvertAddress(
        blockchain: RouterCrossChainSupportedBlockchains,
        address: string,
        _tokenAddress?: string
    ): Promise<string> {
        if (blockchain === BLOCKCHAIN_NAME.TRON) {
            const tronHexAddress = await this.tronWeb3Public.convertTronAddressToHex(address);
            return `0x${tronHexAddress.slice(2)}`;
        }

        // if (blockchain === BLOCKCHAIN_NAME.SOLANA && tokenAddress) {
        //     const ataAddress = await this.solanaWeb3Public.getAtaAddress(address, tokenAddress);
        //     return ataAddress!;
        // }

        return address;
    }

    public static getBlockchainId(blockchain: BlockchainName): string {
        if (blockchain === BLOCKCHAIN_NAME.TRON) {
            return '728126428';
        }
        if (blockchain === BLOCKCHAIN_NAME.BITCOIN) {
            return 'bitcoin';
        }
        // if (blockchain === BLOCKCHAIN_NAME.SOLANA) {
        //     return 'solana';
        // }

        return blockchainId[blockchain].toString();
    }
}
