import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { parseError } from 'src/common/utils/errors';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { Web3PrivateSupportedBlockchain } from 'src/core/blockchain/web3-private-service/models/web-private-supported-blockchain';
import { Web3Public } from 'src/core/blockchain/web3-public-service/web3-public/web3-public';
import { HttpClient } from 'src/core/http-client/models/http-client';
import { Injector } from 'src/core/injector/injector';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CrossChainTradeType } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { AbiItem } from 'web3-utils';

import { GasData } from './evm-cross-chain-trade/models/gas-data';

export abstract class CrossChainProvider {
    public static parseError(err: unknown): RubicSdkError {
        return parseError(err, 'Cannot calculate cross-chain trade');
    }

    public abstract readonly type: CrossChainTradeType;

    protected get httpClient(): HttpClient {
        return Injector.httpClient;
    }

    public abstract isSupportedBlockchain(fromBlockchain: BlockchainName): boolean;

    public areSupportedBlockchains(
        fromBlockchain: BlockchainName,
        toBlockchain: BlockchainName
    ): boolean {
        return (
            this.isSupportedBlockchain(fromBlockchain) && this.isSupportedBlockchain(toBlockchain)
        );
    }

    protected getFromWeb3Public(fromBlockchain: BlockchainName): Web3Public {
        return Injector.web3PublicService.getWeb3Public(fromBlockchain);
    }

    public abstract calculate(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult>;

    protected getWalletAddress(blockchain: Web3PrivateSupportedBlockchain): string {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(blockchain).address;
    }

    protected abstract getRoutePath(...options: unknown[]): Promise<RubicStep[]>;

    /**
     * Gets fee information.
     * @param _fromBlockchain Source network blockchain.
     * @param _providerAddress Integrator address.
     * @param _percentFeeToken Protocol fee token.
     * @param _useProxy Use rubic proxy or not.
     * @param _contractAbi Rubic Proxy contract abi.
     * @protected
     * @internal
     */
    protected async getFeeInfo(
        _fromBlockchain: Partial<BlockchainName>,
        _providerAddress: string,
        _percentFeeToken: PriceToken,
        _useProxy: boolean,
        _contractAbi?: AbiItem[]
    ): Promise<FeeInfo> {
        return {};
    }

    protected async getGasData(
        from: PriceTokenAmount,
        gasData: {
            gasLimit?: string;
            totalGas?: string;
        } = {}
    ): Promise<GasData | null> {
        try {
            if (!gasData.gasLimit && !gasData.totalGas) return null;
            if (!BlockchainsInfo.isEvmBlockchainName(from.blockchain)) return null;

            const gasPriceInfo = await Injector.gasPriceApi.getGasPrice(from.blockchain);

            return {
                ...(gasData.totalGas && { totalGas: new BigNumber(gasData.totalGas) }),
                ...(gasData.gasLimit && { gasLimit: new BigNumber(gasData.gasLimit) }),
                ...(gasPriceInfo.gasPrice && { gasPrice: new BigNumber(gasPriceInfo.gasPrice) }),
                ...(gasPriceInfo.baseFee && { baseFee: new BigNumber(gasPriceInfo.baseFee) }),
                ...(gasPriceInfo.maxFeePerGas && {
                    maxFeePerGas: new BigNumber(gasPriceInfo.maxFeePerGas)
                }),
                ...(gasPriceInfo.maxPriorityFeePerGas && {
                    maxPriorityFeePerGas: new BigNumber(gasPriceInfo.maxPriorityFeePerGas)
                })
            };
        } catch {
            return null;
        }
    }
}
