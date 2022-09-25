import { Web3Public } from 'src/core/blockchain/web3-public-service/web3-public/web3-public';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { GasFeeInfo } from 'src/features/instant-trades/providers/models/gas-fee-info';
import { CalculationOptions } from 'src/features/instant-trades/providers/models/calculation-options';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { InstantTrade } from 'src/features/instant-trades/providers/abstract/instant-trade';
import { Injector } from 'src/core/injector/injector';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { GasPriceInfo } from 'src/features/instant-trades/providers/dexes/abstract/models/gas-price-info';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { TradeType } from 'src/features/instant-trades/providers/models/trade-type';
import BigNumber from 'bignumber.js';
import { HttpClient } from 'src/core/http-client/models/http-client';

/**
 * Abstract class for all instant trade providers.
 */
export abstract class InstantTradeProvider {
    /**
     * Provider blockchain.
     */
    public abstract readonly blockchain: EvmBlockchainName;

    protected abstract readonly gasMargin: number;

    /**
     * Type of provider.
     */
    public abstract get type(): TradeType;

    protected get walletAddress(): string {
        return Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.EVM).address;
    }

    protected get web3Public(): Web3Public {
        return Injector.web3PublicService.getWeb3Public(this.blockchain);
    }

    protected get httpClient(): HttpClient {
        return Injector.httpClient;
    }

    /**
     * Calculates instant trade.
     * @param from Token to sell with input amount.
     * @param to Token to get.
     * @param options Additional options.
     */
    public abstract calculate(
        from: PriceTokenAmount,
        to: PriceToken,
        options?: CalculationOptions
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
