import BigNumber from 'bignumber.js';
import {
    GasPrice,
    GasPriceBN
} from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/models/gas-price';

export function convertGasDataToBN(gasData: GasPrice): GasPriceBN {
    return Object.entries(gasData).reduce(
        (acc, [key, value]) => ({
            ...acc,
            [key]: new BigNumber(value)
        }),
        {}
    );
}
