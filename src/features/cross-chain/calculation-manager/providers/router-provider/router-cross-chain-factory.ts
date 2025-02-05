import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BitcoinEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/bitcoin-web3-private/models/bitcoin-encoded-config';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { RouterConstructorParams } from 'src/features/cross-chain/calculation-manager/providers/router-provider/models/router-constructor-params';

import { CrossChainTrade } from '../common/cross-chain-trade';

export class RouterCrossChainFactory {
    public static createTrade(
        _fromBlockchain: BlockchainName,
        _constructorParams: RouterConstructorParams<BlockchainName>
    ): CrossChainTrade<EvmEncodeConfig | BitcoinEncodedConfig> {
        // if (BlockchainsInfo.isEvmBlockchainName(fromBlockchain)) {
        //     return new RouterEvmCrossChainTrade(constructorParams as RouterEvmConstructorParams);
        // }

        // if (BlockchainsInfo.isBitcoinBlockchainName(fromBlockchain)) {
        //     return new RouterBitcoinCrossChainTrade(
        //         constructorParams as RouterBitcoinConstructorParams
        //     );
        // }

        throw new Error('Can not create trade instance');
    }
}
