import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { EddyQuoteController } from 'src/features/cross-chain/calculation-manager/providers/eddy-bridge/models/eddy-quote-controller';
import { EddyFinanceProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/zetachain/eddy-finance/eddy-finance-provider';

import { RequiredCrossChainOptions } from '../../../models/cross-chain-options';
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
        options: RequiredCrossChainOptions,
        ratioToAmount: number,
        gasFeeInSrcTokenUnits: BigNumber
    ): EddyQuoteController {
        const calculationType = getEddyCalculationType(from, toToken);
        const calculationFn = EddyQuoterControllerFactory.calculators[calculationType];

        return {
            calculateToAmount: async () => {
                const toAmount = await calculationFn(from, toToken, options, ratioToAmount);
                const toAmountWithGasInDestChain = await toAmount.minus(gasFeeInSrcTokenUnits);

                return toAmountWithGasInDestChain;
            },
            calculateToStringWeiAmount: async () => {
                const toAmount = await calculationFn(from, toToken, options, ratioToAmount);
                const toAmountWithGasInDestChain = await toAmount.minus(gasFeeInSrcTokenUnits);
                const weiAmount = Web3Pure.toWei(toAmountWithGasInDestChain, toToken.decimals);

                return weiAmount;
            }
        };
    }

    private static async calculateDirectBridge(
        from: PriceTokenAmount<EvmBlockchainName>,
        _toToken: PriceToken<EvmBlockchainName>,
        _options: RequiredCrossChainOptions,
        ratioToAmount: number
    ): Promise<BigNumber> {
        return from.tokenAmount.multipliedBy(ratioToAmount);
    }

    private static async calculateSwapFromZetachain(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions,
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
        options: RequiredCrossChainOptions,
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
        options: RequiredCrossChainOptions,
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
