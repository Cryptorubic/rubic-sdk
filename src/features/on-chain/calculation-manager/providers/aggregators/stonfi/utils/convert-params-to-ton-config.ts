import { SenderArguments } from '@ton/core';
import { TonEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/models/ton-types';

export function convertTxParamsToTonConfig(txParams: SenderArguments): TonEncodedConfig {
    return {
        address: txParams.to.toString(),
        amount: txParams.value.toString(),
        payload: txParams.body?.toBoc().toString('base64')
    };
}
