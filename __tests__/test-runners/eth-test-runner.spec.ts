import { instantTradesApiSpec } from '__tests__/api-tests/instant-trades';
import { crossChainApiSpec } from '__tests__/api-tests/cross-chain-trades';
import { uniswapV2ProviderSpec } from '__tests__/unit-tests/features/swap/dexes/ethereum/uni-swap-v2/uni-swap-v2-provider';
import { uniswapV3EthTradeSpec } from '__tests__/unit-tests/features/swap/dexes/ethereum/uni-swap-v3/uni-swap-v3-ethereum-trade';
import { uniswapV3EthProviderSpec } from '__tests__/unit-tests/features/swap/dexes/ethereum/uni-swap-v3/uni-swap-v3-ethereum-provider';
import { uniswapV2TradeSpec } from '__tests__/unit-tests/features/swap/dexes/ethereum/uni-swap-v2/uni-swap-v2-trade';
import { oneinchProviderEthereumSpec } from '__tests__/unit-tests/features/swap/dexes/ethereum/one-inch/one-inch';
import { sushiSwapProviderEthereumSpec } from '__tests__/unit-tests/features/swap/dexes/ethereum/sushi-swap/sushi-swap';
import { zrxProviderEthereumSpec } from '__tests__/unit-tests/features/swap/dexes/ethereum/zrx/zrx';

describe('Eth tests', () => {
    instantTradesApiSpec();
    crossChainApiSpec();

    uniswapV2ProviderSpec();
    uniswapV2TradeSpec();

    uniswapV3EthProviderSpec();
    uniswapV3EthTradeSpec();

    oneinchProviderEthereumSpec();
    sushiSwapProviderEthereumSpec();
    zrxProviderEthereumSpec();
});
