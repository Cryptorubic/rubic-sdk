import BigNumber from 'bignumber.js';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { GasPriceInfo } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/models/gas-price-info';

export async function getGasPriceInfo(blockchain: EvmBlockchainName): Promise<GasPriceInfo> {
    const address = nativeTokensList[blockchain].address;
    const [{ gasPrice, maxFeePerGas }, nativeCoinPrice] = await Promise.all([
        Injector.gasPriceApi.getGasPrice(blockchain),
        Injector.coingeckoApi.getTokenPrice({ address, blockchain }).catch(() => new BigNumber(0))
    ]);

    const gasPriceInEth = Web3Pure.fromWei(maxFeePerGas || gasPrice || 0);

    const gasPriceInUsd = gasPriceInEth.multipliedBy(nativeCoinPrice);
    return {
        gasPrice: new BigNumber(gasPrice || 0),
        gasPriceInEth,
        gasPriceInUsd,
        maxFeePerGas: new BigNumber(maxFeePerGas || 0)
    };
}
