import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { ViaCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/via-provider/constants/via-cross-chain-supported-blockchain';
import { viaContractAddress } from 'src/features/cross-chain/calculation-manager/providers/via-provider/constants/contract-data';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';

import { PriceToken, PriceTokenAmount } from 'src/common/tokens';

import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import BigNumber from 'bignumber.js';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { getFromWithoutFee } from 'src/features/cross-chain/calculation-manager/utils/get-from-without-fee';
import {
    MultichainCrossChainSupportedBlockchain,
    multichainCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/constants/multichain-cross-chain-supported-blockchain';
import {
    MultichainSourceToken,
    MultichainTargetToken,
    MultichainTokensResponse
} from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/models/tokens-api';
import { MaxAmountError, MinAmountError, NotSupportedTokensError } from 'src/common/errors';
import { isMultichainMethodName } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/utils/is-multichain-method-name';
import { MultichainCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/multichain-cross-chain-trade';
import { MultichainMethodName } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/models/multichain-method-name';

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
            const fromChainId = blockchainId[fromBlockchain];
            const toChainId = blockchainId[toBlockchain];
            const tokensList = this.httpClient.get<MultichainTokensResponse>(
                `https://bridgeapi.anyswap.exchange/v4/tokenlistv4/${fromChainId}`
            );
            const sourceToken = (
                Object.entries(tokensList) as [string, MultichainSourceToken][]
            ).find(([address, token]) => {
                return (
                    (from.isNative && token.tokenType === 'NATIVE') ||
                    address.toLowerCase().endsWith(from.address.toLowerCase())
                );
            })?.[1];
            const dstChainInformation = sourceToken?.destChains[toChainId.toString()];
            if (!sourceToken || !dstChainInformation) {
                return {
                    trade: null,
                    error: new NotSupportedTokensError()
                };
            }

            const targetToken = (
                Object.entries(dstChainInformation) as [string, MultichainTargetToken][]
            ).find(([_hash, token]) => {
                const routerAbi = token.routerABI;
                return isMultichainMethodName(routerAbi.split('(')[0]!);
            })?.[1];
            if (!targetToken) {
                return {
                    trade: null,
                    error: new NotSupportedTokensError()
                };
            }
            const routerMethodName = targetToken.routerABI.split('(')[0]! as MultichainMethodName;

            const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress, from);
            const fromWithoutFee = getFromWithoutFee(from, feeInfo);
            const feeAmount = BigNumber.min(
                BigNumber.max(
                    fromWithoutFee.tokenAmount.multipliedBy(
                        targetToken.SwapFeeRatePerMillion / 100
                    ),
                    new BigNumber(targetToken.MinimumSwapFee)
                ),
                new BigNumber(targetToken.MaximumSwapFee)
            );
            const toAmount = fromWithoutFee.tokenAmount.minus(feeAmount);

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
                    feeInfo,
                    routerAddress,
                    spenderAddress,
                    routerMethodName,
                    anyTokenAddress
                },
                options.providerAddress
            );

            if (fromWithoutFee.tokenAmount.lt(targetToken.MinimumSwap)) {
                const minimumAmount = new BigNumber(targetToken.MinimumSwap)
                    .dividedBy(1 - (feeInfo.platformFee?.percent || 0) / 100)
                    .toFixed(5, 0);
                return {
                    trade,
                    error: new MinAmountError(new BigNumber(minimumAmount), from.symbol)
                };
            }
            if (fromWithoutFee.tokenAmount.gt(targetToken.MaximumSwap)) {
                const maximumAmount = new BigNumber(targetToken.MaximumSwap)
                    .dividedBy(1 - (feeInfo.platformFee?.percent || 0) / 100)
                    .toFixed(5, 1);
                return {
                    trade,
                    error: new MaxAmountError(new BigNumber(maximumAmount), from.symbol)
                };
            }

            return {
                trade
            };
        } catch (err: unknown) {
            return {
                trade: null,
                error: CrossChainProvider.parseError(err)
            };
        }
    }

    protected override async getFeeInfo(
        fromBlockchain: ViaCrossChainSupportedBlockchain,
        providerAddress: string,
        percentFeeToken: PriceTokenAmount
    ): Promise<FeeInfo> {
        return {
            fixedFee: {
                amount: await this.getFixedFee(
                    fromBlockchain,
                    providerAddress,
                    viaContractAddress[fromBlockchain],
                    evmCommonCrossChainAbi
                ),
                tokenSymbol: nativeTokensList[fromBlockchain].symbol
            },
            platformFee: {
                percent: await this.getFeePercent(
                    fromBlockchain,
                    providerAddress,
                    viaContractAddress[fromBlockchain],
                    evmCommonCrossChainAbi
                ),
                tokenSymbol: percentFeeToken.symbol
            },
            cryptoFee: null
        };
    }
}
