import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { BitcoinEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/bitcoin-web3-private/models/bitcoin-encoded-config';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';

import { CrossChainTrade } from '../common/cross-chain-trade';
import { TeleSwapBtcCcrTrade } from './chains/teleswap-btc-ccr-trade';
import { TeleSwapEvmCcrTrade } from './chains/teleswap-evm-ccr-trade';
import {
    TeleSwapBitcoinConstructorParams,
    TeleSwapConstructorParams,
    TeleSwapEvmConstructorParams
} from './models/teleswap-constructor-params';

export class TeleSwapCcrFactory {
    public static createTrade(
        fromBlockchain: BlockchainName,
        constructorParams: TeleSwapConstructorParams<BlockchainName>
    ): CrossChainTrade<EvmEncodeConfig | BitcoinEncodedConfig> {
        if (BlockchainsInfo.isEvmBlockchainName(fromBlockchain)) {
            return new TeleSwapEvmCcrTrade(constructorParams as TeleSwapEvmConstructorParams);
        }

        if (BlockchainsInfo.isBitcoinBlockchainName(fromBlockchain)) {
            return new TeleSwapBtcCcrTrade(constructorParams as TeleSwapBitcoinConstructorParams);
        }

        throw new Error('Can not create trade instance');
    }
}
