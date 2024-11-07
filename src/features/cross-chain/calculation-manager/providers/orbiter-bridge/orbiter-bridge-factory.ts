import {
    BlockchainName,
    EvmBlockchainName,
    TronBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import {
    OrbiterGetGasDataParams,
    OrbiterTradeParams
} from 'src/features/cross-chain/calculation-manager/providers/orbiter-bridge/models/orbiter-bridge-trade-types';
import { OrbiterEvmBridgeTrade } from 'src/features/cross-chain/calculation-manager/providers/orbiter-bridge/networks/orbiter-evm-bridge-trade';
import { OrbiterTronBridgeTrade } from 'src/features/cross-chain/calculation-manager/providers/orbiter-bridge/networks/orbiter-tron-bridge-trade';

export class OrbiterBridgeFactory {
    public static createTrade(
        params: OrbiterTradeParams<TronBlockchainName | EvmBlockchainName>
    ): OrbiterTronBridgeTrade | OrbiterEvmBridgeTrade {
        const fromBlockchain = params.crossChainTrade.from.blockchain;
        if (BlockchainsInfo.isTronBlockchainName(fromBlockchain)) {
            return new OrbiterTronBridgeTrade(params as OrbiterTradeParams<TronBlockchainName>);
        }

        if (BlockchainsInfo.isEvmBlockchainName(fromBlockchain)) {
            return new OrbiterEvmBridgeTrade(params as OrbiterTradeParams<EvmBlockchainName>);
        }
        throw new Error('Can not create trade instance');
    }

    public static async getGasData(
        calculateGas: boolean,
        params: OrbiterGetGasDataParams<BlockchainName>
    ): Promise<GasData | null> {
        if (calculateGas) {
            const fromBlockchain = params.fromToken.blockchain;
            if (BlockchainsInfo.isEvmBlockchainName(fromBlockchain)) {
                return OrbiterEvmBridgeTrade.getGasData(
                    params as OrbiterGetGasDataParams<EvmBlockchainName>
                );
            }
        }
        return null;
    }
}
