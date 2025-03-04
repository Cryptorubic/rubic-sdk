import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { OpenOceanEvmTrade } from 'src/features/on-chain/calculation-manager/providers/aggregators/open-ocean/chains/open-ocean-evm-trade';
import { OpenOceanSuiTrade } from 'src/features/on-chain/calculation-manager/providers/aggregators/open-ocean/chains/open-ocean-sui-trade';
import { OpenOceanEvmTradeStruct } from 'src/features/on-chain/calculation-manager/providers/aggregators/open-ocean/models/open-ocean-evm-trade-struct';
import { OpenOceanSuiTradeStruct } from 'src/features/on-chain/calculation-manager/providers/aggregators/open-ocean/models/open-ocean-sui-trade-struct';

import { OnChainTrade } from '../../common/on-chain-trade/on-chain-trade';

export class OpenOceanOnChainFactory {
    public static createTrade(
        fromBlockchain: BlockchainName,
        tradeStruct: OpenOceanEvmTradeStruct | OpenOceanSuiTradeStruct,
        providerAddress: string
    ): OnChainTrade {
        if (BlockchainsInfo.isSuiBlockchainName(fromBlockchain)) {
            return new OpenOceanSuiTrade(tradeStruct as OpenOceanSuiTradeStruct, providerAddress);
        }

        if (BlockchainsInfo.isEvmBlockchainName(fromBlockchain)) {
            return new OpenOceanEvmTrade(tradeStruct as OpenOceanEvmTradeStruct, providerAddress);
        }
        throw new Error('Can not create trade instance');
    }
}
