import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { InstantTrade } from '@features/swap/instant-trade';
import { SwapCalculationOptions } from '@features/swap/models/swap-calculation-options';
import { Web3Public } from '@core/blockchain/web3-public/web3-public';
import { Injector } from '@core/sdk/injector';
import { GasPriceInfo } from '@features/swap/models/gas-price-info';
import { Web3Pure } from '@core/blockchain/web3-pure/web3-pure';
import BigNumber from 'bignumber.js';
import { GasFeeInfo } from '@features/swap/models/gas-fee-info';

export abstract class InstantTradeProvider {
    public abstract readonly blockchain: BLOCKCHAIN_NAME;

    protected abstract gasMargin: number;

    protected get web3Public(): Web3Public {
        return Injector.web3PublicService.getWeb3Public(this.blockchain);
    }

    public abstract calculate(
        from: PriceTokenAmount,
        to: PriceToken,
        options?: SwapCalculationOptions
    ): Promise<InstantTrade>;

    protected async getGasPriceInfo(): Promise<GasPriceInfo> {
        const [gasPrice, nativeCoinPrice] = await Promise.all([
            Injector.gasPriceApi.getGasPrice(this.blockchain),
            Injector.coingeckoApi.getNativeCoinPrice(this.blockchain)
        ]);
        const gasPriceInEth = Web3Pure.fromWei(gasPrice);
        const gasPriceInUsd = gasPriceInEth.multipliedBy(nativeCoinPrice);
        return {
            gasPrice: new BigNumber(gasPrice),
            gasPriceInEth,
            gasPriceInUsd
        };
    }

    protected getGasFeeInfo(
        estimatedGas: BigNumber | undefined,
        gasPriceInfo: GasPriceInfo
    ): GasFeeInfo {
        const gasLimit = estimatedGas
            ? Web3Pure.calculateGasMargin(estimatedGas, this.gasMargin)
            : undefined;

        if (!gasLimit) {
            return { gasPrice: gasPriceInfo.gasPrice };
        }
        const gasFeeInEth = gasPriceInfo.gasPriceInEth?.multipliedBy(gasLimit);
        const gasFeeInUsd = gasPriceInfo.gasPriceInUsd?.multipliedBy(gasLimit);

        return {
            gasLimit,
            gasPrice: gasPriceInfo.gasPrice,
            gasFeeInEth,
            gasFeeInUsd
        };
    }
}
