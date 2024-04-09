import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { CrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { DebridgeEvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/chains/debridge-evm-cross-chain-trade';
import { DebridgeSolanaCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/chains/debridge-solana-cross-chain-trade';
import {
    DebridgeCrossChainTradeConstructor,
    DebridgeEvmCrossChainTradeConstructor,
    DebridgeSolanaCrossChainTradeConstructor
} from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/debridge-cross-chain-trade-constructor';

export class DebridgeCrossChainFactory {
    public static createTrade(
        fromBlockchain: BlockchainName,
        constructorParams: DebridgeCrossChainTradeConstructor<BlockchainName>,
        providerAddress: string,
        routePath: RubicStep[]
    ): CrossChainTrade<EvmEncodeConfig | { data: string }> {
        if (BlockchainsInfo.isSolanaBlockchainName(fromBlockchain)) {
            return new DebridgeSolanaCrossChainTrade(
                constructorParams as DebridgeSolanaCrossChainTradeConstructor,
                providerAddress,
                routePath
            );
        }

        if (BlockchainsInfo.isEvmBlockchainName(fromBlockchain)) {
            return new DebridgeEvmCrossChainTrade(
                constructorParams as DebridgeEvmCrossChainTradeConstructor,
                providerAddress,
                routePath
            );
        }
        throw new Error('Can not create trade instance');
    }
}
