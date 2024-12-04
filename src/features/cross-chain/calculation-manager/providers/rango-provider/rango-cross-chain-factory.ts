import {
    BitcoinBlockchainName,
    BlockchainName,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { BitcoinEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/bitcoin-web3-private/models/bitcoin-encoded-config';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { RangoBitcoinCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/rango-provider/chains/rango-bitcoin-cross-chain-trade';
import { RangoEvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/rango-provider/chains/rango-evm-cross-chain-trade';
import { RangoCrossChainTradeConstructorParams } from 'src/features/cross-chain/calculation-manager/providers/rango-provider/model/rango-cross-chain-parser-types';

import { CrossChainTrade } from '../common/cross-chain-trade';

export class RangoCrossChainFactory {
    public static createTrade(
        fromBlockchain: BlockchainName,
        constructorParams: RangoCrossChainTradeConstructorParams<BlockchainName>
    ): CrossChainTrade<EvmEncodeConfig | BitcoinEncodedConfig> {
        if (BlockchainsInfo.isEvmBlockchainName(fromBlockchain)) {
            return new RangoEvmCrossChainTrade(
                constructorParams as RangoCrossChainTradeConstructorParams<EvmBlockchainName>
            );
        }

        if (BlockchainsInfo.isBitcoinBlockchainName(fromBlockchain)) {
            return new RangoBitcoinCrossChainTrade(
                constructorParams as RangoCrossChainTradeConstructorParams<BitcoinBlockchainName>
            );
        }

        throw new Error('Can not create trade instance');
    }
}
