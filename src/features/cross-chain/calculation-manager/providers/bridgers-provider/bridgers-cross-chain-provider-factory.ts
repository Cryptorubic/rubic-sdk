import {
    BlockchainName,
    EvmBlockchainName,
    TronBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import {
    BridgersCrossChainGasParams,
    BridgersCrossChainParams,
    BridgersEvmCrossChainParams,
    BridgersTronCrossChainParams
} from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/models/bridgers-cross-chain-trade-types';
import { EvmBridgersCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/networks/evm-bridgers-cross-chain-trade';
import { TronBridgersCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/networks/tron-bridgers-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';

export class BridgersCrossChainProviderFactory {
    public static createTrade(
        params: BridgersCrossChainParams<TronBlockchainName | EvmBlockchainName>
    ): EvmBridgersCrossChainTrade | TronBridgersCrossChainTrade {
        const fromBlockchain = params.crossChainTrade.from.blockchain;
        if (BlockchainsInfo.isTronBlockchainName(fromBlockchain)) {
            return new TronBridgersCrossChainTrade(params as BridgersTronCrossChainParams);
        }

        if (BlockchainsInfo.isEvmBlockchainName(fromBlockchain)) {
            return new EvmBridgersCrossChainTrade(params as BridgersEvmCrossChainParams);
        }
        throw new Error('Can not create trade instance');
    }

    public static async getGasData(
        calculateGas: boolean,
        params: BridgersCrossChainGasParams<BlockchainName>
    ): Promise<GasData | null> {
        if (calculateGas) {
            const fromBlockchain = params.from.blockchain;
            if (BlockchainsInfo.isEvmBlockchainName(fromBlockchain)) {
                return EvmBridgersCrossChainTrade.getGasData(
                    params as BridgersCrossChainGasParams<EvmBlockchainName>
                );
            }
        }
        return null;
    }
}
