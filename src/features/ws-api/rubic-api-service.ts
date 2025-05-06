import {
    QuoteAllInterface,
    QuoteRequestInterface,
    SwapRequestInterface,
    WsQuoteRequestInterface,
    WsQuoteResponseInterface
} from '@cryptorubic/core';
import { catchError, concatMap, from, fromEvent, map, Observable, of } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import {
    InsufficientFundsError,
    InsufficientFundsGasPriceValueError,
    RubicSdkError,
    UnsupportedReceiverAddressError
} from 'src/common/errors';
import { UnapprovedContractError } from 'src/common/errors/proxy/unapproved-contract-error';
import { UnapprovedMethodError } from 'src/common/errors/proxy/unapproved-method-error';
import { UnlistedError } from 'src/common/errors/proxy/unlisted-error';
import { TradeExpiredError } from 'src/common/errors/swap/trade-expired.error';
import { Injector } from 'src/core/injector/injector';
import { EnvType } from 'src/core/sdk/models/env-type';
import { WrappedCrossChainTradeOrNull } from 'src/features/cross-chain/calculation-manager/models/wrapped-cross-chain-trade-or-null';
import { WrappedOnChainTradeOrNull } from 'src/features/on-chain/calculation-manager/models/wrapped-on-chain-trade-or-null';
import { SwapErrorResponseInterface } from 'src/features/ws-api/models/swap-error-response-interface';
import { WrappedAsyncTradeOrNull } from 'src/features/ws-api/models/wrapped-async-trade-or-null';
import { TransformUtils } from 'src/features/ws-api/transform-utils';
import { ExecutionRevertedError } from 'viem';

import { TransferSwapRequestInterface } from './chains/transfer-trade/models/transfer-swap-request-interface';
import { rubicApiLinkMapping } from './constants/rubic-api-link-mapping';
import { CrossChainTxStatusConfig } from './models/cross-chain-tx-status-config';
import { RubicApiErrorDto } from './models/rubic-api-error';
import { SwapResponseInterface } from './models/swap-response-interface';

export class RubicApiService {
    private get apiUrl(): string {
        const rubicApiLink = rubicApiLinkMapping[this.envType];

        return rubicApiLink ? rubicApiLink : 'https://api-v2.rubic.exchange';
    }

    private readonly client = this.getSocket();

    private latestQuoteParams: QuoteRequestInterface | null = null;

    constructor(private readonly envType: EnvType) {}

    private getSocket(): Socket {
        const ioClient = io(this.apiUrl, {
            reconnectionDelayMax: 10000,
            path: '/api/routes/ws/',
            transports: ['websocket']
        });
        return ioClient;
    }

    public calculateAsync(params: WsQuoteRequestInterface, attempt = 0): void {
        this.latestQuoteParams = params;
        if (attempt > 2) {
            return;
        }
        if (this.client.connected) {
            this.client.emit('calculate', params);
        } else {
            const repeatInterval = 3_000;
            setTimeout(() => {
                this.calculateAsync(params, attempt + 1);
            }, repeatInterval);
        }
    }

    public stopCalculation(): void {
        if (this.latestQuoteParams) {
            this.client.emit('stopCalculation');
            this.latestQuoteParams = null;
        }
    }

    public async fetchSwapData<T>(
        body: SwapRequestInterface | TransferSwapRequestInterface
    ): Promise<SwapResponseInterface<T>> {
        try {
            const result = await Injector.httpClient.post<
                SwapResponseInterface<T> | SwapErrorResponseInterface
            >(`${this.apiUrl}/api/routes/swap`, body);
            if ('error' in result) {
                throw this.getApiError(result.error);
            }
            return result;
        } catch (err) {
            if (err instanceof RubicSdkError) {
                throw err;
            }
            if ('error' in err) {
                throw this.getApiError((err as { error: SwapErrorResponseInterface }).error.error);
            }
            throw this.getApiError(err);
        }
    }

    public fetchRoutes(body: QuoteRequestInterface): Promise<QuoteAllInterface> {
        return Injector.httpClient.post<QuoteAllInterface>(
            `${this.apiUrl}/api/routes/quoteAll`,
            body
        );
    }

    public async fetchBestSwapData<T>(
        body: SwapRequestInterface | TransferSwapRequestInterface
    ): Promise<SwapResponseInterface<T>> {
        try {
            const result = await Injector.httpClient.post<
                SwapResponseInterface<T> | SwapErrorResponseInterface
            >(`${this.apiUrl}/api/routes/swapBest`, body);
            if ('error' in result) {
                throw this.getApiError(result.error);
            }
            return result;
        } catch (err) {
            if (err instanceof RubicSdkError) {
                throw err;
            }
            if ('error' in err) {
                throw this.getApiError((err as { error: SwapErrorResponseInterface }).error.error);
            }
            throw this.getApiError(err);
        }
    }

    public fetchCelerRefundData(): void {
        // return Injector.httpClient.post<TransactionInterface>(
        //     `${this.apiUrl}/api/routes/swap`,
        //     body
        // );
    }

    public disconnectSocket(): void {
        this.client.disconnect();
    }

    public closetSocket(): void {
        this.client.close();
    }

    public handleQuotesAsync(): Observable<WrappedAsyncTradeOrNull> {
        return fromEvent<
            WsQuoteResponseInterface & {
                data: RubicApiErrorDto;
                type: string;
            }
        >(this.client, 'events').pipe(
            concatMap(wsResponse => {
                const { trade, total, calculated, data } = wsResponse;
                let promise: Promise<
                    null | WrappedCrossChainTradeOrNull | WrappedOnChainTradeOrNull
                > = Promise.resolve(null);

                const rubicApiError = data
                    ? {
                          ...data,
                          type: wsResponse.type
                      }
                    : data;

                promise =
                    this.latestQuoteParams?.srcTokenBlockchain !==
                    this.latestQuoteParams?.dstTokenBlockchain
                        ? TransformUtils.transformCrossChain(
                              trade!,
                              this.latestQuoteParams!,
                              this.latestQuoteParams!.integratorAddress!,
                              rubicApiError
                          )
                        : TransformUtils.transformOnChain(
                              trade!,
                              this.latestQuoteParams!,
                              this.latestQuoteParams!.integratorAddress!,
                              rubicApiError
                          );
                return from(promise).pipe(
                    catchError(err => {
                        console.log(err);
                        return of(null);
                    }),
                    map(wrappedTrade => ({
                        total,
                        calculated,
                        wrappedTrade
                    }))
                );
            })
        );
    }

    public fetchCrossChainTxStatus(srcTxHash: string): Promise<CrossChainTxStatusConfig> {
        return Injector.httpClient.get(`${this.apiUrl}/api/info/status?srcTxHash=${srcTxHash}`);
    }

    public fetchCrossChainTxStatusExtended(
        srcTxHash: string,
        rubicId: string
    ): Promise<CrossChainTxStatusConfig> {
        return Injector.httpClient.get(
            `${this.apiUrl}/api/info/statusExtended?srcTxHash=${srcTxHash}&rubicId=${rubicId}`
        );
    }

    public getMessageToAuthWallet(walletAddress: string): Promise<{ messageToAuth: string }> {
        return Injector.httpClient.get(
            `${this.apiUrl}/api/utility/authWalletMessage?walletAddress=${walletAddress}`
        );
    }

    private getApiError(result: RubicApiErrorDto): RubicSdkError {
        switch (result.code) {
            case 3003: {
                return new InsufficientFundsError((result.data as { symbol: string }).symbol);
            }
            case 3004: {
                return new InsufficientFundsGasPriceValueError();
            }
            case 3005: {
                return new ExecutionRevertedError();
            }
            case 3006: {
                return new UnsupportedReceiverAddressError();
            }
            case 4001: {
                return new RubicSdkError('Meson only supports proxy swaps!');
            }
            case 4002: {
                const method = result.reason.split('Selector - ')?.[1]?.slice(0, -1);
                return new UnapprovedMethodError(method || 'Unknown');
            }
            case 4003: {
                const contract = result.reason.split('Contract - ')[1]?.slice(0, -1);
                return new UnapprovedContractError(contract || 'Unknown');
            }
            case 4004: {
                const contractAndSelector = result.reason.split('Selector - ')?.[1]?.slice(0, -1);
                const [method, contract] = contractAndSelector?.split('. Contract - ') || [
                    'Unknown',
                    'Unknown'
                ];
                return new UnlistedError(contract || 'Unknown', method || 'Unknown');
            }
            case 1004: {
                return new TradeExpiredError();
            }
        }
        return new RubicSdkError(result?.reason || 'Unknown error');
    }
}
