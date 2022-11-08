import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Injector } from 'src/core/injector/injector';
import {
    onChainProxyContractAbi,
    onChainProxyContractAddress
} from 'src/features/on-chain/calculation-manager/providers/common/on-chain-proxy-service/constants/on-chain-proxy-contract';
import { Cache } from 'src/common/utils/decorators';

export class OnChainProxyService {
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
        fromBlockchain: EvmBlockchainName,
        providerAddress: string
    ): Promise<{
        fixedCryptoFeeWei: string;
        platformFeePercent: number;
    }> {
        const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
        const contractAddress = onChainProxyContractAddress[fromBlockchain];

        if (providerAddress !== EvmWeb3Pure.EMPTY_ADDRESS) {
            const integratorToFeeInfo = await web3Public.callContractMethod<{
                isIntegrator: boolean;
                fixedFeeAmount: string;
                tokenFee: string;
            }>(contractAddress, onChainProxyContractAbi, 'integratorToFeeInfo', [providerAddress]);

            if (integratorToFeeInfo.isIntegrator) {
                return {
                    fixedCryptoFeeWei: integratorToFeeInfo.fixedFeeAmount,
                    platformFeePercent: parseInt(integratorToFeeInfo.tokenFee) / 10_000
                };
            }
        }

        const [fixedCryptoFeeWei, platformFee] = await Promise.all([
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
        return {
            fixedCryptoFeeWei,
            platformFeePercent: parseInt(platformFee) / 10_000
        };
    }
}
