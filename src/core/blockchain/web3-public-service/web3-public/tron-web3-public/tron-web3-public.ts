import BigNumber from 'bignumber.js';
import { BigNumber as EthersBigNumber } from 'ethers';
import { TRC20_CONTRACT_ABI } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/constants/trc-20-contract-abi';
import { TronWebProvider } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/models/tron-web-provider';
import { TronWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/tron-web3-pure';
import { Web3Public } from 'src/core/blockchain/web3-public-service/web3-public/web3-public';
import { BLOCKCHAIN_NAME, TronBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TronWeb } from 'src/core/blockchain/constants/tron/tron-web';
import { TRON_MULTICALL_ABI } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/constants/tron-multicall-abi';
import { TronMulticallResponse } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/models/tron-multicall-response';
import { TronCall } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/models/tron-call';
import {
    HEALTHCHECK,
    isBlockchainHealthcheckAvailable
} from 'src/core/blockchain/constants/healthcheck';
import pTimeout from 'src/common/utils/p-timeout';
import { TimeoutError } from 'src/common/errors';
import { AbiItem } from 'web3-utils';
import { MethodData } from 'src/core/blockchain/web3-public-service/web3-public/models/method-data';
import { ContractMulticallResponse } from 'src/core/blockchain/web3-public-service/web3-public/models/contract-multicall-response';
import { TransactionInfo } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/models/transaction-info';

export class TronWeb3Public extends Web3Public<TronBlockchainName> {
    protected readonly tokenContractAbi = TRC20_CONTRACT_ABI;

    constructor(private readonly tronWeb: typeof TronWeb) {
        super(BLOCKCHAIN_NAME.TRON);
    }

    public setProvider(provider: TronWebProvider): void {
        this.tronWeb.setProvider(provider);
    }

    public async healthCheck(timeoutMs: number = 4000): Promise<boolean> {
        if (!isBlockchainHealthcheckAvailable(this.blockchainName)) {
            return true;
        }
        const healthcheckData = HEALTHCHECK[this.blockchainName];

        this.tronWeb.setAddress(healthcheckData.contractAddress);
        const contract = await this.tronWeb.contract(
            healthcheckData.contractAbi,
            healthcheckData.contractAddress
        );

        try {
            const result = await pTimeout(contract[healthcheckData.method]().call(), timeoutMs);
            return result === healthcheckData.expected;
        } catch (e: unknown) {
            if (e instanceof TimeoutError) {
                console.debug(
                    `${this.blockchainName} node healthcheck timeout (${timeoutMs}ms) has occurred.`
                );
            } else {
                console.debug(`${this.blockchainName} node healthcheck fail: ${e}`);
            }
            return false;
        }
    }

    public async getBalance(address: string, tokenAddress?: string): Promise<BigNumber> {
        let balance;
        if (tokenAddress && !TronWeb3Pure.isNativeAddress(tokenAddress)) {
            balance = await this.getTokenBalance(address, tokenAddress);
        } else {
            this.tronWeb.setAddress(address);
            balance = await this.tronWeb.trx.getBalance(address);
        }
        return new BigNumber(balance);
    }

    public async getTokenBalance(address: string, tokenAddress: string): Promise<BigNumber> {
        this.tronWeb.setAddress(address);
        const contract = await this.tronWeb.contract(this.tokenContractAbi, tokenAddress);
        const balance: EthersBigNumber = await contract.balanceOf(address).call();
        return new BigNumber(balance.toString());
    }

    public async getTokensBalances(
        address: string,
        tokensAddresses: string[]
    ): Promise<BigNumber[]> {
        const indexOfNativeCoin = tokensAddresses.findIndex(TronWeb3Pure.isNativeAddress);
        const promises = [];

        if (indexOfNativeCoin !== -1) {
            tokensAddresses.splice(indexOfNativeCoin, 1);
            promises[1] = this.getBalance(address);
        }

        const calls: TronCall[] = tokensAddresses.map(tokenAddress => [
            tokenAddress,
            TronWeb3Pure.encodeFunctionCall(this.tokenContractAbi, 'balanceOf', [address])
        ]);
        promises[0] = this.multicall(calls);

        const results = await Promise.all(
            promises as [Promise<TronMulticallResponse>, Promise<BigNumber>]
        );
        const tokensBalances = results[0].results.map((success, index) =>
            success ? new BigNumber(results[0].returnData[index]!) : new BigNumber(0)
        );

        if (indexOfNativeCoin !== -1) {
            tokensBalances.splice(indexOfNativeCoin, 0, results[1]);
        }

        return tokensBalances;
    }

    /**
     * Calls allowance method in TRC-20 token contract.
     * @param tokenAddress Address of the smart-contract corresponding to the token.
     * @param spenderAddress Wallet or contract address, allowed to spend.
     * @param ownerAddress Wallet address to spend from.
     * @returns Token's amount, allowed to be spent.
     */
    public async getAllowance(
        tokenAddress: string,
        ownerAddress: string,
        spenderAddress: string
    ): Promise<BigNumber> {
        const contract = await this.tronWeb.contract(this.tokenContractAbi, tokenAddress);

        const allowance = await contract.allowance(ownerAddress, spenderAddress).call();
        return new BigNumber(allowance);
    }

    public async multicallContractsMethods<Output>(
        contractAbi: AbiItem[],
        contractsData: {
            contractAddress: string;
            methodsData: MethodData[];
        }[]
    ): Promise<ContractMulticallResponse<Output>[][]> {
        const calls: TronCall[][] = contractsData.map(({ contractAddress, methodsData }) => {
            return methodsData.map(({ methodName, methodArguments }) => [
                contractAddress,
                TronWeb3Pure.encodeFunctionCall(contractAbi, methodName, methodArguments)
            ]);
        });

        const outputs = await this.multicall(calls.flat());

        let outputIndex = 0;
        return contractsData.map(contractData =>
            contractData.methodsData.map(methodData => {
                const success = outputs.results[outputIndex]!;
                const returnData = outputs.returnData[outputIndex]!;
                outputIndex++;

                const methodOutputAbi = contractAbi.find(
                    funcSignature => funcSignature.name === methodData.methodName
                )!.outputs!;

                return {
                    success,
                    output: success
                        ? (TronWeb3Pure.decodeMethodOutput(methodOutputAbi, returnData) as Output)
                        : null
                };
            })
        );
    }

    /**
     * Executes multiple calls in the single contract call.
     * @param calls Multicall calls data list.
     * @returns Result of calls execution.
     */
    private async multicall(calls: TronCall[]): Promise<TronMulticallResponse> {
        this.tronWeb.setAddress(this.multicallAddress);
        const contract = await this.tronWeb.contract(TRON_MULTICALL_ABI, this.multicallAddress);
        return contract.aggregateViewCalls(calls).call();
    }

    public async callContractMethod<T = string>(
        contractAddress: string,
        contractAbi: AbiItem[],
        methodName: string,
        methodArguments: unknown[] = []
    ): Promise<T> {
        const contract = await this.tronWeb.contract(contractAbi, contractAddress);

        return contract[methodName](...methodArguments).call();
    }

    /**
     * Gets mined transaction info.
     * @param hash Transaction hash.
     */
    public async getTransactionInfo(hash: string): Promise<TransactionInfo> {
        return this.tronWeb.trx.getTransactionInfo(hash);
    }
}
