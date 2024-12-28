import BigNumber from 'bignumber.js';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { GasPriceInfo } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/models/gas-price-info';

export function getGasFeeInfo(
    gasPriceInfo: GasPriceInfo | undefined,
    gasData: { gasLimit?: BigNumber; totalGas?: BigNumber } = {}
): GasFeeInfo {
    const gasLimit = gasData.gasLimit
        ? Web3Pure.calculateGasMargin(gasData.gasLimit, 1.2)
        : new BigNumber(0);

    const gasFeeInEth = gasPriceInfo?.gasPriceInEth?.multipliedBy(gasLimit);
    const gasFeeInUsd = gasPriceInfo?.gasPriceInUsd?.multipliedBy(gasLimit);

    return {
        ...(gasData.totalGas && { totalGas: gasData.totalGas }),
        ...(gasLimit.gt(0) && { gasLimit }),
        gasPrice: gasPriceInfo?.gasPrice,
        gasFeeInEth,
        gasFeeInUsd,
        maxFeePerGas: gasPriceInfo?.maxFeePerGas
    };
}
