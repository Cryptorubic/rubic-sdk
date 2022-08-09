import { TransactionReceipt } from 'web3-eth';
import { AbiItem, sha3, AbiInput } from 'web3-utils';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';

interface DecodedLogData {
    name: string;
    type: string;
    value?: string;
}

interface DecodedLog {
    name: string;
    address: string;
    params: DecodedLogData[];
}

interface Log {
    data: string;
    topics: string[];
    address: string;
}

export class LogsDecoder {
    /**
     * Converts abi type to string.
     * @param input Abi input.
     */
    private static typeToString(input: AbiInput): string {
        if (input.type === 'tuple') {
            return `(${input?.components?.map(LogsDecoder.typeToString).join(',')})`;
        }
        return input.type;
    }

    /**
     * Constructs methods ids from contract events items.
     * @param abiItems Abi items.
     */
    private static constructMethodIds(abiItems: AbiItem[]): Record<string, AbiItem> {
        return abiItems.reduce((allItems, abiItem) => {
            if (abiItem.name) {
                const sig = sha3(
                    `${abiItem.name}(${abiItem?.inputs?.map(LogsDecoder.typeToString)})`
                );

                if (abiItem.type === 'event' && sig) {
                    return { ...allItems, [sig.slice(2)]: abiItem };
                }
                return allItems;
            }
            return allItems;
        }, {} as Record<string, AbiItem>);
    }

    /**
     * Constructs date types from method abi.
     * @param method Method abi item.
     */
    private static constructDataTypes(method: AbiItem): string[] {
        return method.inputs!.reduce(
            (types, input) => (input.indexed ? types : [...types, input.type]),
            [] as string[]
        );
    }

    /**
     * Decodes log params.
     * @param method Method abi tem.
     * @param logItem Log item.
     * @param decodedData Decoded data.
     */
    private static decodeParams(
        method: AbiItem,
        logItem: Log,
        decodedData: { [p: string]: string | undefined }
    ): Array<DecodedLogData> {
        let dataIndex = 0;
        let topicsIndex = 1;
        // Loop topic and data to get the params
        return (method?.inputs || []).map(input => {
            const decodedLogData: DecodedLogData = { name: input.name, type: input.type };

            if (input.indexed) {
                decodedLogData.value = logItem.topics[topicsIndex];
                topicsIndex++;
            } else {
                decodedLogData.value = decodedData[dataIndex];
                dataIndex++;
            }

            if (input.type === 'address') {
                decodedLogData.value = decodedLogData?.value?.toLowerCase() as string;
                // 42 because len(0x) + 40
                if (decodedLogData.value.length > 42) {
                    const toRemove = decodedLogData.value.length - 42;
                    const temp = decodedLogData.value.split('');
                    temp.splice(2, toRemove);
                    decodedLogData.value = temp.join('');
                }
            }

            if (input.type === 'uint256' || input.type === 'uint8' || input.type === 'int') {
                // ensure to remove leading 0x for hex numbers
                if (
                    typeof decodedLogData.value === 'string' &&
                    decodedLogData.value.startsWith('0x') &&
                    decodedLogData.value
                ) {
                    decodedLogData.value = new BigNumber(
                        decodedLogData.value.slice(2),
                        16
                    ).toString(10);
                } else {
                    decodedLogData.value = new BigNumber(decodedLogData.value as string).toString(
                        10
                    );
                }
            }

            return decodedLogData;
        });
    }

    private static decodeMethod(method: AbiItem, logItem: Log): DecodedLog {
        const abiCoder = new Web3().eth.abi;
        const logData = logItem.data;
        const dataTypes = LogsDecoder.constructDataTypes(method);
        const decodedData = abiCoder.decodeParameters(dataTypes, logData.slice(2));
        const decodedParams = LogsDecoder.decodeParams(method, logItem, decodedData);

        return {
            name: method.name!,
            params: decodedParams,
            address: logItem.address
        };
    }

    /**
     * private static for decoding transaction logs
     * @param abi Contract ABI
     * @param receipt Transaction receipt
     * @returns Array of decoded logs
     */
    public static decodeLogs(
        abi: AbiItem[],
        receipt: TransactionReceipt
    ): Array<DecodedLog | null> {
        const methodIds = LogsDecoder.constructMethodIds(abi);
        const logs = receipt.logs.filter(log => log.topics.length > 0);

        return logs
            .map(logItem => {
                const methodID = logItem?.topics?.[0]?.slice(2);
                const method = methodIds[methodID as string];

                if (method) {
                    return LogsDecoder.decodeMethod(method, logItem);
                }

                return null;
            })
            .filter(Boolean);
    }
}
