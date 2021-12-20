import BigNumber from 'bignumber.js';
import { TransactionConfig } from 'web3-core';
import { AbiItem } from 'web3-utils';
import { TransactionGasParams } from '../../../features/swap/models/gas-params';
export declare class Web3Pure {
    static readonly ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
    private static web3Eth;
    /**
     * @description gets address of native coin {@link NATIVE_TOKEN_ADDRESS}
     */
    static get nativeTokenAddress(): string;
    static isZeroAddress(address: string): boolean;
    /**
     * Increases the gas limit value by the specified percentage and rounds to the nearest integer.
     * @param gasLimit Gas limit value to increase.
     * @param multiplier The multiplier by which the gas limit will be increased.
     */
    static calculateGasMargin(gasLimit: BigNumber | string | number | undefined, multiplier: number): BigNumber;
    /**
     * @description convert amount from Ether to Wei units
     * @param amount amount to convert
     * @param [decimals=18] token decimals
     */
    static toWei(amount: BigNumber | string | number, decimals?: number): string;
    /**
     * @description convert amount from Wei to Ether units
     * @param amountInWei amount to convert
     * @param [decimals=18] token decimals
     */
    static fromWei(amountInWei: BigNumber | string | number, decimals?: number): BigNumber;
    /**
     * @description convert address to bytes32 format
     * @param address address to convert
     */
    static addressToBytes32(address: string): string;
    /**
     * @description convert address to checksum format
     * @param address address to convert
     */
    static toChecksumAddress(address: string): string;
    /**
     * @description checks if a given address is a valid Ethereum address
     * @param address the address to check validity
     */
    static isAddressCorrect(address: string): boolean;
    /**
     * @description converts Eth amount into Wei
     * @param value to convert in Eth
     */
    static ethToWei(value: string | BigNumber): string;
    /**
     * @description converts Wei amount into Eth
     * @param value to convert in Wei
     */
    static weiToEth(value: string | BigNumber): string;
    /**
     * @description checks if address is Ether native address
     * @param address address to check
     */
    static isNativeAddress: (address: string) => boolean;
    static encodeMethodCall(contractAddress: string, contractAbi: AbiItem[], method: string, parameters?: unknown[], value?: string, options?: TransactionGasParams): TransactionConfig;
    /**
     * Encodes a function call using its JSON interface object and given parameters.
     * @param contractAbi The JSON interface object of a function.
     * @param methodName Method name to encode.
     * @param methodArguments Parameters to encode.
     * @return string An ABI encoded function call. Means function signature + parameters.
     */
    static encodeFunctionCall(contractAbi: AbiItem[], methodName: string, methodArguments: unknown[]): string;
}
