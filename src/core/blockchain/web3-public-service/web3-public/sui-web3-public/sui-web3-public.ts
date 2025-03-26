import {
    ExecuteTransactionBlockParams,
    SuiClient,
    SuiTransactionBlockResponse
} from '@mysten/sui/client';
import BigNumber from 'bignumber.js';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { Web3PrimitiveType } from 'src/core/blockchain/models/web3-primitive-type';
import { ContractMulticallResponse } from 'src/core/blockchain/web3-public-service/web3-public/models/contract-multicall-response';
import { MethodData } from 'src/core/blockchain/web3-public-service/web3-public/models/method-data';
import { SupportedTokenField } from 'src/core/blockchain/web3-public-service/web3-public/models/supported-token-field';
import {
    TX_STATUS,
    TxStatus
} from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { Web3Public } from 'src/core/blockchain/web3-public-service/web3-public/web3-public';
import { AbiItem } from 'web3-utils';

/**
 * Class containing methods for calling contracts in order to obtain information from the blockchain.
 * To send transaction or execute contract method use {@link Web3Private}.
 */
export class SuiWeb3Public extends Web3Public {
    private readonly client: SuiClient;

    constructor(url: string) {
        super(BLOCKCHAIN_NAME.SUI);
        this.client = new SuiClient({ url });
    }

    public async getBlockNumber(): Promise<number> {
        const epochInfo = await this.client.getEpochs({ limit: 1 });
        const stringEpoch = epochInfo.data[0]!.epoch;

        return Number(stringEpoch);
    }

    public multicallContractsMethods<Output extends Web3PrimitiveType>(
        _contractAbi: AbiItem[],
        _contractsData: {
            contractAddress: string;
            methodsData: MethodData[];
        }[]
    ): Promise<ContractMulticallResponse<Output>[][]> {
        throw new Error('Method multicall is not supported');
    }

    public async getTransactionStatus(hash: string): Promise<TxStatus> {
        try {
            const txDetails = await this.client.getTransactionBlock({ digest: hash });
            const status = txDetails?.effects?.status.status;
            if (!status) {
                return TX_STATUS.PENDING;
            }
            return status === 'success' ? TX_STATUS.SUCCESS : TX_STATUS.FAIL;
        } catch {
            return TX_STATUS.PENDING;
        }
    }

    public override async callForTokenInfo(
        tokenAddress: string,
        tokenFields: SupportedTokenField[] = ['decimals', 'symbol', 'name', 'image']
    ): Promise<Partial<Record<SupportedTokenField, string>>> {
        return (await this.callForTokensInfo([tokenAddress], tokenFields))[0]!;
    }

    public async callForTokensInfo(
        tokenAddresses: string[] | ReadonlyArray<string>,
        _tokenFields: SupportedTokenField[] = ['decimals', 'symbol', 'name']
    ): Promise<Partial<Record<SupportedTokenField, string>>[]> {
        const nativeTokenIndex = tokenAddresses.findIndex(address =>
            this.Web3Pure.isNativeAddress(address)
        );
        const filteredTokenAddresses = tokenAddresses.filter(
            (_, index) => index !== nativeTokenIndex
        );

        const blockchainNativeToken = nativeTokensList[this.blockchainName];
        const nativeToken = {
            ...blockchainNativeToken,
            decimals: blockchainNativeToken.decimals.toString()
        };

        // only native token in array
        if (!filteredTokenAddresses.length && nativeTokenIndex !== -1) {
            return [nativeToken];
        }

        const allTokensMeta = await Promise.all(
            filteredTokenAddresses.map(coinType => this.client.getCoinMetadata({ coinType }))
        );
        const tokens = allTokensMeta.map(metadata =>
            metadata
                ? {
                      decimals: String(metadata.decimals),
                      symbol: metadata.symbol,
                      name: metadata.name
                  }
                : {}
        );

        if (nativeTokenIndex === -1) {
            return tokens;
        }
        tokens.splice(nativeTokenIndex, 0, nativeToken);

        return tokens;
    }

    public async getBalance(userAddress: string, tokenAddress: string): Promise<BigNumber> {
        const isToken = tokenAddress && !this.Web3Pure.isNativeAddress(tokenAddress);
        if (isToken) {
            const balance = await this.client.getBalance({
                owner: userAddress,
                coinType: tokenAddress
            });

            return new BigNumber(balance.totalBalance);
        }
        const balance = await this.client.getBalance({ owner: userAddress });
        return new BigNumber(balance.totalBalance);
    }

    public async getTokenBalance(address: string, tokenAddress: string): Promise<BigNumber> {
        const balance = await this.client.getBalance({
            owner: address,
            coinType: tokenAddress
        });
        return new BigNumber(balance.totalBalance);
    }

    public async callContractMethod<T extends Web3PrimitiveType = string>(
        _contractAddress: string,
        _contractAbi: AbiItem[],
        _methodName: string,
        _methodArguments: unknown[] = [],
        _options: {
            from?: string;
            value?: string;
            gasPrice?: string;
            gas?: string;
        } = {}
    ): Promise<T> {
        throw new Error('Method call is not supported');
    }

    public async healthCheck(): Promise<boolean> {
        try {
            const state = await this.client.getLatestSuiSystemState();
            return state.activeValidators.length > 0;
        } catch (error) {
            return false;
        }
    }

    /**
     * Gets balance of multiple tokens.
     * @param address Wallet address.
     * @param tokensAddresses Tokens addresses.
     */
    public async getTokensBalances(
        address: string,
        tokensAddresses: string[]
    ): Promise<BigNumber[]> {
        const allUserTokens = await this.client.getAllBalances({ owner: address });
        return tokensAddresses.map(address => {
            const possibleBalance = allUserTokens.find(
                el =>
                    compareAddresses(address, el.coinType) ||
                    SuiWeb3Public.compareSuiAddress(address, el.coinType)
            );
            return new BigNumber(possibleBalance?.totalBalance || 0);
        });
    }

    public async getAllowance(): Promise<BigNumber> {
        return new BigNumber(Infinity);
    }

    public setProvider(_provider: unknown): void {
        return;
    }

    public static compareSuiAddress(addressA: string, addressB: string): boolean {
        const pureAddressA = addressA.split(':')[0]!;
        const pureAddressB = addressB.split(':')[0]!;
        return compareAddresses(
            new BigNumber(pureAddressA).toFixed(),
            new BigNumber(pureAddressB).toFixed()
        );
    }

    public executeTxBlock(
        params: ExecuteTransactionBlockParams
    ): Promise<SuiTransactionBlockResponse> {
        return this.client.executeTransactionBlock(params);
    }
}
