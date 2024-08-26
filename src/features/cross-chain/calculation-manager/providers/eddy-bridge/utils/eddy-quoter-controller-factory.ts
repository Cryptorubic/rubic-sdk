import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EddyQuoteController } from 'src/features/cross-chain/calculation-manager/providers/eddy-bridge/models/eddy-quote-controller';
import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { EddyFinanceProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/zetachain/eddy-finance/eddy-finance-provider';

import { EDDY_CALCULATION_TYPES, getEddyCalculationType } from './eddy-bridge-routing-directions';
import { findCompatibleZrc20TokenAddress } from './find-transit-token-address';

export class EddyQuoterControllerFactory {
    private static readonly calculators = {
        [EDDY_CALCULATION_TYPES.DIRECT_BRIDGE]: EddyQuoterControllerFactory.calculateDirectBridge,
        [EDDY_CALCULATION_TYPES.SWAP_FROM_ZETACHAIN]:
            EddyQuoterControllerFactory.calculateSwapFromZetachain,
        [EDDY_CALCULATION_TYPES.SWAP_TO_ZETACHAIN]:
            EddyQuoterControllerFactory.calculateSwapToZetachain,
        [EDDY_CALCULATION_TYPES.SWAP_BETWEEN_OTHER_CHAINS]:
            EddyQuoterControllerFactory.calculateSwapBetweenOtherChains
    };

    private constructor() {}

    public static createController(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        ratioToAmount: number,
        gasFeeInSrcTokenUnits: BigNumber,
        slippageTolerance: number
    ): EddyQuoteController {
        const calculationType = getEddyCalculationType(from, toToken);
        const calculationFn = EddyQuoterControllerFactory.calculators[calculationType];
        const calculationOptions: OnChainCalculationOptions = {
            slippageTolerance,
            gasCalculation: 'disabled',
            useProxy: false
        };

        return {
            calculateToAmount: async () => {
                const toAmount = await calculationFn(
                    from,
                    toToken,
                    calculationOptions,
                    ratioToAmount
                );
                return toAmount.minus(gasFeeInSrcTokenUnits);
            }
        };
    }

    private static async calculateDirectBridge(
        from: PriceTokenAmount<EvmBlockchainName>,
        _toToken: PriceToken<EvmBlockchainName>,
        _options: OnChainCalculationOptions,
        ratioToAmount: number
    ): Promise<BigNumber> {
        return from.tokenAmount.multipliedBy(ratioToAmount);
    }

    private static async calculateSwapFromZetachain(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: OnChainCalculationOptions,
        ratioToAmount: number
    ): Promise<BigNumber> {
        const fromZrc20Token = new PriceTokenAmount({
            ...from.asStruct,
            tokenAmount: from.tokenAmount.multipliedBy(ratioToAmount)
        });
        const toZrc20Token = await PriceToken.createToken({
            address: findCompatibleZrc20TokenAddress(toToken),
            blockchain: BLOCKCHAIN_NAME.ZETACHAIN
        });
        const toAmount = await EddyQuoterControllerFactory.calculateOnChainToAmount(
            fromZrc20Token,
            toZrc20Token,
            options
        );

        return toAmount;
    }

    private static async calculateSwapToZetachain(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: OnChainCalculationOptions,
        ratioToAmount: number
    ): Promise<BigNumber> {
        const fromZrc20Token = await PriceTokenAmount.createToken({
            address: findCompatibleZrc20TokenAddress(from),
            blockchain: BLOCKCHAIN_NAME.ZETACHAIN,
            tokenAmount: from.tokenAmount.multipliedBy(ratioToAmount)
        });
        const toAmount = await EddyQuoterControllerFactory.calculateOnChainToAmount(
            fromZrc20Token,
            toToken,
            options
        );

        return toAmount;
    }

    private static async calculateSwapBetweenOtherChains(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: OnChainCalculationOptions,
        ratioToAmount: number
    ): Promise<BigNumber> {
        const fromZrc20Token = await PriceTokenAmount.createToken({
            address: findCompatibleZrc20TokenAddress(from),
            blockchain: BLOCKCHAIN_NAME.ZETACHAIN,
            tokenAmount: from.tokenAmount.multipliedBy(ratioToAmount)
        });
        const toZrc20Token = await PriceToken.createToken({
            address: findCompatibleZrc20TokenAddress(toToken),
            blockchain: BLOCKCHAIN_NAME.ZETACHAIN
        });
        const toAmount = await EddyQuoterControllerFactory.calculateOnChainToAmount(
            fromZrc20Token,
            toZrc20Token,
            options
        );

        return toAmount;
    }

    private static async calculateOnChainToAmount(
        fromZrc20Token: PriceTokenAmount<EvmBlockchainName>,
        toZrc20Token: PriceToken<EvmBlockchainName>,
        options: OnChainCalculationOptions
    ): Promise<BigNumber> {
        const calcData = await new EddyFinanceProvider().calculate(fromZrc20Token, toZrc20Token, {
            ...options,
            gasCalculation: 'disabled',
            useProxy: false
        });

        return calcData.to.tokenAmount;
    }
}
