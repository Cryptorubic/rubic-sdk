import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { MesonCrossChainEvmTradeConstructorParams } from 'src/features/cross-chain/calculation-manager/providers/meson-provider/models/meson-trade-types';
import { MesonCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/meson-provider/networks/meson-cross-chain-evm-trade';

export class MesonCrossChainFactory {
    public static createTrade(
        params: MesonCrossChainEvmTradeConstructorParams
    ): MesonCrossChainEvmTrade {
        const fromBlockchain = params.crossChainTrade.from.blockchain;

        if (BlockchainsInfo.isEvmBlockchainName(fromBlockchain)) {
            return new MesonCrossChainEvmTrade(params);
        }
        throw new Error('Can not create trade instance');
    }
}
