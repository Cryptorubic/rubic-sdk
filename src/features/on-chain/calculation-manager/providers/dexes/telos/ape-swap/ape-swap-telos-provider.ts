import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { ApeSwapTelosTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/telos/ape-swap/ape-swap-telos-trade';
import { APE_SWAP_TELOS_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/telos/ape-swap/constants';

export class ApeSwapTelosProvider extends UniswapV2AbstractProvider<ApeSwapTelosTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.TELOS;

    public readonly UniswapV2TradeClass = ApeSwapTelosTrade;

    public readonly providerSettings = APE_SWAP_TELOS_PROVIDER_CONFIGURATION;
}
