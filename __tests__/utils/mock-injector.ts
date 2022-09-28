import { DefaultHttpClient } from 'src/core/http-client/default-http-client';
import { Web3PrivateService } from 'src/core/blockchain/web3-private-service/web3-private-service';
import { Web3PublicService } from 'src/core/blockchain/web3-public-service/web3-public-service';
import { Injector } from 'src/core/injector/injector';
import { Configuration } from 'src/core';

export async function mockInjector(configuration: Configuration): Promise<void> {
    const web3PublicService = new Web3PublicService(configuration.rpcProviders);
    const web3PrivateService = new Web3PrivateService(configuration.walletProvider);
    const httpClient = configuration.httpClient || (await DefaultHttpClient.getInstance());

    Injector.createInjector(web3PublicService, web3PrivateService, httpClient);
}

export function mockEmptyInjector(): void {
    // @ts-ignore
    Injector.createInjector(null, null, null);
}
