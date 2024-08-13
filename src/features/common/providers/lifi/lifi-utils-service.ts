import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import {
    FAKE_SOLANA_WALLET_ADDRESS,
    FAKE_WALLET_ADDRESS
} from 'src/features/common/constants/fake-wallet-address';

import { LifiCrossChainSupportedBlockchain } from '../../../cross-chain/calculation-manager/providers/lifi-provider/constants/lifi-cross-chain-supported-blockchain';

export class LifiUtilsService {
    private static readonly SOLANA_CHAIN_ID = 'SOL';

    private static readonly SOLANA_NATIVE_TOKEN_ADDRESS = '11111111111111111111111111111111';

    public static getLifiReceiverAddress(
        fromBlockchain: LifiCrossChainSupportedBlockchain,
        toBlockchain: LifiCrossChainSupportedBlockchain,
        fromAddress: string,
        receiverAddress: string | undefined
    ): string {
        if (receiverAddress) {
            return receiverAddress;
        }

        if (fromBlockchain === BLOCKCHAIN_NAME.SOLANA) {
            return FAKE_WALLET_ADDRESS;
        }
        if (toBlockchain === BLOCKCHAIN_NAME.SOLANA) {
            return FAKE_SOLANA_WALLET_ADDRESS;
        }

        return fromAddress;
    }

    public static getLifiChainId(blockchain: BlockchainName): number | string {
        if (blockchain === BLOCKCHAIN_NAME.SOLANA) {
            return this.SOLANA_CHAIN_ID;
        }
        return blockchainId[blockchain];
    }

    public static getLifiTokenAddress(
        blockchain: BlockchainName,
        isNative: boolean,
        tokenAddress: string
    ): string {
        if (blockchain === BLOCKCHAIN_NAME.SOLANA && isNative) {
            return this.SOLANA_NATIVE_TOKEN_ADDRESS;
        }

        return tokenAddress;
    }
}
