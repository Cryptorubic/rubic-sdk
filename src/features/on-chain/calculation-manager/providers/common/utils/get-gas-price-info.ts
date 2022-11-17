import { GasPriceInfo } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/models/gas-price-info';
import { Injector } from 'src/core/injector/injector';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import BigNumber from 'bignumber.js';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

export async function getGasPriceInfo(blockchain: EvmBlockchainName): Promise<GasPriceInfo> {
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
