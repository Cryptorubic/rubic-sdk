import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import {
    MesonCrossChainEvmTradeConstructorParams,
    MesonGetGasDataParams
} from 'src/features/cross-chain/calculation-manager/providers/meson-provider/models/meson-trade-types';
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

    public static async getGasData(
        calculateGas: boolean,
        params: MesonGetGasDataParams<BlockchainName>
    ): Promise<GasData | null> {
        if (calculateGas) {
            const fromBlockchain = params.from.blockchain;

            if (BlockchainsInfo.isEvmBlockchainName(fromBlockchain)) {
                return MesonCrossChainEvmTrade.getGasData(
                    params as MesonGetGasDataParams<EvmBlockchainName>
                );
            }
        }
        return null;
    }
}
