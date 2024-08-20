import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EddyFinanceProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/zetachain/eddy-finance/eddy-finance-provider';

import { RequiredCrossChainOptions } from '../../../models/cross-chain-options';

export const EDDY_CALCULATION_TYPES = {
    DIRECT_BRIDGE: 'DIRECT_BRIDGE',
    SWAP_FROM_ZETACHAIN: 'SWAP_FROM_ZETACHAIN',
    SWAP_TO_ZETACHAIN: 'SWAP_TO_ZETACHAIN',
    SWAP_BETWEEN_OTHER_CHAINS: 'SWAP_BETWEEN_OTHER_CHAINS'
} as const;

type EddyCalculationType = (typeof EDDY_CALCULATION_TYPES)[keyof typeof EDDY_CALCULATION_TYPES];

export class EddyBridgeCalculationFactory {
    constructor(
        private readonly from: PriceTokenAmount<EvmBlockchainName>,
        private readonly toToken: PriceToken<EvmBlockchainName>,
        private readonly calculationType: EddyCalculationType,
        private readonly ratioToAmount: number,
        private readonly gasFeeInDestTokenUnits: BigNumber
    ) {}

    private readonly calculators: Map<EddyCalculationType, () => BigNumber> = new Map([
        [EDDY_CALCULATION_TYPES.DIRECT_BRIDGE, this.calculateDirectBridge],
        [EDDY_CALCULATION_TYPES.SWAP_FROM_ZETACHAIN, this.calculateSwapFromZetachain],
        [EDDY_CALCULATION_TYPES.SWAP_TO_ZETACHAIN, this.calculateSwapToZetachain],
        [EDDY_CALCULATION_TYPES.SWAP_BETWEEN_OTHER_CHAINS, this.calculateSwapBetweenOtherChains]
    ]);

    public calculatePureToAmount(): BigNumber {
        const calculatorFn = this.calculators.get(this.calculationType)!;
        const toAmount = calculatorFn.apply(this);
        return toAmount;
    }

    private calculateDirectBridge(): BigNumber {
        return this.from.tokenAmount
            .multipliedBy(this.ratioToAmount)
            .minus(this.gasFeeInDestTokenUnits);
    }

    private calculateSwapFromZetachain(): BigNumber {}

    private calculateSwapToZetachain(): BigNumber {}

    private calculateSwapBetweenOtherChains(): BigNumber {}

    private async calculateOnChainToAmount(
        fromZrc20Token: PriceTokenAmount<EvmBlockchainName>,
        toZrc20Token: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<BigNumber> {
        const calcData = await new EddyFinanceProvider().calculate(fromZrc20Token, toZrc20Token, {
            ...options,
            gasCalculation: 'disabled',
            useProxy: false
        });

        return calcData.to.tokenAmount;
    }
}
