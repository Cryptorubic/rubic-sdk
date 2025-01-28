import { BigNumber as EthersBigNumber } from 'ethers';
import { compareAddresses } from 'src/common/utils/blockchain';
import { staticImplements } from 'src/common/utils/decorators';
import { InfiniteArray } from 'src/common/utils/types';
import {
    TronWeb3PrimitiveType,
    Web3PrimitiveType
} from 'src/core/blockchain/models/web3-primitive-type';
import { TronParameters } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/models/tron-parameters';
import { TronTransactionConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/models/tron-transaction-config';
import { TypedWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/typed-web3-pure';
import { TronWeb, utils as TronUtils } from 'tronweb';
import { AbiInput, AbiItem, AbiOutput } from 'web3-utils';

@staticImplements<TypedWeb3Pure>()
export class TronWeb3Pure {
    public static readonly EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

    public static get nativeTokenAddress(): string {
        return '0x0000000000000000000000000000000000000000';
    }

    public static isNativeAddress(address: string): boolean {
        return compareAddresses(address, TronWeb3Pure.nativeTokenAddress);
    }

    public static isEmptyAddress(address?: string): boolean {
        return address === TronWeb3Pure.EMPTY_ADDRESS;
    }

    public static async isAddressCorrect(address: string): Promise<boolean> {
        return TronWeb.isAddress(address);
    }

    public static addressToHex(address: string): string {
        return TronWeb.address.toHex(address).replace(/^41/, '0x');
    }

    /**
     * Returns transaction config with encoded data.
     */
    public static encodeMethodCall(
        contractAddress: string,
        contractAbi: AbiItem[],
        methodName: string,
        methodArguments: TronParameters,
        callValue?: number,
        feeLimit?: number
    ): TronTransactionConfig {
        const methodAbi = contractAbi.find(abiItem => abiItem.name === methodName);
        if (!methodAbi) {
            throw new Error('Encode fail. No method in ABI');
        }

        const signature = `${methodAbi.name!}(${this.flattenTypesToString(methodAbi.inputs!).join(
            ','
        )})`;

        return {
            to: contractAddress,
            arguments: methodArguments,
            signature,
            ...(callValue && { callValue }),
            ...(feeLimit && { feeLimit })
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

        const encodedMethodSignature = TronWeb.sha3(
            `${methodSignature.name!}(${this.flattenTypesToString(methodSignature.inputs!).join(
                ','
            )})`
        ).slice(0, 10);
        const encodedParameters = TronUtils.abi.encodeParams(
            this.flattenTypesToArray(methodSignature.inputs!) as string[],
            methodArguments
        );

        return encodedMethodSignature + encodedParameters.slice(2);
    }

    public static encodeMethodSignature(
        methodSignature: string,
        parameters: TronParameters
    ): string {
        const encodedMethodSignature = TronWeb.sha3(methodSignature).slice(0, 10);
        const flattenedParameters = this.flattenParameters(parameters);
        const encodedParameters = TronUtils.abi.encodeParams(
            flattenedParameters[0] as string[],
            flattenedParameters[1]
        );

        return encodedMethodSignature + encodedParameters.slice(2);
    }

    /**
     * Decodes method result using its JSON interface object and given parameters.
     * @param outputAbi The JSON interface object of an output of function.
     * @param response Bytes code returned after method call.
     * @returns Parsed method output.
     */
    public static decodeMethodOutput(outputAbi: AbiOutput[], response: string): Web3PrimitiveType {
        const decodedParam: TronWeb3PrimitiveType = TronUtils.abi.decodeParams(
            [],
            this.flattenTypesToArray(outputAbi) as string[],
            response
        )[0];
        return this.flattenParameterToPrimitive(decodedParam);
    }

    private static flattenTypesToString(abiInputs: (AbiInput | AbiOutput)[]): string[] {
        return (
            abiInputs?.map(abiInput => {
                if (abiInput.type === 'tuple') {
                    const flattenedComponents = this.flattenTypesToString(abiInput.components!);
                    return `(${flattenedComponents.join(',')})`;
                }
                return abiInput.type;
            }) || []
        );
    }

    private static flattenTypesToArray(abiInputs: (AbiInput | AbiOutput)[]): InfiniteArray<string> {
        return (
            abiInputs?.map(abiInput => {
                if (abiInput.type === 'tuple') {
                    return this.flattenTypesToArray(abiInput.components!);
                }
                return abiInput.type;
            }) || []
        );
    }

    private static flattenParameters(
        parameters: TronParameters
    ): [InfiniteArray<string>, InfiniteArray<string>] {
        const types: InfiniteArray<string> = [];
        const values: InfiniteArray<string> = [];
        parameters.forEach(parameter => {
            if (parameter.type === 'tuple') {
                const flattenedParameters = this.flattenParameters(
                    parameter.value as TronParameters
                );
                types.push(flattenedParameters[0]);
                values.push(flattenedParameters[1]);
            } else {
                types.push(parameter.type);
                values.push(parameter.value as string);
            }
        });
        return [types, values];
    }

    public static flattenParameterToPrimitive(parameter: TronWeb3PrimitiveType): Web3PrimitiveType {
        if (
            typeof parameter === 'number' ||
            parameter instanceof EthersBigNumber ||
            typeof parameter === 'bigint'
        ) {
            return parameter.toString();
        }
        if (typeof parameter === 'string' || typeof parameter === 'boolean') {
            return parameter;
        }
        return Object.keys(parameter).reduce((acc, paramKey) => {
            const parameterField = (parameter as { [key: string]: TronWeb3PrimitiveType })[
                paramKey
            ] as TronWeb3PrimitiveType;
            return {
                ...acc,
                [paramKey]: this.flattenParameterToPrimitive(parameterField)
            };
        }, {});
    }
}
