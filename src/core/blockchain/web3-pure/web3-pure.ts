import { RubicSdkError } from '@common/errors/rubic-sdk-error';
import { NATIVE_TOKEN_ADDRESS } from '@core/blockchain/constants/native-token-address';
import BigNumber from 'bignumber.js';
import { toChecksumAddress, isAddress, toWei, fromWei } from 'web3-utils';

export class Web3Pure {
    /**
     * @description gets address of native coin {@link NATIVE_TOKEN_ADDRESS}
     */
    static get nativeTokenAddress(): string {
        return NATIVE_TOKEN_ADDRESS;
    }

    /**
     * @description increases the gas limit value by the specified percentage and rounds to the nearest integer
     * @param amount gas limit value to increase
     * @param percent the percentage by which the gas limit will be increased
     */
    static calculateGasMargin(
        amount: BigNumber | string | number | undefined,
        percent: number
    ): string {
        return new BigNumber(amount || '0').multipliedBy(percent).toFixed(0);
    }

    /**
     * @description convert amount from Ether to Wei units
     * @param amount amount to convert
     * @param [decimals=18] token decimals
     */
    static toWei(amount: BigNumber | string | number, decimals = 18): string {
        return new BigNumber(amount || 0).times(new BigNumber(10).pow(decimals)).toFixed(0);
    }

    /**
     * @description convert amount from Wei to Ether units
     * @param amountInWei amount to convert
     * @param [decimals=18] token decimals
     */
    static fromWei(amountInWei: BigNumber | string | number, decimals = 18): BigNumber {
        return new BigNumber(amountInWei).div(new BigNumber(10).pow(decimals));
    }

    /**
     * @description convert address to bytes32 format
     * @param address address to convert
     */
    static addressToBytes32(address: string): string {
        if (address.slice(0, 2) !== '0x' || address.length !== 42) {
            console.error('Wrong address format');
            throw new RubicSdkError('Wrong address format');
        }

        return `0x${address.slice(2).padStart(64, '0')}`;
    }

    /**
     * @description convert address to checksum format
     * @param address address to convert
     */
    static toChecksumAddress(address: string): string {
        return toChecksumAddress(address);
    }

    /**
     * @description checks if a given address is a valid Ethereum address
     * @param address the address to check validity
     */
    static isAddressCorrect(address: string): boolean {
        return isAddress(address);
    }

    /**
     * @description converts Eth amount into Wei
     * @param value to convert in Eth
     */
    static ethToWei(value: string | BigNumber): string {
        return toWei(value.toString(), 'ether');
    }

    /**
     * @description converts Wei amount into Eth
     * @param value to convert in Wei
     */
    static weiToEth(value: string | BigNumber): string {
        return fromWei(value.toString(), 'ether');
    }

    /**
     * @description checks if address is Ether native address
     * @param address address to check
     */
    static isNativeAddress = (address: string): boolean => {
        return address === NATIVE_TOKEN_ADDRESS;
    };
}
