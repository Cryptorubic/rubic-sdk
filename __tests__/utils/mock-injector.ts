import { DefaultHttpClient } from '@common/http/default-http-client';
import { Web3PrivateFactory } from '@core/blockchain/web3-private/web3-private-factory';
import { Web3PublicService } from '@core/blockchain/web3-public/web3-public-service';
import { Injector } from '@core/sdk/injector';
import { Configuration } from 'src/core';

export async function mockInjector(configuration: Configuration): Promise<void> {
    const web3PublicService = await Web3PublicService.createWeb3PublicService(
        configuration.rpcProviders
    );
    const web3Private = await Web3PrivateFactory.createWeb3Private(configuration.walletProvider);
    const httpClient = configuration.httpClient || (await DefaultHttpClient.getInstance());

    Injector.createInjector(web3PublicService, web3Private, httpClient);
}

export function mockEmptyInjector(): void {
    // @ts-ignore
    Injector.createInjector(null, null, null);
}
