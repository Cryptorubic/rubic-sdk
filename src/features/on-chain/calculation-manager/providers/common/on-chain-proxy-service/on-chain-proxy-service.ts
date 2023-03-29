import BigNumber from 'bignumber.js';
import { nativeTokensList, PriceTokenAmount, TokenAmount } from 'src/common/tokens';
import { Cache } from 'src/common/utils/decorators';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Injector } from 'src/core/injector/injector';
import {
    ProxySupportedBlockchain,
    proxySupportedBlockchains
} from 'src/features/common/constants/proxy-supported-blockchain';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import {
    OnChainPlatformFee,
    OnChainProxyFeeInfo
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';

export class OnChainProxyService {
    public static isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is ProxySupportedBlockchain {
        return proxySupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    @Cache({
        maxAge: 15_000
    })
    public async getFeeInfo(
        from: PriceTokenAmount<EvmBlockchainName>,
        providerAddress: string
    ): Promise<OnChainProxyFeeInfo> {
        const fromBlockchain = from.blockchain;
        const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
        const contractAddress = rubicProxyContractAddress[fromBlockchain].router;

        let fixedCryptoFeeWei: string | undefined;
        let platformFeePercent: number;

        if (providerAddress !== EvmWeb3Pure.EMPTY_ADDRESS) {
            const fee = await OnChainProxyService.handleIntegratorFee(
                web3Public,
                contractAddress,
                providerAddress
            );
            fixedCryptoFeeWei = fee.fixedCryptoFeeWei;
            platformFeePercent = fee.platformFeePercent;
        }

        if (fixedCryptoFeeWei === undefined) {
            const fee = await OnChainProxyService.handleRubicFee(web3Public, contractAddress);
            fixedCryptoFeeWei = fee.fixedCryptoFeeWei;
            platformFeePercent = fee.platformFeePercent;
        }

        const fixedFeeToken = new TokenAmount({
            ...nativeTokensList[fromBlockchain],
            weiAmount: new BigNumber(fixedCryptoFeeWei)
        });
        const platformFee: OnChainPlatformFee = {
            percent: platformFeePercent!,
            token: new TokenAmount({
                ...from,
                tokenAmount: from.tokenAmount.multipliedBy(platformFeePercent! / 100)
            })
        };

        return {
            fixedFeeToken,
            platformFee
        };
    }

    private static async handleIntegratorFee(
        web3Public: EvmWeb3Public,
        contractAddress: string,
        providerAddress: string
    ): Promise<{ fixedCryptoFeeWei: string | undefined; platformFeePercent: number }> {
        const integratorToFeeInfo = await web3Public.callContractMethod<{
            isIntegrator: boolean;
            fixedFeeAmount: string;
            tokenFee: string;
        }>(contractAddress, evmCommonCrossChainAbi, 'integratorToFeeInfo', [providerAddress]);

        return {
            fixedCryptoFeeWei: integratorToFeeInfo.fixedFeeAmount,
            platformFeePercent: parseInt(integratorToFeeInfo.tokenFee) / 10_000
        };
    }

    private static async handleRubicFee(
        web3Public: EvmWeb3Public,
        contractAddress: string
    ): Promise<{ fixedCryptoFeeWei: string; platformFeePercent: number }> {
        const feeInfo = await Promise.all([
            web3Public.callContractMethod<string>(
                contractAddress,
                evmCommonCrossChainAbi,
                'fixedNativeFee',
                []
            ),
            web3Public.callContractMethod<string>(
                contractAddress,
                evmCommonCrossChainAbi,
                'RubicPlatformFee',
                []
            )
        ]);
        return {
            fixedCryptoFeeWei: feeInfo[0],
            platformFeePercent: parseInt(feeInfo[1]) / 10_000
        };
    }
}
