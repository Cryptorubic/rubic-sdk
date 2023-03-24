import BigNumber from 'bignumber.js';
import {
    FailedToCheckForTransactionReceiptError,
    NotWhitelistedProviderError,
    UnnecessaryApproveError
} from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { EvmBasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-basic-transaction-options';
import { EvmTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-transaction-options';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { wlContractAbi } from 'src/features/common/constants/wl-contract-abi';
import { wlContractAddress } from 'src/features/common/constants/wl-contract-address';
import { ContractParams } from 'src/features/common/models/contract-params';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { CrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { TransactionConfig } from 'web3-core';
import { TransactionReceipt } from 'web3-eth';

export abstract class EvmCrossChainTrade extends CrossChainTrade {
    public abstract readonly from: PriceTokenAmount<EvmBlockchainName>;

    /**
     * Gas fee info in source blockchain.
     */
    public abstract readonly gasData: GasData;

    protected get fromWeb3Public(): EvmWeb3Public {
        return Injector.web3PublicService.getWeb3Public(this.from.blockchain);
    }

    protected get web3Private(): EvmWeb3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.from.blockchain);
    }

    /**
     * Gets gas fee in source blockchain.
     */
    public get estimatedGas(): BigNumber | null {
        if (!this.gasData) {
            return null;
        }
        return Web3Pure.fromWei(this.gasData.gasPrice).multipliedBy(this.gasData.gasLimit);
    }

    public async approve(
        options: EvmBasicTransactionOptions,
        checkNeedApprove = true
    ): Promise<TransactionReceipt> {
        if (checkNeedApprove) {
            const needApprove = await this.needApprove();
            if (!needApprove) {
                throw new UnnecessaryApproveError();
            }
        }

        this.checkWalletConnected();
        await this.checkBlockchainCorrect();

        const approveAmount =
            this.from.blockchain === BLOCKCHAIN_NAME.GNOSIS ||
            this.from.blockchain === BLOCKCHAIN_NAME.CRONOS
                ? this.from.weiAmount
                : 'infinity';

        return this.web3Private.approveTokens(
            this.from.address,
            this.fromContractAddress,
            approveAmount,
            options
        );
    }

    protected async checkAllowanceAndApprove(
        options?: Omit<SwapTransactionOptions, 'onConfirm' | 'gasLimit'>
    ): Promise<void> {
        const needApprove = await this.needApprove();
        if (!needApprove) {
            return;
        }

        const approveOptions: EvmBasicTransactionOptions = {
            onTransactionHash: options?.onApprove,
            gas: options?.approveGasLimit,
            gasPrice: options?.gasPrice
        };

        await this.approve(approveOptions, false);
    }

    protected abstract swapDirect(options?: SwapTransactionOptions): Promise<string | never>;

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        const useProxy = options?.useProxy || this.useProxyByDefault;
        if (!useProxy) {
            return this.swapDirect(options);
        }
        return this.swapWithParams(options);
    }

    private async swapWithParams(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkTradeErrors();
        await this.checkReceiverAddress(
            options.receiverAddress,
            !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain)
        );

        await this.checkAllowanceAndApprove(options);

        const { onConfirm, gasLimit, gasPrice } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        const { contractAddress, contractAbi, methodName, methodArguments, value } =
            await this.getContractParams(options);

        try {
            await this.web3Private.tryExecuteContractMethod(
                contractAddress,
                contractAbi,
                methodName,
                methodArguments,
                { value, onTransactionHash, gas: gasLimit, gasPrice }
            );

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw err;
        }
    }

    public async encode(options: EncodeTransactionOptions): Promise<TransactionConfig> {
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(
            options.receiverAddress,
            !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain)
        );

        const { gasLimit, gasPrice } = options;

        const { contractAddress, contractAbi, methodName, methodArguments, value } =
            await this.getContractParams({
                fromAddress: options.fromAddress,
                receiverAddress: options.receiverAddress || options.fromAddress
            });

        return EvmWeb3Pure.encodeMethodCall(
            contractAddress,
            contractAbi,
            methodName,
            methodArguments,
            value,
            {
                gas: gasLimit || this.gasData?.gasLimit.toFixed(0),
                gasPrice: gasPrice || this.gasData?.gasPrice.toFixed()
            }
        );
    }

    public async encodeApprove(
        tokenAddress: string,
        spenderAddress: string,
        value: BigNumber | 'infinity',
        options: EvmTransactionOptions = {}
    ): Promise<TransactionConfig> {
        return this.web3Private.encodeApprove(tokenAddress, spenderAddress, value, options);
    }

    protected abstract getContractParams(
        options: GetContractParamsOptions
    ): Promise<ContractParams>;

    protected async checkProviderIsWhitelisted(
        providerRouter: string,
        providerGateway?: string
    ): Promise<void> {
        const whitelistedContracts = await Injector.web3PublicService
            .getWeb3Public(this.from.blockchain)
            .callContractMethod<string[]>(
                wlContractAddress[this.from.blockchain as EvmBlockchainName],
                wlContractAbi,
                'getAvailableCrossChains'
            );

        if (
            !whitelistedContracts.find(whitelistedContract =>
                compareAddresses(whitelistedContract, providerRouter)
            ) ||
            (providerGateway &&
                !whitelistedContracts.find(whitelistedContract =>
                    compareAddresses(whitelistedContract, providerGateway)
                ))
        ) {
            throw new NotWhitelistedProviderError(providerRouter, providerGateway, 'crosschain');
        }
    }
}
