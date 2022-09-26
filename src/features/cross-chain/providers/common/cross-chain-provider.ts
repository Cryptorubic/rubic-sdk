import { AbiItem } from 'web3-utils';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { parseError } from 'src/common/utils/errors';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { CrossChainTradeType } from 'src/features/cross-chain/models/cross-chain-trade-type';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/models/cross-chain-options';
import { CrossChainIsUnavailableError, RubicSdkError } from 'src/common/errors';
import { Injector } from 'src/core/injector/injector';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import BigNumber from 'bignumber.js';
import { CalculationResult } from 'src/features/cross-chain/providers/common/models/calculation-result';
import { Web3PublicSupportedBlockchain } from 'src/core/blockchain/web3-public-service/models/web3-public-storage';
import { HttpClient } from 'src/core/http-client/models/http-client';
import { Web3PrivateSupportedBlockchain } from 'src/core/blockchain/web3-private-service/models/web-private-supported-blockchain';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';

export abstract class CrossChainProvider {
    public static parseError(err: unknown): RubicSdkError {
        return parseError(err, 'Cannot calculate cross-chain trade');
    }

    public abstract readonly type: CrossChainTradeType;

    protected get httpClient(): HttpClient {
        return Injector.httpClient;
    }

    public abstract isSupportedBlockchains(
        fromBlockchain: BlockchainName,
        toBlockchain: BlockchainName
    ): boolean;

    public abstract calculate(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult>;

    protected getWalletAddress(blockchain: Web3PrivateSupportedBlockchain): string {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(blockchain).address;
    }

    /**
     * Gets fee information.
     * @param _fromBlockchain Source network blockchain.
     * @param _providerAddress Integrator address.
     * @param _percentFeeToken Protocol fee token.
     * @param _contractAbi Rubic Proxy contract abi.
     * @protected
     * @internal
     */
    protected async getFeeInfo(
        _fromBlockchain: Partial<BlockchainName>,
        _providerAddress: string,
        _percentFeeToken: PriceToken,
        _contractAbi?: AbiItem[]
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
        fromBlockchain: Web3PublicSupportedBlockchain,
        providerAddress: string,
        contractAddress: string,
        contractAbi: AbiItem[]
    ): Promise<BigNumber> {
        const web3PublicService = Injector.web3PublicService.getWeb3Public(fromBlockchain);
        const fromChainType = BlockchainsInfo.getChainType(fromBlockchain);

        if (!Web3Pure[fromChainType].isEmptyAddress(providerAddress)) {
            const integratorInfo = await web3PublicService.callContractMethod<
                [boolean, string, string, string, string]
            >(contractAddress, contractAbi, 'integratorToFeeInfo', [providerAddress]);
            if (integratorInfo[0]) {
                return Web3Pure.fromWei(integratorInfo[4]);
            }
        }

        return Web3Pure.fromWei(
            await web3PublicService.callContractMethod<string>(
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
        fromBlockchain: Web3PublicSupportedBlockchain,
        providerAddress: string,
        contractAddress: string,
        contractAbi: AbiItem[]
    ): Promise<number> {
        const web3PublicService = Injector.web3PublicService.getWeb3Public(fromBlockchain);
        const fromChainType = BlockchainsInfo.getChainType(fromBlockchain);

        if (!Web3Pure[fromChainType].isEmptyAddress(providerAddress)) {
            // @todo add types
            const integratorInfo = await web3PublicService.callContractMethod<[boolean, string]>(
                contractAddress,
                contractAbi,
                'integratorToFeeInfo',
                [providerAddress]
            );
            if (integratorInfo[0]) {
                return new BigNumber(integratorInfo[1]).toNumber() / 10_000; // @todo make BigNumber
            }
        }

        return (
            new BigNumber(
                await web3PublicService.callContractMethod<string>(
                    contractAddress,
                    contractAbi,
                    'RubicPlatformFee'
                )
            ).toNumber() / 10_000
        );
    }

    protected async checkContractState(
        fromBlockchain: Web3PublicSupportedBlockchain,
        rubicRouter: string,
        contractAbi: AbiItem[] = evmCommonCrossChainAbi // @todo redo
    ): Promise<void> {
        const web3PublicService = Injector.web3PublicService.getWeb3Public(fromBlockchain);

        const isPaused = await web3PublicService.callContractMethod<boolean>(
            rubicRouter,
            contractAbi,
            'paused'
        );

        if (isPaused) {
            throw new CrossChainIsUnavailableError();
        }
    }
}
