import BigNumber from 'bignumber.js';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { Web3PrimitiveType } from 'src/core/blockchain/models/web3-primitive-type';
import {
    TX_STATUS,
    TxStatus
} from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { Injector } from 'src/core/injector/injector';

import { ContractMulticallResponse } from '../models/contract-multicall-response';
import { SupportedTokenField } from '../models/supported-token-field';
import { Web3Public } from '../web3-public';
import { BitcoinUserAddressInfo } from './models/bitcoin-user-address-info';

export class BitcoinWeb3Public extends Web3Public {
    constructor() {
        super(BLOCKCHAIN_NAME.BITCOIN);
    }

    public async getTransactionStatus(txHash: string): Promise<TxStatus> {
        const url = `https://api.blockcypher.com/v1/btc/main/txs/${txHash}`;
        const { confirmations } = await Injector.httpClient.get<{ confirmations: number }>(url);
        return confirmations > 0 ? TX_STATUS.SUCCESS : TX_STATUS.PENDING;
    }

    public async healthCheck(): Promise<boolean> {
        return true;
    }

    public async getBalance(userAddress: string): Promise<BigNumber> {
        const url = `https://api.blockcypher.com/v1/btc/main/addrs/${userAddress}/balance`;
        const response = await Injector.httpClient.get<{ final_balance: string }>(url);
        return new BigNumber(response.final_balance);
    }

    /**
     * @deprecated Use getBalance instead for all tokens and native currency
     */
    public async getTokenBalance(userAddress: string): Promise<BigNumber> {
        return this.getBalance(userAddress);
    }

    public async getTokensBalances(userAddress: string): Promise<BigNumber[]> {
        return this.getBalance(userAddress).then(el => [el]);
    }

    public async callForTokensInfo(
        _tokensAddresses: string[] | ReadonlyArray<string>,
        _tokenFields: SupportedTokenField[] = ['decimals', 'symbol', 'name']
    ): Promise<Partial<Record<SupportedTokenField, string>>[]> {
        const btc = nativeTokensList[BLOCKCHAIN_NAME.BITCOIN];
        return [{ decimals: String(btc.decimals), symbol: btc.symbol, name: btc.name }];
    }

    public callContractMethod<T extends Web3PrimitiveType = string>(): Promise<T> {
        throw new Error('Method not implemented.');
    }

    public async getBlockNumber(): Promise<number> {
        throw new Error('Method not implemented.');
    }

    public setProvider(): void {
        throw new Error('Method not implemented.');
    }

    public getAllowance(): Promise<BigNumber> {
        throw new Error('Method not implemented.');
    }

    public multicallContractsMethods<Output extends Web3PrimitiveType>(): Promise<
        ContractMulticallResponse<Output>[][]
    > {
        throw new Error('Method not implemented.');
    }

    public async getPublicKey(userAddress: string): Promise<string | null> {
        try {
            const url = `https://api.blockcypher.com/v1/btc/main/addrs/${userAddress}/full`;
            const response = await Injector.httpClient.get<BitcoinUserAddressInfo>(url);

            const txs = response.txs;
            let publicKey = null;

            for (const txData of txs) {
                const userInputData = txData.inputs.find(inputData => {
                    const isInputFromUserAddress = inputData.addresses.includes(userAddress);

                    const publicKey = inputData.witness?.[1];

                    return isInputFromUserAddress && publicKey;
                });

                if (userInputData) {
                    publicKey = userInputData.witness[1]!;
                    break;
                }
            }
            if (!publicKey) {
                throw new Error();
            }

            return publicKey;
        } catch {
            const web3Private = Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.BITCOIN);
            return web3Private.getPublicKeyFromWallet();
        }
    }
}
