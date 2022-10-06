import { AbiItem } from 'web3-utils';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';

interface DecodedData {
    name: string;
    params: { name: string; value: string; type: string }[];
}

export class MethodDecoder {
    public static decodeMethod(abiItem: AbiItem, data: string): DecodedData {
        const abiCoder = new Web3().eth.abi;
        const inputs = abiItem.inputs!;
        const decoded = abiCoder.decodeParameters(inputs, data.slice(10));

        const decodedData: DecodedData = {
            name: abiItem.name!,
            params: []
        };

        for (let i = 0; i < decoded.__length__; i++) {
            const param = decoded[i];
            let parsedParam = param;
            const isUint = inputs[i]!.type.indexOf('uint') === 0;
            const isInt = inputs[i]!.type.indexOf('int') === 0;
            const isAddress = inputs[i]!.type.indexOf('address') === 0;

            if (isUint || isInt) {
                const isArray = Array.isArray(param);

                if (isArray) {
                    parsedParam = param.map(val => new BigNumber(val).toFixed());
                } else {
                    parsedParam = new BigNumber(param).toFixed();
                }
            }

            // Addresses returned by web3 are randomly cased so we need to standardize and lowercase all
            if (isAddress) {
                const isArray = Array.isArray(param);

                if (isArray) {
                    parsedParam = param.map(_ => _.toLowerCase());
                } else {
                    parsedParam = param.toLowerCase();
                }
            }

            decodedData.params.push({
                name: inputs[i]!.name,
                value: parsedParam,
                type: inputs[i]!.type
            });
        }

        return decodedData;
    }
}
