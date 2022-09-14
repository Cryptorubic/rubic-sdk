import { messageBusContractAbi } from 'src/features/cross-chain/providers/celer-trade-provider/celer-message-bus-controller/constants/message-bus-contract-abi';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';

export class CellerMessageBusController {
    constructor(private readonly web3Public: EvmWeb3Public) {}

    public async getCalcFee(message: string, messageBusAddress: string): Promise<string> {
        return this.web3Public.callContractMethod(
            messageBusAddress,
            messageBusContractAbi,
            'calcFee',
            [message]
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
