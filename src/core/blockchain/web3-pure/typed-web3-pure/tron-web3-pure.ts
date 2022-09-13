import { TypedWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/typed-web3-pure';
import { staticImplements } from 'src/common/utils/decorators';
import { compareAddresses } from 'src/common/utils/blockchain';
import { TronWeb } from 'src/core/blockchain/constants/tron/tron-web';
import { AbiInput, AbiItem, AbiOutput } from 'web3-utils';
import { InfiniteArray } from 'src/common/utils/types/infinite-array';
import { BigNumber as EthersBigNumber } from 'ethers';

@staticImplements<TypedWeb3Pure>()
export class TronWeb3Pure {
    public static get nativeTokenAddress(): string {
        return '0x0000000000000000000000000000000000000000';
    }

    public static isNativeAddress(address: string): boolean {
        return compareAddresses(address, TronWeb3Pure.nativeTokenAddress);
    }

    public static isAddressCorrect(address: string): boolean {
        return TronWeb.isAddress(address);
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
        const encodedParameters = TronWeb.utils.abi.encodeParams(
            this.flattenTypesToArray(methodSignature.inputs!),
            methodArguments
        );

        return encodedMethodSignature + encodedParameters.slice(2);
    }

    /**
     * Decodes method result using its JSON interface object and given parameters.
     * @param outputAbi The JSON interface object of an output of function.
     * @param response Bytes code returned after method call.
     * @returns Parsed method output.
     */
    public static decodeMethodOutput(outputAbi: AbiOutput[], response: string): string {
        const parsedResponse = TronWeb.utils.abi.decodeParams(
            [],
            this.flattenTypesToArray(outputAbi),
            response
        )[0];
        if (parsedResponse instanceof EthersBigNumber) {
            return parsedResponse.toString();
        }
        return parsedResponse;
    }

    private static flattenTypesToString(abiInputs: (AbiInput | AbiOutput)[]): string[] {
        return abiInputs.map(abiInput => {
            if (abiInput.type === 'tuple') {
                const flattenedComponents = this.flattenTypesToString(abiInput.components!);
                return `(${flattenedComponents.join(',')})`;
            }
            return abiInput.type;
        });
    }

    private static flattenTypesToArray(abiInputs: (AbiInput | AbiOutput)[]): InfiniteArray<string> {
        return abiInputs.map(abiInput => {
            if (abiInput.type === 'tuple') {
                return this.flattenTypesToArray(abiInput.components!);
            }
            return abiInput.type;
        });
    }
}
