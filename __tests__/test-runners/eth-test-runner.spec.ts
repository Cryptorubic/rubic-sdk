import { crosschainApiSpec } from '__tests__/api-tests/crosschain-trades';
import { instantTradesApiSpec } from '__tests__/api-tests/instant-trades';
import { uniswapV2ProviderSpec } from '__tests__/unit-tests/features/swap/dexes/ethereum/uni-swap-v2/uni-swap-v2-provider';
import { uniswapV2TradeSpec } from '__tests__/unit-tests/features/swap/dexes/ethereum/uni-swap-v2/uni-swap-v2-trade';
import { uniswapV3EthProviderSpec } from '__tests__/unit-tests/features/swap/dexes/ethereum/uni-swap-v3/uni-swap-v3-ethereum-provider';
import { uniswapV3EthTradeSpec } from '__tests__/unit-tests/features/swap/dexes/ethereum/uni-swap-v3/uni-swap-v3-ethereum-trade';

describe('Eth tests', () => {
    instantTradesApiSpec();
    crosschainApiSpec();
    uniswapV2ProviderSpec();
    uniswapV3EthTradeSpec();
    uniswapV3EthProviderSpec();
    uniswapV2TradeSpec();
});
