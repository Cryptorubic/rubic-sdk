import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { Cache } from 'src/common/utils/decorators';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Injector } from 'src/core/injector/injector';
import {
    ON_CHAIN_PROXY_DISABLED_CHAINS,
    ProxySupportedBlockchain,
    proxySupportedBlockchains
} from 'src/features/common/constants/proxy-supported-blockchain';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/constants/evm-common-cross-chain-abi';
import {
    OnChainPlatformFee,
    OnChainProxyFeeInfo
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';

export class OnChainProxyService {
    public static isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is ProxySupportedBlockchain {
        const isProxySupported = proxySupportedBlockchains.some(
            supportedBlockchain =>
                supportedBlockchain === blockchain &&
                !ON_CHAIN_PROXY_DISABLED_CHAINS.some(chain => chain === blockchain)
        );

        return isProxySupported;
    }

    @Cache({
        maxAge: 15_000
    })
    public async getFeeInfo(
        from: PriceTokenAmount<BlockchainName>,
        providerAddress: string
    ): Promise<OnChainProxyFeeInfo> {
        const fromBlockchain = from.blockchain;
        const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
        const contractAddress = rubicProxyContractAddress[fromBlockchain].router;

        let fixedCryptoFeeWei: string | undefined;
        let platformFeePercent: number;
        let isIntegrator = true;

        if (providerAddress !== EvmWeb3Pure.EMPTY_ADDRESS) {
            const fee = await OnChainProxyService.handleIntegratorFee(
                web3Public,
                contractAddress,
                providerAddress
            );
            isIntegrator = fee.isIntegrator;
            fixedCryptoFeeWei = fee.fixedCryptoFeeWei;
            platformFeePercent = fee.platformFeePercent;
        }

        if (fixedCryptoFeeWei === undefined || !isIntegrator) {
            const fee = await OnChainProxyService.handleRubicFee(web3Public, contractAddress);
            fixedCryptoFeeWei = fee.fixedCryptoFeeWei;
            platformFeePercent = fee.platformFeePercent;
        }

        const fixedFeeToken = await PriceTokenAmount.createFromToken({
            ...nativeTokensList[fromBlockchain],
            weiAmount: new BigNumber(fixedCryptoFeeWei)
        });

        const platformFee: OnChainPlatformFee = {
            percent: platformFeePercent!,
            token: await PriceTokenAmount.createFromToken({
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
    ): Promise<{
        fixedCryptoFeeWei: string | undefined;
        platformFeePercent: number;
        isIntegrator: boolean;
    }> {
        try {
            const integratorToFeeInfo = await web3Public.callContractMethod<{
                isIntegrator: boolean;
                fixedFeeAmount: string;
                tokenFee: string;
            }>(contractAddress, evmCommonCrossChainAbi, 'integratorToFeeInfo', [providerAddress]);

            return {
                fixedCryptoFeeWei: integratorToFeeInfo.fixedFeeAmount,
                platformFeePercent: parseInt(integratorToFeeInfo.tokenFee) / 10_000,
                isIntegrator: integratorToFeeInfo.isIntegrator
            };
        } catch (err) {
            console.log('%chandleIntegratorFee_err ==> ', 'color: orange;', err);
            throw err;
        }
    }

    private static async handleRubicFee(
        web3Public: EvmWeb3Public,
        contractAddress: string
    ): Promise<{ fixedCryptoFeeWei: string; platformFeePercent: number }> {
        try {
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
        } catch (err) {
            console.log('%chandleRubicFee_err ==> ', 'color: orange;', err);
            throw err;
        }
    }
}
