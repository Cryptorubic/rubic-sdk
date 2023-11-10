import BigNumber from 'bignumber.js';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { GasPriceInfo } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/models/gas-price-info';

export function getGasFeeInfo(
    estimatedGas: BigNumber | string | number | null | undefined,
    gasPriceInfo: GasPriceInfo | undefined
): GasFeeInfo {
    const gasLimit = estimatedGas ? Web3Pure.calculateGasMargin(estimatedGas, 1.2) : undefined;

    if (!gasLimit) {
        return { gasPrice: gasPriceInfo?.gasPrice };
    }
    const gasFeeInEth = gasPriceInfo?.gasPriceInEth?.multipliedBy(gasLimit);
    const gasFeeInUsd = gasPriceInfo?.gasPriceInUsd?.multipliedBy(gasLimit);

    return {
        gasLimit,
        gasPrice: gasPriceInfo?.gasPrice,
        gasFeeInEth,
        gasFeeInUsd,
        maxFeePerGas: gasPriceInfo?.maxFeePerGas
    };
}
