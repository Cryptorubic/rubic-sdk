import { EvmTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-transaction-options';
import { Web3Private } from 'src/core/blockchain/web3-private-service/web3-private/web3-private';
import {
    EIP1559Gas,
    SingleGasPrice
} from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/models/gas-price';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';

export function combineOptions<T extends object>(
    options: Partial<T> | undefined,
    defaultOptions: T
): T {
    return {
        ...defaultOptions,
        ...options
    };
}

export function deadlineMinutesTimestamp(deadlineMinutes: number): number {
    return Math.floor(Date.now() / 1000 + 60 * deadlineMinutes);
}

export function getGasOptions(
    options: SwapTransactionOptions | EvmTransactionOptions
): EIP1559Gas | SingleGasPrice | Record<never, never> {
    const { gasPriceOptions, gasPrice } = options;

    if (gasPrice && !gasPriceOptions)
        return {
            gasPrice: Web3Private.stringifyAmount(gasPrice)
        };

    if (!gasPriceOptions) return {};

    if ('gasPrice' in gasPriceOptions && gasPriceOptions.gasPrice) {
        return {
            gasPrice: Web3Private.stringifyAmount(gasPriceOptions.gasPrice)
        };
    }

    if (
        'maxPriorityFeePerGas' in gasPriceOptions &&
        gasPriceOptions.maxPriorityFeePerGas &&
        gasPriceOptions.maxFeePerGas
    ) {
        return {
            maxPriorityFeePerGas: Web3Private.stringifyAmount(gasPriceOptions.maxPriorityFeePerGas),
            maxFeePerGas: Web3Private.stringifyAmount(gasPriceOptions.maxFeePerGas)
        };
    }

    return {};
}
