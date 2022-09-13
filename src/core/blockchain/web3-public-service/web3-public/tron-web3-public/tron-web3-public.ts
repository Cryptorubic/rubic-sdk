import BigNumber from 'bignumber.js';
import { BigNumber as EthersBigNumber } from 'ethers';
import { TRC20_CONTRACT_ABI } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/constants/trc-20-contract-abi';
import { TronWebProvider } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/models/tron-web-provider';
import { TronWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure';
import { Web3Public } from 'src/core/blockchain/web3-public-service/web3-public/web3-public';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { TronWeb } from 'src/core/blockchain/constants/tron/tron-web';
import { TRON_MULTICALL_ABI } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/constants/tron-multicall-abi';
import { TronMulticallResponse } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/models/tron-multicall-response';
import Web3 from 'web3';
import { ERC20_TOKEN_ABI } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/constants/erc-20-token-abi';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';

export class TronWeb3Public extends Web3Public {
    constructor(private readonly tronWeb: typeof TronWeb) {
        super(BLOCKCHAIN_NAME.TRON);
    }

    public setProvider(provider: TronWebProvider): void {
        this.tronWeb.setProvider(provider);
    }

    public async healthCheck(_timeoutMs: number): Promise<boolean> {
        return true;
    }

    public async getBalance(address: string, tokenAddress?: string): Promise<BigNumber> {
        this.tronWeb.setAddress(address);

        let balance;
        if (tokenAddress && !TronWeb3Pure.isNativeAddress(tokenAddress)) {
            balance = await this.getTokenBalance(address, tokenAddress);
        } else {
            balance = await this.tronWeb.trx.getBalance(address);
        }
        return new BigNumber(balance);
    }

    public async getTokenBalance(address: string, tokenAddress: string): Promise<BigNumber> {
        this.tronWeb.setAddress(address);

        const contract = await this.tronWeb.contract(TRC20_CONTRACT_ABI, tokenAddress);
        const balance: EthersBigNumber = await contract.balanceOf(address).call();
        return new BigNumber(balance.toString());
    }

    public async getTokensBalances(
        address: string,
        tokensAddresses: string[]
    ): Promise<BigNumber[]> {
        this.tronWeb.setAddress(address);

        const indexOfNativeCoin = tokensAddresses.findIndex(TronWeb3Pure.isNativeAddress);
        const promises = [];

        if (indexOfNativeCoin !== -1) {
            tokensAddresses.splice(indexOfNativeCoin, 1);
            promises[1] = this.getBalance(address);
        }

        const evmContract = new new Web3().eth.Contract(ERC20_TOKEN_ABI);
        const calls: [string, string][] = tokensAddresses.map(tokenAddress => [
            tokenAddress,
            evmContract.methods
                .balanceOf(
                    EvmWeb3Pure.toChecksumAddress(
                        this.tronWeb.address.toHex(address).replace(/^41/, '0x')
                    )
                )
                .encodeABI()
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
     * Executes multiple calls in the single contract call.
     * @param calls Multicall calls data list.
     * @returns Result of calls execution.
     */
    private async multicall(calls: [string, string][]): Promise<TronMulticallResponse> {
        const contract = await this.tronWeb.contract(TRON_MULTICALL_ABI, this.multicallAddress);
        return contract.aggregateViewCalls(calls).call();
    }
}
