import { OnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/on-chain-provider';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Injector } from 'src/core/injector/injector';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import {
    OnChainCalculationOptions,
    RequiredOnChainCalculationOptions
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { GasPriceInfo } from 'src/features/on-chain/calculation-manager/providers/dexes/common/models/gas-price-info';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { OnChainProxyService } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-proxy-service/on-chain-proxy-service';
import { OnChainIsUnavailableError } from 'src/common/errors/on-chain';
import { getGasPriceInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-price-info';
import { OnChainProxyFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

export abstract class EvmOnChainProvider extends OnChainProvider {
    public abstract readonly blockchain: EvmBlockchainName;

    protected readonly onChainProxyService = new OnChainProxyService();

    protected get walletAddress(): string {
        return Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.EVM).address;
    }

    protected get web3Public(): EvmWeb3Public {
        return Injector.web3PublicService.getWeb3Public(this.blockchain);
    }

    public abstract calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceToken<EvmBlockchainName>,
        options?: OnChainCalculationOptions
    ): Promise<EvmOnChainTrade>;

    protected async checkContractState(fromBlockchain: EvmBlockchainName): Promise<void | never> {
        const isPaused = await this.onChainProxyService.isContractPaused(fromBlockchain);
        if (isPaused) {
            throw new OnChainIsUnavailableError();
        }
    }

    protected async handleProxyContract(
        from: PriceTokenAmount<EvmBlockchainName>,
        fullOptions: RequiredOnChainCalculationOptions
    ): Promise<{
        fromWithoutFee: PriceTokenAmount<EvmBlockchainName>;
        proxyFeeInfo: OnChainProxyFeeInfo | undefined;
    }> {
        let fromWithoutFee: PriceTokenAmount<EvmBlockchainName>;
        let proxyFeeInfo: OnChainProxyFeeInfo | undefined;
        if (fullOptions.useProxy) {
            await this.checkContractState(from.blockchain);

            proxyFeeInfo = await this.onChainProxyService.getFeeInfo(
                from.blockchain,
                fullOptions.providerAddress
            );
            fromWithoutFee = getFromWithoutFee(from, proxyFeeInfo.platformFeePercent);
        } else {
            fromWithoutFee = from;
        }
        return {
            fromWithoutFee,
            proxyFeeInfo
        };
    }

    protected async getGasPriceInfo(): Promise<GasPriceInfo> {
        return getGasPriceInfo(this.blockchain);
    }
}
