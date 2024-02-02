import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { DlnEvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/chains/dln-evm-on-chain-trade';
import { DlnSolanaOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/chains/dln-solana-on-chain-trade';
import {
    DlnEvmOnChainSupportedBlockchain,
    DlnOnChainSupportedBlockchain,
    DlnSolanaOnChainSupportedBlockchain
} from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/constants/dln-on-chain-supported-blockchains';
import { DlnTradeStruct } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/models/dln-trade-struct';
import { OnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/on-chain-trade';

export class DlnOnChainFactory {
    public static createTrade(
        fromBlockchain: BlockchainName,
        tradeStruct: DlnTradeStruct<DlnOnChainSupportedBlockchain>,
        providerAddress: string
    ): OnChainTrade {
        if (BlockchainsInfo.isSolanaBlockchainName(fromBlockchain)) {
            return new DlnSolanaOnChainTrade(
                tradeStruct as DlnTradeStruct<DlnSolanaOnChainSupportedBlockchain>,
                providerAddress
            );
        }

        if (BlockchainsInfo.isEvmBlockchainName(fromBlockchain)) {
            return new DlnEvmOnChainTrade(
                tradeStruct as DlnTradeStruct<DlnEvmOnChainSupportedBlockchain>,
                providerAddress
            );
        }
        throw new Error('Can not create trade instance');
    }
}
