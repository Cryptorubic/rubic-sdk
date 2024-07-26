import { BlockchainName, SolanaBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';

import { CrossChainTrade } from '../common/cross-chain-trade';
import { RubicStep } from '../common/models/rubicStep';
import { LifiSolanaCrossChainTrade } from './chains/lifi-solana-cross-chain-trade';
import { LifiCrossChainTrade } from './lifi-cross-chain-trade';
import {
    LifiCrossChainTradeConstructor,
    LifiEvmCrossChainTradeConstructor
} from './models/lifi-cross-chain-trade-constructor';

export class LifiCrossChainFactory {
    public static createTrade(
        fromBlockchain: BlockchainName,
        constructorParams: LifiCrossChainTradeConstructor<BlockchainName>,
        providerAddress: string,
        routePath: RubicStep[]
    ): CrossChainTrade<EvmEncodeConfig | { data: string }> {
        if (BlockchainsInfo.isSolanaBlockchainName(fromBlockchain)) {
            return new LifiSolanaCrossChainTrade(
                constructorParams as LifiCrossChainTradeConstructor<SolanaBlockchainName>,
                providerAddress,
                routePath
            );
        }

        if (BlockchainsInfo.isEvmBlockchainName(fromBlockchain)) {
            return new LifiCrossChainTrade(
                constructorParams as LifiEvmCrossChainTradeConstructor,
                providerAddress,
                routePath
            );
        }
        throw new Error('Can not create trade instance');
    }
}
