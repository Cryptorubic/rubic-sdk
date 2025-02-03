import {
    QuoteAllInterface,
    QuoteRequestInterface,
    SwapRequestInterface,
    WsQuoteRequestInterface,
    WsQuoteResponseInterface
} from '@cryptorubic/core';
import { catchError, concatMap, from, fromEvent, map, Observable, of } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { Injector } from 'src/core/injector/injector';
import { WrappedCrossChainTradeOrNull } from 'src/features/cross-chain/calculation-manager/models/wrapped-cross-chain-trade-or-null';
import { WrappedOnChainTradeOrNull } from 'src/features/on-chain/calculation-manager/models/wrapped-on-chain-trade-or-null';
import { WrappedAsyncTradeOrNull } from 'src/features/ws-api/models/wrapped-async-trade-or-null';
import { TransformUtils } from 'src/features/ws-api/transform-utils';

import { CrossChainTxStatusConfig } from './models/cross-chain-tx-status-config';
import { SwapResponseInterface } from './models/swap-response-interface';

export class RubicApiService {
    private get apiUrl(): string {
        const env = this.envType;
        if (env === 'local') {
            return 'http://localhost:3000';
        }
        if (env === 'dev') {
            return 'https://dev-api-v2.rubic.exchange';
        }
        if (env === 'dev2') {
            return 'https://dev2-api-v2.rubic.exchange';
        }
        return 'https://api-v2.rubic.exchange';
    }

    private readonly client = this.getSocket();

    private latestQuoteParams: QuoteRequestInterface | null = null;

    constructor(private readonly envType: string) {}

    private getSocket(): Socket {
        const ioClient = io(this.apiUrl, {
            reconnectionDelayMax: 10000,
            path: '/api/routes/ws/'
        });
        return ioClient;
    }

    public calculateAsync(params: WsQuoteRequestInterface): void {
        this.latestQuoteParams = params;
        this.client.emit('calculate', params);
    }

    public fetchSwapData<T>(body: SwapRequestInterface): Promise<SwapResponseInterface<T>> {
        return Injector.httpClient.post<SwapResponseInterface<T>>(
            `${this.apiUrl}/api/routes/swap`,
            body
        );
    }

    public fetchRoutes(body: QuoteRequestInterface): Promise<QuoteAllInterface> {
        return Injector.httpClient.post<QuoteAllInterface>(
            `${this.apiUrl}/api/routes/quoteAll`,
            body
        );
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
        return fromEvent<WsQuoteResponseInterface>(this.client, 'events').pipe(
            concatMap(wsResponse => {
                const { trade, total, calculated } = wsResponse;

                let promise: Promise<
                    null | WrappedCrossChainTradeOrNull | WrappedOnChainTradeOrNull
                > = Promise.resolve(null);
                if (trade) {
                    promise =
                        trade.swapType === 'cross-chain'
                            ? TransformUtils.transformCrossChain(
                                  trade,
                                  this.latestQuoteParams!,
                                  this.latestQuoteParams!.integratorAddress!
                              )
                            : TransformUtils.transformOnChain(
                                  trade,
                                  this.latestQuoteParams!,
                                  this.latestQuoteParams!.integratorAddress!
                              );
                }
                return from(promise).pipe(
                    catchError(() => of(null)),
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
}
