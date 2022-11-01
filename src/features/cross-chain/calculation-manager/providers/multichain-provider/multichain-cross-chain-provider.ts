import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import BigNumber from 'bignumber.js';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { getFromWithoutFee } from 'src/features/cross-chain/calculation-manager/utils/get-from-without-fee';
import {
    MultichainCrossChainSupportedBlockchain,
    multichainCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/models/supported-blockchain';
import {
    MaxAmountError,
    MinAmountError,
    NotSupportedTokensError,
    NotWhitelistedProviderError
} from 'src/common/errors';
import { MultichainCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/multichain-cross-chain-trade';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { getMultichainTokens } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/utils/get-multichain-tokens';
import { isMultichainMethodName } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/utils/is-multichain-method-name';
import { getToFeeAmount } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/utils/get-to-fee-amount';
import { MultichainTargetToken } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/models/tokens-api';
import { Injector } from 'src/core/injector/injector';
import { compareAddresses } from 'src/common/utils/blockchain';
import { Web3PublicSupportedBlockchain } from 'src/core/blockchain/web3-public-service/models/web3-public-storage';

export class MultichainCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.MULTICHAIN;

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is MultichainCrossChainSupportedBlockchain {
        return multichainCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain as MultichainCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as MultichainCrossChainSupportedBlockchain;
        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return null;
        }

        try {
            const tokens = await getMultichainTokens(from, toBlockchain);
            const routerMethodName = tokens?.targetToken.routerABI.split('(')[0]!;
            if (!tokens || !isMultichainMethodName(routerMethodName)) {
                return {
                    trade: null,
                    error: new NotSupportedTokensError()
                };
            }
            const { sourceToken, targetToken } = tokens;

            // @TODO Remove comments after contracts whitelist.
            // try {
            //     await this.checkProviderIsWhitelisted(
            //         fromBlockchain,
            //         targetToken.router,
            //         targetToken.spender
            //     );
            // } catch (error) {
            //     return {
            //         trade: null,
            //         error
            //     };
            // }
            //
            //
            // const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress, from);
            const feeInfo: FeeInfo = { platformFee: null, fixedFee: null, cryptoFee: null };
            const cryptoFee = this.getProtocolFee(targetToken, from.weiAmount);

            const fromWithoutFee = getFromWithoutFee(from, feeInfo);

            const toFeeAmount = getToFeeAmount(fromWithoutFee.tokenAmount, targetToken);
            const toAmount = fromWithoutFee.tokenAmount.minus(toFeeAmount);

            from = new PriceTokenAmount({
                ...from.asStructWithAmount,
                price: new BigNumber(sourceToken.price)
            });
            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: toAmount
            });
            const toTokenAmountMin = to.tokenAmount;

            const routerAddress = targetToken.router;
            const spenderAddress = targetToken.spender;
            const anyTokenAddress = targetToken.fromanytoken.address;
            const gasData =
                options.gasCalculation === 'enabled'
                    ? await MultichainCrossChainTrade.getGasData(
                          from,
                          to,
                          routerAddress,
                          spenderAddress,
                          routerMethodName,
                          anyTokenAddress
                      )
                    : null;

            const trade = new MultichainCrossChainTrade(
                {
                    from,
                    to,
                    gasData,
                    priceImpact: from.calculatePriceImpactPercent(to) || 0,
                    toTokenAmountMin,
                    feeInfo: {
                        ...feeInfo,
                        // @TODO Remove
                        fixedFee: null,
                        platformFee: null,
                        cryptoFee
                    },
                    routerAddress,
                    spenderAddress,
                    routerMethodName,
                    anyTokenAddress
                },
                options.providerAddress
            );

            try {
                this.checkMinMaxErrors(fromWithoutFee, fromWithoutFee, targetToken, feeInfo);
            } catch (error) {
                return {
                    trade,
                    error
                };
            }
            return { trade };
        } catch (err: unknown) {
            return {
                trade: null,
                error: CrossChainProvider.parseError(err)
            };
        }
    }

    protected checkMinMaxErrors(
        amount: { tokenAmount: BigNumber; symbol: string },
        minAmount: { tokenAmount: BigNumber; symbol: string },
        targetToken: MultichainTargetToken,
        feeInfo: FeeInfo
    ): void {
        // @TODO Add conversion from transit token to source.
        if (minAmount.tokenAmount.lt(targetToken.MinimumSwap)) {
            const minimumAmount = new BigNumber(targetToken.MinimumSwap)
                .dividedBy(1 - (feeInfo.platformFee?.percent || 0) / 100)
                .toFixed(5, 0);
            throw new MinAmountError(new BigNumber(minimumAmount), minAmount.symbol);
        }

        if (amount.tokenAmount.gt(targetToken.MaximumSwap)) {
            const maximumAmount = new BigNumber(targetToken.MaximumSwap)
                .dividedBy(1 - (feeInfo.platformFee?.percent || 0) / 100)
                .toFixed(5, 1);
            throw new MaxAmountError(new BigNumber(maximumAmount), amount.symbol);
        }
    }

    protected async checkProviderIsWhitelisted(
        fromBlockchain: Web3PublicSupportedBlockchain,
        providerRouter: string,
        providerGateway: string
    ): Promise<void> {
        const whitelistedContracts = await Injector.web3PublicService
            .getWeb3Public(fromBlockchain)
            .callContractMethod<string[]>(
                rubicProxyContractAddress[fromBlockchain],
                evmCommonCrossChainAbi,
                'getAvailableRouters'
            );

        if (
            !whitelistedContracts.find(whitelistedContract =>
                compareAddresses(whitelistedContract, providerRouter)
            ) ||
            (providerGateway &&
                !whitelistedContracts.find(whitelistedContract =>
                    compareAddresses(whitelistedContract, providerGateway)
                ))
        ) {
            throw new NotWhitelistedProviderError(providerRouter, providerGateway);
        }
    }

    protected override async getFeeInfo(
        fromBlockchain: MultichainCrossChainSupportedBlockchain,
        providerAddress: string,
        percentFeeToken: PriceTokenAmount
    ): Promise<FeeInfo> {
        return {
            fixedFee: {
                amount: await this.getFixedFee(
                    fromBlockchain,
                    providerAddress,
                    rubicProxyContractAddress[fromBlockchain],
                    evmCommonCrossChainAbi
                ),
                tokenSymbol: nativeTokensList[fromBlockchain].symbol
            },
            platformFee: {
                percent: await this.getFeePercent(
                    fromBlockchain,
                    providerAddress,
                    rubicProxyContractAddress[fromBlockchain],
                    evmCommonCrossChainAbi
                ),
                tokenSymbol: percentFeeToken.symbol
            },
            cryptoFee: null
        };
    }

    protected getProtocolFee(
        targetToken: MultichainTargetToken,
        fromAmount: BigNumber
    ): { amount: BigNumber; tokenSymbol: string } {
        const minFee = targetToken.MinimumSwapFee;
        const maxFee = targetToken.MaximumSwapFee;

        let amount = fromAmount.multipliedBy(targetToken.SwapFeeRatePerMillion).dividedBy(100);

        if (amount.gte(maxFee)) {
            amount = new BigNumber(maxFee);
        }

        if (amount.lte(minFee)) {
            amount = new BigNumber(minFee);
        }

        return {
            amount,
            tokenSymbol: targetToken.symbol
        };
    }
}
