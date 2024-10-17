import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { TX_STATUS } from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { Injector } from 'src/core/injector/injector';
import { FAKE_WALLET_ADDRESS } from 'src/features/common/constants/fake-wallet-address';
import { TxStatusData } from 'src/features/common/status-manager/models/tx-status-data';
import { CrossChainTradeData } from 'src/features/cross-chain/status-manager/models/cross-chain-trade-data';

import {
    OneinchQuoteParams,
    OneinchQuoteResponse,
    OneinchReadySecretsResponse,
    OneinchStatusResponse,
    OneinchSwapOrderParams,
    OneinchSwapOrderResponse
} from '../models/oneinch-api-types';
import { OneinchCcrUtils } from './oneinch-ccr-utils';

export class OneinchCcrApiService {
    private static readonly apiUrl = 'https://api.1inch.dev/fusion-plus';

    private static readonly apiKey = 'sndfje3u4b3fnNSDNFUSDNVSunw345842hrnfd3b4nt4';

    public static async fetchQuote({
        srcToken,
        dstToken,
        walletAddress
    }: OneinchQuoteParams): Promise<OneinchQuoteResponse> {
        try {
            const res = await Injector.httpClient.get<OneinchQuoteResponse>(
                `${this.apiUrl}/quoter/v1.0/quote/receive`,
                {
                    headers: { apikey: this.apiKey },
                    params: {
                        srcChain: blockchainId[srcToken.blockchain],
                        dstChain: blockchainId[dstToken.blockchain],
                        srcTokenAddress: srcToken.address,
                        dstTokenAddress: dstToken.address,
                        amount: srcToken.stringWeiAmount,
                        walletAddress: walletAddress || FAKE_WALLET_ADDRESS,
                        enableEstimate: false,
                        fee: 100,
                        source: 'rubic'
                    }
                }
            );

            return res;
        } catch (err) {
            throw err;
        }
    }

    // @TODO add feeReceiver
    public static async buildSwapOrder({
        dstToken,
        srcToken,
        walletAddress,
        quote,
        secretHashes
    }: OneinchSwapOrderParams): Promise<OneinchSwapOrderResponse> {
        try {
            const queryParams = `srcChain=${blockchainId[srcToken.blockchain]}&
dstChain=${blockchainId[dstToken.blockchain]}&
srcTokenAddress=${srcToken.address}&
dstTokenAddress=${dstToken.address}&
amount=${srcToken.stringWeiAmount}&
walletAddress=${walletAddress}&
fee=100&
feeReceiver=${walletAddress}&
source=rubic&
preset=${quote.recommendedPreset}`;

            const res = await Injector.httpClient.post<OneinchSwapOrderResponse>(
                `${this.apiUrl}/quoter/v1.0/quote/build?${queryParams}`,
                { quote: quote, secretsHashList: secretHashes },
                { headers: { apikey: this.apiKey } }
            );

            return res;
        } catch (err) {
            throw err;
        }
    }

    public static async submitSwapOrder(
        quoteResp: OneinchQuoteResponse,
        swapResp: OneinchSwapOrderResponse,
        walletAddress: string,
        secretHashes: string[]
    ): Promise<void> {
        try {
            const signature = await OneinchCcrUtils.signTypedData(
                swapResp.typedData,
                walletAddress
            );
            const res = await Injector.httpClient.post(
                `${this.apiUrl}/relayer/v1.0/submit`,
                {
                    signature,
                    order: swapResp.typedData.message,
                    srcChainId: swapResp.typedData.domain.chainId,
                    extension: swapResp.extension,
                    quoteId: quoteResp.quoteId,
                    secretHashes
                },
                { headers: { apikey: this.apiKey } }
            );

            console.log(
                `[OneinchCcrApiService_submitSwapOrder] %cResponse is ${res}`,
                'color: green; font-size: 24px;'
            );
        } catch (err) {
            throw err;
        }
    }

    public static async fetchReadySecrets(orderHash: string): Promise<OneinchReadySecretsResponse> {
        try {
            const readySecrets = await Injector.httpClient.get<OneinchReadySecretsResponse>(
                `${this.apiUrl}/orders/v1.0/order/ready-to-accept-secret-fills/${orderHash}`,
                { headers: { apikey: this.apiKey } }
            );

            return readySecrets;
        } catch (err) {
            throw err;
        }
    }

    public static async submitSecretForSwapOrder(orderHash: string, secret: string): Promise<void> {
        try {
            await Injector.httpClient.post(
                `${this.apiUrl}/relayer/v1.0/submit/secret`,
                {
                    secret,
                    orderHash
                },
                { headers: { apikey: this.apiKey } }
            );
        } catch (err) {
            throw err;
        }
    }

    public static async fetchTxStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        try {
            const { status, orderHash } = await Injector.httpClient.get<OneinchStatusResponse>(
                `${this.apiUrl}/orders/v1.0/order/status/${data.srcTxHash}`
            );

            if (status === 'cancelled' || status === 'expired') {
                return {
                    hash: null,
                    status: TX_STATUS.FAIL
                };
            }

            if (status === 'executed') {
                return {
                    hash: orderHash,
                    status: TX_STATUS.SUCCESS
                };
            }

            return { status: TX_STATUS.PENDING, hash: null };
        } catch (err) {
            return { status: TX_STATUS.PENDING, hash: null };
        }
    }
}
