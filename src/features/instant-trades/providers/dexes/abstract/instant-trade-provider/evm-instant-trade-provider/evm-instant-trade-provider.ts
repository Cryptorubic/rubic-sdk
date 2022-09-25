import { InstantTradeProvider } from 'src/features/instant-trades/providers/dexes/abstract/instant-trade-provider/instant-trade-provider';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Injector } from 'src/core/injector/injector';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { CalculationOptions } from 'src/features/instant-trades/providers/models/calculation-options';
import { GasPriceInfo } from 'src/features/instant-trades/providers/dexes/abstract/models/gas-price-info';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import BigNumber from 'bignumber.js';
import { GasFeeInfo } from 'src/features/instant-trades/providers/models/gas-fee-info';
import { EvmInstantTrade } from 'src/features/instant-trades/providers/abstract/evm-instant-trade/evm-instant-trade';

export abstract class EvmInstantTradeProvider extends InstantTradeProvider {
    public abstract readonly blockchain: EvmBlockchainName;

    protected abstract readonly gasMargin: number;

    protected get walletAddress(): string {
        return Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.EVM).address;
    }

    protected get web3Public(): EvmWeb3Public {
        return Injector.web3PublicService.getWeb3Public(this.blockchain);
    }

    public abstract calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceToken<EvmBlockchainName>,
        options?: CalculationOptions
    ): Promise<EvmInstantTrade>;

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
        estimatedGas: BigNumber | string | number | undefined,
        gasPriceInfo: GasPriceInfo | undefined
    ): GasFeeInfo {
        const gasLimit = estimatedGas
            ? Web3Pure.calculateGasMargin(estimatedGas, this.gasMargin)
            : undefined;

        if (!gasLimit) {
            return { gasPrice: gasPriceInfo?.gasPrice };
        }
        const gasFeeInEth = gasPriceInfo?.gasPriceInEth?.multipliedBy(gasLimit);
        const gasFeeInUsd = gasPriceInfo?.gasPriceInUsd?.multipliedBy(gasLimit);

        return {
            gasLimit,
            gasPrice: gasPriceInfo?.gasPrice,
            gasFeeInEth,
            gasFeeInUsd
        };
    }
}
