import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { GasPriceInfo } from '@features/swap/models/gas-price-info';
import { Web3Pure } from '@core/blockchain/web3-pure/web3-pure';
import BigNumber from 'bignumber.js';
import { Injector } from '@core/sdk/injector';

export async function getGasPriceInfo(blockchain: BLOCKCHAIN_NAME): Promise<GasPriceInfo> {
    const [gasPrice, nativeCoinPrice] = await Promise.all([
        Injector.gasPriceApi.getGasPrice(blockchain),
        Injector.coingeckoApi.getNativeCoinPrice(blockchain)
    ]);
    const gasPriceInEth = Web3Pure.fromWei(gasPrice);
    const gasPriceInUsd = gasPriceInEth.multipliedBy(nativeCoinPrice);
    return {
        gasPrice: new BigNumber(gasPrice),
        gasPriceInEth,
        gasPriceInUsd
    };
}
