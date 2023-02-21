import BigNumber from 'bignumber.js';
import {
    MaxAmountError,
    MinAmountError,
    NotSupportedTokensError,
    NotWhitelistedProviderError,
    RubicSdkError
} from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3PublicSupportedBlockchain } from 'src/core/blockchain/web3-public-service/models/web3-public-storage';
import { Injector } from 'src/core/injector/injector';
import { wlContractAbi } from 'src/features/common/constants/wl-contract-abi';
import { wlContractAddress } from 'src/features/common/constants/wl-contract-address';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import {
    MultichainCrossChainSupportedBlockchain,
    multichainCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/models/supported-blockchain';
import { MultichainTargetToken } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/models/tokens-api';
import { MultichainCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/multichain-cross-chain-trade';
import { getMultichainTokens } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/utils/get-multichain-tokens';
import { getToFeeAmount } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/utils/get-to-fee-amount';
import { isMultichainMethodName } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/utils/is-multichain-method-name';

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

            if (!compareAddresses(targetToken.address, toToken.address)) {
                return {
                    trade: null,
                    error: new NotSupportedTokensError()
                };
            }

            await this.checkProviderIsWhitelisted(
                fromBlockchain,
                targetToken.router,
                targetToken.spender
            );

            const feeInfo: FeeInfo = {};
            const cryptoFee = this.getProtocolFee(targetToken, from.weiAmount);

            const fromWithoutFee = getFromWithoutFee(
                from,
                feeInfo.rubicProxy?.platformFee?.percent
            );

            const toFeeAmount = getToFeeAmount(fromWithoutFee.tokenAmount, targetToken);
            const toAmount = fromWithoutFee.tokenAmount.minus(toFeeAmount);
            if (toAmount.lte(0)) {
                throw new RubicSdkError(
                    'Calculation result is lesser then provider fee. Please, increase from amount.'
                );
            }

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
                    priceImpact: 0,
                    toTokenAmountMin,
                    feeInfo: {
                        provider: {
                            cryptoFee
                        }
                    },
                    routerAddress,
                    spenderAddress,
                    routerMethodName,
                    anyTokenAddress,
                    slippage: 0
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
                .dividedBy(1 - (feeInfo.rubicProxy?.platformFee?.percent || 0) / 100)
                .toFixed(5, 0);
            throw new MinAmountError(new BigNumber(minimumAmount), minAmount.symbol);
        }

        if (amount.tokenAmount.gt(targetToken.MaximumSwap)) {
            const maximumAmount = new BigNumber(targetToken.MaximumSwap)
                .dividedBy(1 - (feeInfo.rubicProxy?.platformFee?.percent || 0) / 100)
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
                wlContractAddress[fromBlockchain as EvmBlockchainName],
                wlContractAbi,
                'getAvailableAnyRouters'
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
            throw new NotWhitelistedProviderError(
                providerRouter,
                providerGateway,
                'multichain:anyrouter'
            );
        }
    }

    protected override async getFeeInfo(
        fromBlockchain: MultichainCrossChainSupportedBlockchain,
        providerAddress: string,
        percentFeeToken: PriceTokenAmount
    ): Promise<FeeInfo> {
        return {
            rubicProxy: {
                fixedFee: {
                    amount: await this.getFixedFee(
                        fromBlockchain,
                        providerAddress,
                        rubicProxyContractAddress[fromBlockchain].router,
                        evmCommonCrossChainAbi
                    ),
                    tokenSymbol: nativeTokensList[fromBlockchain].symbol
                },
                platformFee: {
                    percent: await this.getFeePercent(
                        fromBlockchain,
                        providerAddress,
                        rubicProxyContractAddress[fromBlockchain].router,
                        evmCommonCrossChainAbi
                    ),
                    tokenSymbol: percentFeeToken.symbol
                }
            }
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
