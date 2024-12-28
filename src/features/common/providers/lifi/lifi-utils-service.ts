import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
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
        _fromBlockchain: LifiCrossChainSupportedBlockchain,
        toBlockchain: LifiCrossChainSupportedBlockchain,
        fromAddress: string,
        receiverAddress: string | undefined
    ): string {
        if (receiverAddress) {
            return receiverAddress;
        }

        const toChainType = BlockchainsInfo.getChainType(toBlockchain);

        if (toChainType === CHAIN_TYPE.EVM) {
            return FAKE_WALLET_ADDRESS;
        }
        if (toBlockchain === BLOCKCHAIN_NAME.SOLANA) {
            return FAKE_SOLANA_WALLET_ADDRESS;
        }
        // if (toBlockchain === BLOCKCHAIN_NAME.BITCOIN) {
        //     return FAKE_BITCOIN_ADDRESS;
        // }

        return fromAddress;
    }

    public static getLifiChainId(blockchain: BlockchainName): number | string {
        if (blockchain === BLOCKCHAIN_NAME.SOLANA) {
            return this.SOLANA_CHAIN_ID;
        }
        if (blockchain === BLOCKCHAIN_NAME.BITCOIN) {
            return '20000000000001';
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
        if (blockchain === BLOCKCHAIN_NAME.BITCOIN) {
            return 'bitcoin';
        }

        return tokenAddress;
    }
}
