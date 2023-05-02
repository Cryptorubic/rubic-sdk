import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { PANCAKE_SWAP_TESTNET_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/bsct/pancake-swap-testnet/constants';
import { PancakeSwapTestnetTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/bsct/pancake-swap-testnet/pancake-swap-testnet-trade';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';

export class PancakeSwapTestnetProvider extends UniswapV2AbstractProvider<PancakeSwapTestnetTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET;

    public readonly UniswapV2TradeClass = PancakeSwapTestnetTrade;

    public readonly providerSettings = PANCAKE_SWAP_TESTNET_PROVIDER_CONFIGURATION;
}
