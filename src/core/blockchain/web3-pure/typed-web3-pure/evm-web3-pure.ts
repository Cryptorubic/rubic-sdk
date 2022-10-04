import { TypedWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/typed-web3-pure';
import Web3 from 'web3';
import { staticImplements } from 'src/common/utils/decorators';
import { AbiItem, fromAscii, isAddress, toChecksumAddress } from 'web3-utils';
import { TransactionGasParams } from 'src/features/on-chain/providers/abstract/on-chain-trade/evm-on-chain-trade/models/gas-params';
import { TransactionConfig } from 'web3-core';
import { compareAddresses } from 'src/common/utils/blockchain';
import { RubicSdkError } from 'src/common/errors';

@staticImplements<TypedWeb3Pure>()
export class EvmWeb3Pure {
    public static readonly EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

    private static web3Eth = new Web3().eth;

    public static get nativeTokenAddress(): string {
        return '0x0000000000000000000000000000000000000000';
    }

    public static isNativeAddress(address: string): boolean {
        return compareAddresses(address, EvmWeb3Pure.nativeTokenAddress);
    }

    public static isEmptyAddress(address?: string): boolean {
        return address === EvmWeb3Pure.EMPTY_ADDRESS;
    }

    public static isAddressCorrect(address: string): boolean {
        return isAddress(address);
    }

    /**
     * Converts address to bytes32 format.
     * @param address Address to convert.
     */
    public static addressToBytes32(address: string): string {
        if (address.slice(0, 2) !== '0x' || address.length !== 42) {
            console.error('Wrong address format');
            throw new RubicSdkError('Wrong address format');
        }

        return `0x${address.slice(2).padStart(64, '0')}`;
    }

    /**
     * Converts ascii address to bytes32 format.
     * @param address Address to convert.
     */
    public static asciiToBytes32(address: string): string {
        const bytes = fromAscii(address);
        return `0x${bytes.slice(2).padStart(64, '0')}`;
    }

    /**
     * Returns transaction config with encoded data.
     */
    public static encodeMethodCall(
        contractAddress: string,
        contractAbi: AbiItem[],
        method: string,
        parameters: unknown[] = [],
        value?: string,
        options: TransactionGasParams = {}
    ): TransactionConfig {
        const contract = new this.web3Eth.Contract(contractAbi);
        const data = contract.methods[method](...parameters).encodeABI();
        return {
            to: contractAddress,
            data,
            value,
            gas: options.gas,
            gasPrice: options.gasPrice
        };
    }

    /**
     * Encodes a function call using its JSON interface object and given parameters.
     * @param contractAbi The JSON interface object of a function.
     * @param methodName Method name to encode.
     * @param methodArguments Parameters to encode.
     * @returns An ABI encoded function call. Means function signature + parameters.
     */
    public static encodeFunctionCall(
        contractAbi: AbiItem[],
        methodName: string,
        methodArguments: unknown[]
    ): string {
        const methodSignature = contractAbi.find(abiItem => abiItem.name === methodName);
        if (methodSignature === undefined) {
            throw Error('No such method in abi');
        }
        return this.web3Eth.abi.encodeFunctionCall(methodSignature, methodArguments as string[]);
    }

    /**
     * Converts address to checksum format.
     * @param address Address to convert.
     */
    public static toChecksumAddress(address: string): string {
        return toChecksumAddress(address);
    }
}
