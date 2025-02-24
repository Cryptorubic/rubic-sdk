import { TeleswapSDK } from '@teleportdao/teleswap-sdk';
import { SupportedNetwork } from '@teleportdao/teleswap-sdk/dist/types';
import BigNumber from 'bignumber.js';
import {
    FailedToCheckForTransactionReceiptError,
    RubicSdkError,
    TooLowAmountError,
    UserRejectError
} from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { parseError } from 'src/common/utils/errors';
import { BitcoinBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';

import { CROSS_CHAIN_TRADE_TYPE } from '../../../models/cross-chain-trade-type';
import { BitcoinCrossChainTrade } from '../../common/bitcoin-cross-chain-trade/bitcoin-cross-chain-trade';
import { GasData } from '../../common/evm-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from '../../common/models/bridge-type';
import { FeeInfo } from '../../common/models/fee-info';
import { OnChainSubtype } from '../../common/models/on-chain-subtype';
import { TradeInfo } from '../../common/models/trade-info';
import { TeleSwapCcrSupportedChain } from '../constants/teleswap-ccr-supported-chains';
import { teleSwapNetworkTickers } from '../constants/teleswap-network-tickers';
import { TeleSwapBitcoinConstructorParams } from '../models/teleswap-constructor-params';
import { TeleSwapUtilsService } from '../services/teleswap-utils-service';

export class TeleSwapBtcCcrTrade extends BitcoinCrossChainTrade {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.TELE_SWAP;

    public readonly isAggregator = false;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType = BRIDGE_TYPE.TELE_SWAP;

    public readonly from: PriceTokenAmount<BitcoinBlockchainName>;

    public readonly to: PriceTokenAmount;

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    /**
     * Overall price impact, fetched from symbiosis api.
     */
    public readonly priceImpact: number | null;

    public readonly gasData: GasData | null;

    private readonly slippage: number;

    protected get fromContractAddress(): string {
        throw new Error('Not implemented');
    }

    protected get methodName(): string {
        throw new Error('Not implemented');
    }

    public readonly memo = '';

    private readonly teleSwapSdk: TeleswapSDK;

    private get toBlockchain(): TeleSwapCcrSupportedChain {
        return this.to.blockchain as TeleSwapCcrSupportedChain;
    }

    constructor(params: TeleSwapBitcoinConstructorParams) {
        super(params.providerAddress, params.routePath, params.useProxy);

        this.from = params.crossChainTrade.from;
        this.to = params.crossChainTrade.to;
        this.gasData = params.crossChainTrade.gasData;
        this.priceImpact = params.crossChainTrade.priceImpact;
        this.toTokenAmountMin = this.to.tokenAmount.multipliedBy(
            1 - params.crossChainTrade.slippage
        );
        this.feeInfo = params.crossChainTrade.feeInfo;
        this.slippage = params.crossChainTrade.slippage;
        this.teleSwapSdk = params.crossChainTrade.teleSwapSdk;
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: null,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact ?? null,
            slippage: this.slippage * 100,
            routePath: this.routePath
        };
    }

    /**
     *
     * @returns txHash(srcTxHash) | never
     */
    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        this.checkWalletConnected();
        let transactionHash: string;

        try {
            const txData = await this.setTransactionConfig(
                false,
                options?.useCacheData || false,
                options?.receiverAddress
            );

            const { onConfirm } = options;
            const onTransactionHash = (hash: string) => {
                if (onConfirm) {
                    onConfirm(hash);
                }
                transactionHash = hash;
            };

            await this.web3Private.sendPsbtTransaction(
                txData.data!,
                this.walletAddress,
                txData.inputIndexes!,
                { onTransactionHash }
            );

            return transactionHash!;
        } catch (err) {
            if (err.message?.includes('User rejected the request') || err.code === 4001) {
                throw new UserRejectError();
            }
            if (err?.error?.errorId === 'ERROR_LOW_GIVE_AMOUNT') {
                throw new TooLowAmountError();
            }
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }

            throw parseError(err);
        }
    }

    protected async getTransactionConfigAndAmount(receiverAddress: string): Promise<{
        config: { to: string; value: string; inputIndexes: number[]; data: string };
        amount: string;
    }> {
        const btcWeb3Public = Injector.web3PublicService.getWeb3Public(this.from.blockchain);

        const publicKey = await btcWeb3Public.getPublicKey(this.walletAddress);

        if (!publicKey) {
            throw new RubicSdkError('Cannot get public key from user address info');
        }

        const signerInfo = {
            // SegWit standart: starts with 'bc1q'
            addressType: 'p2wpkh',
            publicKey,
            address: this.walletAddress
        };

        try {
            const toTokenAddress = TeleSwapUtilsService.getTokenAddress(this.to);

            const swapParams = await this.teleSwapSdk.wrapAndSwapUnsigned(
                receiverAddress,
                this.from.tokenAmount.toFixed(),
                signerInfo,
                teleSwapNetworkTickers[this.toBlockchain] as SupportedNetwork,
                toTokenAddress!,
                Web3Pure.toWei(this.toTokenAmountMin, this.to.decimals)
            );

            const inputIndexes = swapParams.inputs.map((_, index) => index);

            return {
                config: {
                    to: '0x',
                    value: '0x',
                    inputIndexes,
                    data: swapParams.unsignedTransaction
                },
                amount: this.to.stringWeiAmount
            };
        } catch (err) {
            console.error(err);
            throw new RubicSdkError(err);
        }
    }
}
