import { ethers } from 'ethers';
import { FunctionFragment, Result } from 'ethers/lib/utils';
import { RubicSdkError } from 'src/common/errors';
import { compareAddresses } from 'src/common/utils/blockchain';
import { staticImplements } from 'src/common/utils/decorators';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { TypedWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/typed-web3-pure';
import { TransactionGasParams } from 'src/features/on-chain/calculation-manager/common/on-chain-trade/evm-on-chain-trade/models/gas-params';
import Web3 from 'web3';
import { AbiItem, fromAscii, isAddress, randomHex, toChecksumAddress } from 'web3-utils';

export type DecodeResult<T> = Result & T;

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

    public static async isAddressCorrect(address: string): Promise<boolean> {
        return isAddress(address);
    }

    public static encodeParameters(types: string[], params: unknown[]): string {
        return EvmWeb3Pure.web3Eth.abi.encodeParameters(types, params);
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
     * Generate random HEX strings from a given byte size.
     * @param size byte size.
     */
    public static randomHex(size: number): string {
        return randomHex(size);
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
    ): EvmEncodeConfig {
        const contract = new this.web3Eth.Contract(contractAbi);
        const data = contract.methods[method](...parameters).encodeABI();
        return {
            to: contractAddress,
            data,
            value: value || '0',
            gas: options.gas,
            gasPrice: options.gasPrice,
            maxFeePerGas: options.maxFeePerGas,
            maxPriorityFeePerGas: options.maxPriorityFeePerGas
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

    /**
     * Decodes data by ABI.
     * @param functionName Function name in ABI.
     * @param functionArguments Array of function's inputs.
     * @param data Data (hex string).
     * @returns Decoded data.
     */
    public static decodeData<T>(
        functionName: string,
        functionArguments: Array<[type: string, name: string]>,
        data: string
    ): T {
        const argumentsString = functionArguments.map(arg => arg.join(' ')).join(', ');
        const abiString = `function ${functionName}(${argumentsString})`;
        const abi = new ethers.utils.Interface([abiString]);
        const abiFunctionKey = Object.keys(abi.functions)[0] as string;
        return abi.decodeFunctionData(abi.functions[abiFunctionKey] as FunctionFragment, data) as T;
    }
}
