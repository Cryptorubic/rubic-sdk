import { CrossChainTradeType } from 'src/features';
import { RequiredCrossChainOptions } from '@rsdk-features/cross-chain/models/cross-chain-options';
import { WrappedCrossChainTrade } from '@rsdk-features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import {
    CrossChainIsUnavailableError,
    PriceToken,
    PriceTokenAmount,
    RubicSdkError
} from 'src/common';
import { parseError } from 'src/common/utils/errors';
import { BlockchainName, Web3Pure } from 'src/core';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { Injector } from 'src/core/sdk/injector';
import { AbiItem } from 'web3-utils';
import BigNumber from 'bignumber.js';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import { commonCrossChainAbi } from './constants/common-cross-chain-abi';

export abstract class CrossChainTradeProvider {
    public static parseError(err: unknown): RubicSdkError {
        return parseError(err, 'Cannot calculate cross chain trade');
    }

    public abstract readonly type: CrossChainTradeType;

    protected get walletAddress(): string {
        return Injector.web3Private.address;
    }

    /**
     * Gets fee information.
     * @param _fromBlockchain Source network blockchain.
     * @param _providerAddress Integrator address.
     * @param _percentFeeToken Protocol fee token.
     * @protected
     * @internal
     */
    protected async getFeeInfo(
        _fromBlockchain: Partial<BlockchainName>,
        _providerAddress: string,
        _percentFeeToken: PriceToken
    ): Promise<FeeInfo> {
        return {
            fixedFee: null,
            platformFee: null,
            cryptoFee: null
        };
    }

    /**
     * Gets fixed fee information.
     * @param fromBlockchain Source network blockchain.
     * @param providerAddress Integrator address.
     * @param contractAddress Contract address.
     * @param contractAbi Contract ABI.
     * @protected
     * @internal
     */
    protected async getFixedFee(
        fromBlockchain: BlockchainName,
        providerAddress: string,
        contractAddress: string,
        contractAbi: AbiItem[]
    ): Promise<BigNumber> {
        const web3PublicService = Injector.web3PublicService.getWeb3Public(fromBlockchain);

        if (!EvmWeb3Pure.isEmptyAddress(providerAddress)) {
            const integratorInfo = await web3PublicService.callContractMethod<
                [boolean, number, number, number, number]
            >(contractAddress, contractAbi, 'integratorToFeeInfo', {
                methodArguments: [providerAddress]
            });
            if (integratorInfo[0]) {
                return Web3Pure.fromWei(integratorInfo[4]);
            }
        }

        return Web3Pure.fromWei(
            await web3PublicService.callContractMethod<number>(
                contractAddress,
                contractAbi,
                'fixedCryptoFee'
            )
        );
    }

    /**
     * Gets percent fee.
     * @param fromBlockchain Source network blockchain.
     * @param providerAddress Integrator address.
     * @param contractAddress Contract address.
     * @param contractAbi Contract ABI.
     * @protected
     * @internal
     */
    protected async getFeePercent(
        fromBlockchain: BlockchainName,
        providerAddress: string,
        contractAddress: string,
        contractAbi: AbiItem[]
    ): Promise<number> {
        const web3PublicService = Injector.web3PublicService.getWeb3Public(fromBlockchain);

        if (!EvmWeb3Pure.isEmptyAddress(providerAddress)) {
            const integratorInfo = await web3PublicService.callContractMethod<[boolean, number]>(
                contractAddress,
                contractAbi,
                'integratorToFeeInfo',
                {
                    methodArguments: [providerAddress]
                }
            );
            if (integratorInfo[0]) {
                return integratorInfo[1] / 10_000;
            }
        }

        return (
            (await web3PublicService.callContractMethod<number>(
                contractAddress,
                contractAbi,
                'RubicPlatformFee'
            )) / 10_000
        );
    }

    protected async checkContractState(
        fromBlockchain: BlockchainName,
        rubicRouter: string
    ): Promise<void> {
        const web3PublicService = Injector.web3PublicService.getWeb3Public(fromBlockchain);

        const isPaused = await web3PublicService.callContractMethod<number>(
            rubicRouter,
            commonCrossChainAbi,
            'paused'
        );

        if (isPaused) {
            throw new CrossChainIsUnavailableError();
        }
    }

    public abstract isSupportedBlockchains(
        fromBlockchain: BlockchainName,
        toBlockchain: BlockchainName
    ): boolean;

    public abstract calculate(
        from: PriceTokenAmount,
        to: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<Omit<WrappedCrossChainTrade, 'tradeType'> | null>;
}
