import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Injector } from 'src/core/injector/injector';
import {
    onChainProxyContractAbi,
    onChainProxyContractAddress
} from 'src/features/on-chain/calculation-manager/providers/common/on-chain-proxy-service/constants/on-chain-proxy-contract';
import { Cache } from 'src/common/utils/decorators';
import {
    OnChainPlatformFee,
    OnChainProxyFeeInfo
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';
import { nativeTokensList, PriceTokenAmount, TokenAmount } from 'src/common/tokens';
import BigNumber from 'bignumber.js';
import {
    OnChainProxySupportedBlockchain,
    onChainProxySupportedBlockchains
} from 'src/features/on-chain/calculation-manager/providers/common/on-chain-proxy-service/models/on-chain-proxy-supported-blockchain';

export class OnChainProxyService {
    public static isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is OnChainProxySupportedBlockchain {
        return onChainProxySupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    @Cache({
        maxAge: 15_000
    })
    public isContractPaused(fromBlockchain: EvmBlockchainName): Promise<boolean> {
        const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
        const contractAddress = onChainProxyContractAddress[fromBlockchain];

        return web3Public.callContractMethod<boolean>(
            contractAddress,
            onChainProxyContractAbi,
            'paused',
            []
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
        const contractAddress = onChainProxyContractAddress[fromBlockchain];

        let fixedCryptoFeeWei: string | undefined;
        let platformFeePercent: number;
        if (providerAddress !== EvmWeb3Pure.EMPTY_ADDRESS) {
            const integratorToFeeInfo = await web3Public.callContractMethod<{
                isIntegrator: boolean;
                fixedFeeAmount: string;
                tokenFee: string;
            }>(contractAddress, onChainProxyContractAbi, 'integratorToFeeInfo', [providerAddress]);

            if (integratorToFeeInfo.isIntegrator) {
                fixedCryptoFeeWei = integratorToFeeInfo.fixedFeeAmount;
                platformFeePercent = parseInt(integratorToFeeInfo.tokenFee) / 10_000;
            }
        }
        if (fixedCryptoFeeWei === undefined) {
            const feeInfo = await Promise.all([
                web3Public.callContractMethod<string>(
                    contractAddress,
                    onChainProxyContractAbi,
                    'fixedCryptoFee',
                    []
                ),
                web3Public.callContractMethod<string>(
                    contractAddress,
                    onChainProxyContractAbi,
                    'RubicPlatformFee',
                    []
                )
            ]);
            fixedCryptoFeeWei = feeInfo[0];
            platformFeePercent = parseInt(feeInfo[1]) / 10_000;
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
}
