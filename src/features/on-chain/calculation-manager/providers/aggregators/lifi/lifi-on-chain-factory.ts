import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';

import { OnChainTrade } from '../../common/on-chain-trade/on-chain-trade';
import { LifiEvmOnChainTrade } from './chains/lifi-evm-on-chain-trade';
import { LifiSolanaOnChainTrade } from './chains/lifi-solana-on-chain-trade';
import {
    LifiEvmOnChainTradeStruct,
    LifiSolanaOnChainTradeStruct
} from './models/lifi-trade-struct';

export class LifiOnChainFactory {
    public static createTrade(
        fromBlockchain: BlockchainName,
        tradeStruct: LifiEvmOnChainTradeStruct | LifiSolanaOnChainTradeStruct,
        providerAddress: string
    ): OnChainTrade {
        if (BlockchainsInfo.isSolanaBlockchainName(fromBlockchain)) {
            return new LifiSolanaOnChainTrade(
                tradeStruct as LifiSolanaOnChainTradeStruct,
                providerAddress
            );
        }

        if (BlockchainsInfo.isEvmBlockchainName(fromBlockchain)) {
            return new LifiEvmOnChainTrade(
                tradeStruct as LifiEvmOnChainTradeStruct,
                providerAddress
            );
        }
        throw new Error('Can not create trade instance');
    }
}
