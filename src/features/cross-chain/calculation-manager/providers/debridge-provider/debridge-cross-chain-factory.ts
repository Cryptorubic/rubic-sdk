import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
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
    ): CrossChainTrade {
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

    public static getFakeReceiver(blockchain: BlockchainName): string {
        const type = BlockchainsInfo.getChainType(blockchain);
        if (type === CHAIN_TYPE.EVM) {
            return '0xe388Ed184958062a2ea29B7fD049ca21244AE02e';
        }
        if (type === CHAIN_TYPE.SOLANA) {
            return 'HZgssrdZjBdypDux7tHWWDZ7hF7hhwUXN445t85GaoQT';
        }
        throw new Error('Chain type is not supported');
    }
}
