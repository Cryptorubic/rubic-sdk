import BigNumber from 'bignumber.js';
import { MaxAmountError, MinAmountError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { FAKE_WALLET_ADDRESS } from 'src/features/common/constants/fake-wallet-address';
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
        const walletAddress = this.getWalletAddress(fromBlockchain) || FAKE_WALLET_ADDRESS;

        try {
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
                amount: fromWithoutFee.tokenAmount.toFixed(),
                dstChainName: pairInfo.to_chain_name,
                srcChainName: pairInfo.from_chain_name,
                receiverAddress: options.receiverAddress || walletAddress,
                tokenSymbol: pairInfo.token_name,
                walletAddress
            } as OwlTopSwapRequest;

            if (fromWithoutFee.tokenAmount.lt(minAmountBN)) {
                return {
                    trade: this.getEmptyTrade(fromWithoutFee, toToken, feeInfo, swapParams),
                    error: new MinAmountError(minAmountBN, from.symbol),
                    tradeType: this.type
                };
            }
            if (fromWithoutFee.tokenAmount.gt(maxAmountBN)) {
                return {
                    trade: this.getEmptyTrade(fromWithoutFee, toToken, feeInfo, swapParams),
                    error: new MaxAmountError(maxAmountBN, from.symbol),
                    tradeType: this.type
                };
            }

            const { receive_value, txs } = await OwlToApiService.getSwapInfo(swapParams);

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: new BigNumber(receive_value.raw_value)
            });

            const trade = new OwlToBridgeTrade({
                crossChainTrade: {
                    feeInfo,
                    from,
                    to,
                    gasData: await this.getGasData(from),
                    priceImpact: from.calculatePriceImpactPercent(to),
                    swapParams,
                    approveAddress: txs.transfer_body.to
                },
                providerAddress: options.providerAddress,
                routePath: await this.getRoutePath(from, to),
                useProxy
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

    private getEmptyTrade(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        feeInfo: FeeInfo,
        swapParams: OwlTopSwapRequest
    ): OwlToBridgeTrade {
        const to = new PriceTokenAmount({
            ...toToken.asStruct,
            tokenAmount: new BigNumber(0)
        });
        const trade = new OwlToBridgeTrade({
            crossChainTrade: {
                from,
                feeInfo,
                to,
                gasData: null,
                priceImpact: 0,
                swapParams,
                approveAddress: ''
            },
            providerAddress: '',
            routePath: [],
            useProxy: false
        });

        return trade;
    }
}
