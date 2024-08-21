import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { EddyFinanceProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/zetachain/eddy-finance/eddy-finance-provider';

import { RequiredCrossChainOptions } from '../../../models/cross-chain-options';
import {
    EDDY_CALCULATION_TYPES,
    EddyCalculationType,
    getEddyCalculationType
} from './eddy-bridge-routing-directions';
import { findCompatibleZrc20TokenAddress } from './find-transit-token-address';

export class EddyBridgeCalculationFactory {
    private calculationType: EddyCalculationType;

    private readonly calculators: Map<EddyCalculationType, () => Promise<BigNumber>> = new Map([
        [EDDY_CALCULATION_TYPES.DIRECT_BRIDGE, this.calculateDirectBridge],
        [EDDY_CALCULATION_TYPES.SWAP_FROM_ZETACHAIN, this.calculateSwapFromZetachain],
        [EDDY_CALCULATION_TYPES.SWAP_TO_ZETACHAIN, this.calculateSwapToZetachain],
        [EDDY_CALCULATION_TYPES.SWAP_BETWEEN_OTHER_CHAINS, this.calculateSwapBetweenOtherChains]
    ]);

    constructor(
        private readonly from: PriceTokenAmount<EvmBlockchainName>,
        private readonly toToken: PriceToken<EvmBlockchainName>,
        private readonly options: RequiredCrossChainOptions,
        private readonly ratioToAmount: number,
        private readonly gasFeeInSrcTokenUnits: BigNumber
    ) {
        this.calculationType = getEddyCalculationType(from, toToken);
    }

    public async calculateToAmount(): Promise<BigNumber> {
        const calculatorFn = this.calculators.get(this.calculationType)!;
        const toAmount = await calculatorFn.apply(this);
        const toAmountWithGasInDestChain = toAmount.minus(this.gasFeeInSrcTokenUnits);

        return toAmountWithGasInDestChain;
    }

    public async calculateToStringWeiAmount(): Promise<string> {
        const nonWeiAmount = await this.calculateToAmount();
        const weiAmount = Web3Pure.toWei(nonWeiAmount, this.toToken.decimals);
        return weiAmount;
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
