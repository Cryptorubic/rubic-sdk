import { CrossChainTradeType } from 'src/features';
import { RequiredCrossChainOptions } from '@rsdk-features/cross-chain/models/cross-chain-options';
import { PriceTokenAmount } from '@rsdk-core/blockchain/tokens/price-token-amount';
import { PriceToken } from '@rsdk-core/blockchain/tokens/price-token';
import { WrappedCrossChainTrade } from '@rsdk-features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import { RubicSdkError } from 'src/common';
import { parseError } from 'src/common/utils/errors';
import { BlockchainName } from 'src/core';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { LifiCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/lifi-trade-provider/constants/lifi-cross-chain-supported-blockchain';
import { Injector } from 'src/core/sdk/injector';
import { EMPTY_ADDRESS } from 'src/core/blockchain/constants/empty-address';
import { AbiItem } from 'web3-utils';

export abstract class CrossChainTradeProvider {
    public static parseError(err: unknown): RubicSdkError {
        return parseError(err, 'Cannot calculate cross chain trade');
    }

    public abstract readonly type: CrossChainTradeType;

    /**
     * Gets fee information.
     * @param fromBlockchain Source network blockchain.
     * @param providerAddress Integrator address.
     * @param percentFeeToken Protocol fee token.
     * @protected
     * @internal
     */
    protected abstract getFeeInfo(
        fromBlockchain: Partial<BlockchainName>,
        providerAddress: string,
        percentFeeToken: PriceToken
    ): Promise<FeeInfo>;

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
    ): Promise<number> {
        const web3PublicService = Injector.web3PublicService.getWeb3Public(fromBlockchain);

        if (providerAddress !== EMPTY_ADDRESS) {
            const integratorInfo = await web3PublicService.callContractMethod<
                [boolean, number, number, number, number]
            >(contractAddress, contractAbi, 'integratorToFeeInfo', {
                methodArguments: [providerAddress]
            });
            if (integratorInfo[0]) {
                return integratorInfo[4];
            }
        }

        return await web3PublicService.callContractMethod<number>(
            contractAddress,
            contractAbi,
            'fixedCryptoFee'
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
        fromBlockchain: LifiCrossChainSupportedBlockchain,
        providerAddress: string,
        contractAddress: string,
        contractAbi: AbiItem[]
    ): Promise<number> {
        const web3PublicService = Injector.web3PublicService.getWeb3Public(fromBlockchain);

        if (providerAddress !== EMPTY_ADDRESS) {
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
