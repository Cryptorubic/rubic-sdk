import {
    BitcoinBlockchainName,
    BlockchainName,
    SolanaBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { BitcoinEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/bitcoin-web3-private/models/bitcoin-encoded-config';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { LifiBitcoinCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/chains/lifi-bitcoin-cross-chain-trade';

import { CrossChainTrade } from '../common/cross-chain-trade';
import { RubicStep } from '../common/models/rubicStep';
import { LifiEvmCrossChainTrade } from './chains/lifi-evm-cross-chain-trade';
import { LifiSolanaCrossChainTrade } from './chains/lifi-solana-cross-chain-trade';
import {
    LifiCrossChainTradeConstructor,
    LifiEvmCrossChainTradeConstructor
} from './models/lifi-cross-chain-trade-constructor';

export class LifiCrossChainFactory {
    public static createTrade(
        fromBlockchain: BlockchainName,
        constructorParams: LifiCrossChainTradeConstructor<BlockchainName>,
        providerAddress: string,
        routePath: RubicStep[],
        useProxy: boolean
    ): CrossChainTrade<EvmEncodeConfig | { data: string } | BitcoinEncodedConfig> {
        if (BlockchainsInfo.isSolanaBlockchainName(fromBlockchain)) {
            return new LifiSolanaCrossChainTrade(
                constructorParams as LifiCrossChainTradeConstructor<SolanaBlockchainName>,
                providerAddress,
                routePath,
                useProxy
            );
        }

        if (BlockchainsInfo.isEvmBlockchainName(fromBlockchain)) {
            return new LifiEvmCrossChainTrade(
                constructorParams as LifiEvmCrossChainTradeConstructor,
                providerAddress,
                routePath,
                useProxy
            );
        }

        if (BlockchainsInfo.isBitcoinBlockchainName(fromBlockchain)) {
            return new LifiBitcoinCrossChainTrade(
                constructorParams as LifiCrossChainTradeConstructor<BitcoinBlockchainName>,
                providerAddress,
                routePath,
                false
            );
        }

        throw new Error('Can not create trade instance');
    }
}
