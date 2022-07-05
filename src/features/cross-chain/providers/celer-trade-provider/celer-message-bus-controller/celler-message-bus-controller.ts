import { Web3Public } from 'src/core';
import { messageBusContractAbi } from '@rsdk-features/cross-chain/providers/celer-trade-provider/celer-message-bus-controller/constants/message-bus-contract-abi';

export class CellerMessageBusController {
    constructor(private readonly web3Public: Web3Public) {}

    public async getCalcFee(message: string, messageBusAddress: string): Promise<string> {
        return this.web3Public.callContractMethod(
            messageBusAddress,
            messageBusContractAbi,
            'calcFee',
            {
                methodArguments: [message]
            }
        );
    }

    public async getFeeBase(messageBusAddress: string): Promise<string> {
        return this.web3Public.callContractMethod(
            messageBusAddress,
            messageBusContractAbi,
            'feeBase'
        );
    }
}
