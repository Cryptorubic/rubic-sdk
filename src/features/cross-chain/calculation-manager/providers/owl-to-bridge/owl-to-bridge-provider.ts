import BigNumber from 'bignumber.js';
import { MaxAmountError, MinAmountError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';
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
import { OwlTopSwapRequest } from './models/owl-to-api-types';
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
        const walletAddress = this.getWalletAddress(fromBlockchain);

        try {
            checkUnsupportedReceiverAddress(options.receiverAddress);

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

            const pairInfo = await OwlToApiService.getPairInfo(
                blockchainId[from.blockchain],
                from.address,
                blockchainId[toToken.blockchain],
                toToken.address
            );
            const minAmountBN = new BigNumber(pairInfo.min_value.ui_value);
            const maxAmountBN = new BigNumber(pairInfo.max_value.ui_value);
            const swapParams = {
                amount: fromWithoutFee.tokenAmount.toFixed(1),
                dstChainName: pairInfo.to_chain_name,
                srcChainName: pairInfo.from_chain_name,
                receiverAddress: options.receiverAddress || walletAddress,
                tokenSymbol: pairInfo.token_name,
                walletAddress
            } as OwlTopSwapRequest;

            const { receive_value, gas_fee, txs } = await OwlToApiService.getSwapInfo(swapParams);

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: new BigNumber(receive_value.raw_value)
            });

            const gasData =
                options.gasCalculation === 'enabled'
                    ? await OwlToBridgeTrade.getGasData({
                          feeInfo,
                          fromToken: fromWithoutFee,
                          toToken: to,
                          providerAddress: options.providerAddress,
                          gasLimit: new BigNumber(gas_fee.raw_value),
                          swapParams,
                          approveAddress: txs.transfer_body.to
                      })
                    : null;

            const trade = new OwlToBridgeTrade({
                crossChainTrade: {
                    feeInfo,
                    from: fromWithoutFee,
                    to,
                    gasData,
                    priceImpact: from.calculatePriceImpactPercent(to),
                    swapParams,
                    approveAddress: txs.transfer_body.to
                },
                providerAddress: options.providerAddress,
                routePath: await this.getRoutePath(from, to)
            });

            if (from.tokenAmount.lt(maxAmountBN)) {
                return {
                    trade,
                    error: new MinAmountError(minAmountBN, from.symbol),
                    tradeType: this.type
                };
            }
            if (from.tokenAmount.gt(maxAmountBN)) {
                return {
                    trade,
                    error: new MaxAmountError(maxAmountBN, from.symbol),
                    tradeType: this.type
                };
            }

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
