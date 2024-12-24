import { Address } from '@ton/core';
import { RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount, Token } from 'src/common/tokens';
import { TonWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/ton-web3-pure/ton-web3-pure';
import { Injector } from 'src/core/injector/injector';

import { DedustPoolsResponse, DedustTxStep } from '../models/dedust-api-types';

export class DedustApiService {
    private static readonly apiUrl = 'https://api.dedust.io/v2';

    public static async findBestPools(from: PriceTokenAmount, to: Token): Promise<DedustTxStep[]> {
        const [fromAddresses, toAddresses] = await Promise.all([
            TonWeb3Pure.getAllFormatsOfAddress(from.address),
            TonWeb3Pure.getAllFormatsOfAddress(to.address)
        ]);

        const fromRawAddress = from.isNative ? 'native' : `jetton:${fromAddresses.raw_form}`;
        const toRawAddress = to.isNative ? 'native' : `jetton:${toAddresses.raw_form}`;

        const resp = await Injector.httpClient.post<DedustPoolsResponse>(
            `${this.apiUrl}/routing/plan`,
            {
                from: fromRawAddress,
                to: toRawAddress,
                amount: from.stringWeiAmount
            }
        );

        if (resp.length > 1) {
            throw new RubicSdkError('Multihop swaps are forbidden in dedust.');
        }
        const pools = resp[0];

        return pools.map(p => ({
            amountOut: p.amountOut,
            poolAddress: Address.parse(p.pool.address),
            srcTokenAddress: this.convertApiTokenAddressToPlain(p.assetIn),
            dstTokenAddress: this.convertApiTokenAddressToPlain(p.assetOut)
        }));
    }

    private static convertApiTokenAddressToPlain(address: string): string {
        if (address === 'native') return TonWeb3Pure.nativeTokenAddress;

        return Address.parse(address.replace(/jetton:/i, '')).toString();
    }
}
