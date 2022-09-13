import BigNumber from 'bignumber.js';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import { BitcoinWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/bitcoin-web3-pure';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { staticImplements } from 'src/common/utils/decorators';
import { Web3PureContainer } from 'src/core/blockchain/web3-pure/models/web3-pure-container';
import { TronWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure';

/**
 * Contains common methods, connected with web3, e.g. wei conversion, encoding data, etc.
 */
@staticImplements<Web3PureContainer>()
export class Web3Pure {
    public static [CHAIN_TYPE.EVM] = EvmWeb3Pure;

    public static [CHAIN_TYPE.BITCOIN] = BitcoinWeb3Pure;

    public static [CHAIN_TYPE.TRON] = TronWeb3Pure;

    /**
     * Increases the gas limit value by the specified percentage and rounds to the nearest integer.
     * @param gasLimit Gas limit value to increase.
     * @param multiplier The multiplier by which the gas limit will be increased.
     */
    public static calculateGasMargin(
        gasLimit: BigNumber | string | number | undefined,
        multiplier: number
    ): BigNumber {
        return new BigNumber(gasLimit || '0').multipliedBy(multiplier).dp(0);
    }

    /**
     * Converts amount from Ether to Wei units.
     * @param amount Amount to convert.
     * @param decimals Token decimals.
     * @param roundingMode BigNumberRoundingMode.
     */
    public static toWei(
        amount: BigNumber | string | number,
        decimals = 18,
        roundingMode?: BigNumber.RoundingMode
    ): string {
        return new BigNumber(amount || 0)
            .times(new BigNumber(10).pow(decimals))
            .toFixed(0, roundingMode);
    }

    /**
     * Converts amount from Wei to Ether units.
     * @param amountInWei Amount to convert.
     * @param decimals Token decimals.
     */
    public static fromWei(amountInWei: BigNumber | string | number, decimals = 18): BigNumber {
        return new BigNumber(amountInWei).div(new BigNumber(10).pow(decimals));
    }
}
