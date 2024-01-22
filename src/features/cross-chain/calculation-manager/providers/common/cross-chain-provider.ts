import BigNumber from 'bignumber.js';
import { CrossChainIsUnavailableError, RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { parseError } from 'src/common/utils/errors';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { Web3PrivateSupportedBlockchain } from 'src/core/blockchain/web3-private-service/models/web-private-supported-blockchain';
import { Web3PublicSupportedBlockchain } from 'src/core/blockchain/web3-public-service/models/web3-public-storage';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { HttpClient } from 'src/core/http-client/models/http-client';
import { Injector } from 'src/core/injector/injector';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CrossChainTradeType } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { AbiItem } from 'web3-utils';

export abstract class CrossChainProvider {
    public static parseError(err: unknown): RubicSdkError {
        return parseError(err, 'Cannot calculate cross-chain trade');
    }

    public abstract readonly type: CrossChainTradeType;

    protected get httpClient(): HttpClient {
        return Injector.httpClient;
    }

    public abstract isSupportedBlockchain(fromBlockchain: BlockchainName): boolean;

    public areSupportedBlockchains(
        fromBlockchain: BlockchainName,
        toBlockchain: BlockchainName
    ): boolean {
        return (
            this.isSupportedBlockchain(fromBlockchain) && this.isSupportedBlockchain(toBlockchain)
        );
    }

    public abstract calculate(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult>;

    protected getWalletAddress(blockchain: Web3PrivateSupportedBlockchain): string {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(blockchain).address;
    }

    protected abstract getRoutePath(...options: unknown[]): Promise<RubicStep[]>;

    /**
     * Gets fee information.
     * @param _fromBlockchain Source network blockchain.
     * @param _providerAddress Integrator address.
     * @param _percentFeeToken Protocol fee token.
     * @param _useProxy Use rubic proxy or not.
     * @param _contractAbi Rubic Proxy contract abi.
     * @protected
     * @internal
     */
    protected async getFeeInfo(
        _fromBlockchain: Partial<BlockchainName>,
        _providerAddress: string,
        _percentFeeToken: PriceToken,
        _useProxy: boolean,
        _contractAbi?: AbiItem[]
    ): Promise<FeeInfo> {
        return {};
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
        const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
        const fromChainType = BlockchainsInfo.getChainType(fromBlockchain);
        const nativeToken = nativeTokensList[fromBlockchain];

        if (!Web3Pure[fromChainType].isEmptyAddress(providerAddress)) {
            const integratorInfo = await web3Public.callContractMethod<{
                isIntegrator: boolean;
                fixedFeeAmount: string;
            }>(contractAddress, contractAbi, 'integratorToFeeInfo', [providerAddress]);
            if (integratorInfo.isIntegrator) {
                return Web3Pure.fromWei(integratorInfo.fixedFeeAmount, nativeToken.decimals);
            }
        }

        return Web3Pure.fromWei(
            await web3Public.callContractMethod<string>(
                contractAddress,
                contractAbi,
                'fixedNativeFee'
            ),
            nativeToken.decimals
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
        const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
        const fromChainType = BlockchainsInfo.getChainType(fromBlockchain);

        if (!Web3Pure[fromChainType].isEmptyAddress(providerAddress)) {
            const integratorInfo = await web3Public.callContractMethod<{
                isIntegrator: boolean;
                tokenFee: string;
            }>(contractAddress, contractAbi, 'integratorToFeeInfo', [providerAddress]);
            if (integratorInfo.isIntegrator) {
                return new BigNumber(integratorInfo.tokenFee).toNumber() / 10_000;
            }
        }

        return (
            new BigNumber(
                await web3Public.callContractMethod<string>(
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
        contractAbi: AbiItem[]
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
