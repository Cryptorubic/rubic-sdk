import BigNumber from 'bignumber.js';
import { PriceToken } from 'src/common/tokens';
import { combineOptions } from 'src/common/utils/options';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';
import { UniswapV3AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-provider';
import { HorizondexUniswapV3QuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/utils/quoter-controller/horizondex-uniswap-v3-quoter-controller';
import { HORIZONDEX_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/linea/horizondex/constants/provider-configuration';
import { HORIZONDEX_ROUTER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/linea/horizondex/constants/router-configuration';
import { HorizondexTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/linea/horizondex/horizondex-trade';
import {
    HORIZONDEX_QUOTER_CONTRACT_ABI,
    HORIZONDEX_QUOTER_CONTRACT_ADDRESS
} from 'src/features/on-chain/calculation-manager/providers/dexes/linea/horizondex/utils/quoter-controller/constants/quoter-contract-data';

export class HorizondexProvider extends UniswapV3AbstractProvider<HorizondexTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.LINEA;

    public readonly OnChainTradeClass = HorizondexTrade;

    public readonly providerConfiguration = HORIZONDEX_PROVIDER_CONFIGURATION;

    public readonly routerConfiguration = HORIZONDEX_ROUTER_CONFIGURATION;

    protected readonly quoterController = new HorizondexUniswapV3QuoterController(
        this.blockchain,
        this.routerConfiguration,
        HORIZONDEX_QUOTER_CONTRACT_ADDRESS,
        HORIZONDEX_QUOTER_CONTRACT_ABI
    );

    // @TODO Remove when method's will be whitelisted
    protected async calculateDifficultTrade(
        fromToken: PriceToken<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        exact: Exact,
        weiAmount: BigNumber,
        options?: OnChainCalculationOptions
    ): Promise<HorizondexTrade> {
        const fullOptions = combineOptions(options, this.defaultOptions);

        const newOptions = { ...fullOptions, useProxy: false };
        return super.calculateDifficultTrade(fromToken, toToken, exact, weiAmount, newOptions);
    }
}
