import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EddyFinanceProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/zetachain/eddy-finance/eddy-finance-provider';

import { RequiredCrossChainOptions } from '../../../models/cross-chain-options';
import { findCompatibleZrc20TokenAddress } from './find-transit-token-address';

export const EDDY_CALCULATION_TYPES = {
    DIRECT_BRIDGE: 'DIRECT_BRIDGE',
    SWAP_FROM_ZETACHAIN: 'SWAP_FROM_ZETACHAIN',
    SWAP_TO_ZETACHAIN: 'SWAP_TO_ZETACHAIN',
    SWAP_BETWEEN_OTHER_CHAINS: 'SWAP_BETWEEN_OTHER_CHAINS'
} as const;

export type EddyCalculationType =
    (typeof EDDY_CALCULATION_TYPES)[keyof typeof EDDY_CALCULATION_TYPES];

export class EddyBridgeCalculationFactory {
    constructor(
        private readonly from: PriceTokenAmount<EvmBlockchainName>,
        private readonly toToken: PriceToken<EvmBlockchainName>,
        private readonly calculationType: EddyCalculationType,
        private readonly options: RequiredCrossChainOptions,
        private readonly ratioToAmount: number
    ) {}

    private readonly calculators: Map<EddyCalculationType, () => Promise<BigNumber>> = new Map([
        [EDDY_CALCULATION_TYPES.DIRECT_BRIDGE, this.calculateDirectBridge],
        [EDDY_CALCULATION_TYPES.SWAP_FROM_ZETACHAIN, this.calculateSwapFromZetachain],
        [EDDY_CALCULATION_TYPES.SWAP_TO_ZETACHAIN, this.calculateSwapToZetachain],
        [EDDY_CALCULATION_TYPES.SWAP_BETWEEN_OTHER_CHAINS, this.calculateSwapBetweenOtherChains]
    ]);

    public async calculatePureToAmount(): Promise<BigNumber> {
        const calculatorFn = this.calculators.get(this.calculationType)!;
        const toAmount = await calculatorFn.apply(this);
        return toAmount;
    }

    private async calculateDirectBridge(): Promise<BigNumber> {
        return this.from.tokenAmount.multipliedBy(this.ratioToAmount);
    }

    private async calculateSwapFromZetachain(): Promise<BigNumber> {
        const fromZrc20Token = new PriceTokenAmount({
            ...this.from.asStruct,
            tokenAmount: this.from.tokenAmount.multipliedBy(this.ratioToAmount)
        });
        const toZrc20Token = await PriceToken.createToken({
            address: findCompatibleZrc20TokenAddress(this.toToken),
            blockchain: BLOCKCHAIN_NAME.ZETACHAIN
        });
        const toAmount = await this.calculateOnChainToAmount(
            fromZrc20Token,
            toZrc20Token,
            this.options
        );

        return toAmount;
    }

    private async calculateSwapToZetachain(): Promise<BigNumber> {
        const fromZrc20Token = await PriceTokenAmount.createToken({
            address: findCompatibleZrc20TokenAddress(this.from),
            blockchain: BLOCKCHAIN_NAME.ZETACHAIN,
            tokenAmount: this.from.tokenAmount.multipliedBy(this.ratioToAmount)
        });
        const toAmount = await this.calculateOnChainToAmount(
            fromZrc20Token,
            this.toToken,
            this.options
        );

        return toAmount;
    }

    private async calculateSwapBetweenOtherChains(): Promise<BigNumber> {
        const fromZrc20Token = await PriceTokenAmount.createToken({
            address: findCompatibleZrc20TokenAddress(this.from),
            blockchain: BLOCKCHAIN_NAME.ZETACHAIN,
            tokenAmount: this.from.tokenAmount.multipliedBy(this.ratioToAmount)
        });
        const toZrc20Token = await PriceToken.createToken({
            address: findCompatibleZrc20TokenAddress(this.toToken),
            blockchain: BLOCKCHAIN_NAME.ZETACHAIN
        });
        const toAmount = await this.calculateOnChainToAmount(
            fromZrc20Token,
            toZrc20Token,
            this.options
        );

        return toAmount;
    }

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
