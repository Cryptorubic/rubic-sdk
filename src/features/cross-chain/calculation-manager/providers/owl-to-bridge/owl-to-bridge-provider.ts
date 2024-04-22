import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

import { RequiredCrossChainOptions } from '../../models/cross-chain-options';
import { CrossChainTradeType } from '../../models/cross-chain-trade-type';
import { CrossChainProvider } from '../common/cross-chain-provider';
import { BRIDGE_TYPE } from '../common/models/bridge-type';
import { CalculationResult } from '../common/models/calculation-result';
import { FeeInfo } from '../common/models/fee-info';
import { RubicStep } from '../common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import {
    OwlToSupportedBlockchain,
    owlToSupportedBlockchains
} from './constants/owl-to-supported-chains';
import { OwlToTradeData } from './models/owl-to-provider-types';
import { OwlToBridgeTrade } from './owl-to-bridge-trade';
import { OwlToApiService } from './services/owl-to-api-service';

export class OwlToBridgeProvider extends CrossChainProvider {
    public type: CrossChainTradeType = BRIDGE_TYPE.OWL_TO_BRIDGE;

    public isSupportedBlockchain(blockchain: BlockchainName): boolean {
        return owlToSupportedBlockchains.some(chain => chain === blockchain);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain as OwlToSupportedBlockchain;
        const useProxy = options?.useProxy?.[this.type] ?? true;

        try {
            const {
                sourceToken: { minValue, maxValue },
                targetChainCode,
                gas,
                transferFee,
                makerAddress
            } = await this.fetchTradeData(from, toToken);

            if (this.isInvalidAmount(from.tokenAmount, minValue, maxValue)) {
                throw new RubicSdkError(`
                    [OWL_TO_BRIDGE] Amount is out of range. 
                    Min amount - ${minValue} ${from.symbol}.
                    Max amount - ${maxValue} ${from.symbol}.
                `);
            }

            const feeInfo = await this.getFeeInfo(
                fromBlockchain,
                options.providerAddress,
                from,
                useProxy
            );

            const fromWithoutFee = getFromWithoutFee(
                from,
                feeInfo.rubicProxy?.platformFee?.percent
            );

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: from.tokenAmount.minus(transferFee)
            });

            const fromWithoutFeeWithCode = new PriceTokenAmount({
                ...fromWithoutFee.asStruct,
                weiAmount: this.getFromWeiAmountWithCode(from, targetChainCode)
            });

            const gasData =
                options.gasCalculation === 'enabled'
                    ? await OwlToBridgeTrade.getGasData({
                          feeInfo,
                          fromToken: fromWithoutFeeWithCode,
                          toToken: to,
                          providerAddress: options.providerAddress,
                          gasLimit: new BigNumber(gas),
                          makerAddress
                      })
                    : null;

            const trade = new OwlToBridgeTrade({
                crossChainTrade: {
                    feeInfo,
                    from: fromWithoutFeeWithCode,
                    to,
                    gasData,
                    priceImpact: from.calculatePriceImpactPercent(to),
                    makerAddress
                },
                providerAddress: options.providerAddress,
                routePath: await this.getRoutePath(from, to)
            });

            return { trade, tradeType: this.type };
        } catch (err) {
            const rubicSdkError = CrossChainProvider.parseError(err);

            return {
                trade: null,
                error: rubicSdkError,
                tradeType: this.type
            };
        }
    }

    private async fetchTradeData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceToken<EvmBlockchainName>
    ): Promise<OwlToTradeData> {
        const sourceChainId = blockchainId[from.blockchain];
        const targetChainId = blockchainId[to.blockchain];
        const walletAddress = this.getWalletAddress(from.blockchain);

        const [{ sourceChain, targetChain }, sourceToken] = await Promise.all([
            OwlToApiService.getSwappingChainsInfo(sourceChainId, targetChainId),
            OwlToApiService.getSourceTokenInfo(from)
        ]);

        const [transferFee, txInfo] = await Promise.all([
            OwlToApiService.getTransferFee({
                fromAmount: from.tokenAmount.toNumber(),
                sourceChainName: sourceChain.name,
                targetChainName: targetChain.name,
                tokenSymbol: sourceToken.symbol
            }),
            OwlToApiService.getTxInfo({
                sourceChainId,
                targetChainId,
                walletAddress,
                tokenSymbol: sourceToken.symbol
            })
        ]);

        return {
            sourceToken,
            transferFee,
            targetChainCode: targetChain.networkCode.toString(),
            gas: txInfo.estimated_gas,
            makerAddress: txInfo.maker_address
        };
    }

    private getFromWeiAmountWithCode(from: PriceTokenAmount, code: string): BigNumber {
        const decrementCode = `0.${code.padStart(from.decimals, '0')}`;
        const sendingAmount = from.tokenAmount.minus(decrementCode);
        const sendingStringWeiAmount = Web3Pure.toWei(sendingAmount, from.decimals);
        const validCode = code.padStart(4, '0');
        const amount = sendingStringWeiAmount.replace(/\d{4}$/g, validCode);

        return new BigNumber(amount);
    }

    private isInvalidAmount(fromAmount: BigNumber, min: number, max: number): boolean {
        return fromAmount.gt(max) || fromAmount.lt(min);
    }

    protected async getFeeInfo(
        fromBlockchain: OwlToSupportedBlockchain,
        providerAddress: string,
        percentFeeToken: PriceTokenAmount,
        useProxy: boolean
    ): Promise<FeeInfo> {
        return ProxyCrossChainEvmTrade.getFeeInfo(
            fromBlockchain,
            providerAddress,
            percentFeeToken,
            useProxy
        );
    }

    protected async getRoutePath(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount<EvmBlockchainName>
    ): Promise<RubicStep[]> {
        return [{ type: 'cross-chain', provider: this.type, path: [fromToken, toToken] }];
    }
}
