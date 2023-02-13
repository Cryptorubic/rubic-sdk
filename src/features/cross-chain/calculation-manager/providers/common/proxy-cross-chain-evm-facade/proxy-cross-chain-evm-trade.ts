import BigNumber from 'bignumber.js';
import { nativeTokensList, PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { TokenStruct } from 'src/common/tokens/token';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { Web3PublicSupportedBlockchain } from 'src/core/blockchain/web3-public-service/models/web3-public-storage';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { MultichainProxyCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/dex-multichain-provider/models/supported-blockchain';
import { typedTradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/typed-trade-providers';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { AbiItem } from 'web3-utils';

export class ProxyCrossChainEvmTrade {
    public async getFeeInfo(
        fromBlockchain: EvmBlockchainName,
        providerAddress: string,
        percentFeeToken: PriceTokenAmount
    ): Promise<FeeInfo> {
        const fixedFeeAmount = await this.getFixedFee(
            fromBlockchain,
            providerAddress,
            rubicProxyContractAddress[fromBlockchain],
            evmCommonCrossChainAbi
        );

        const feePercent = await this.getFeePercent(
            fromBlockchain,
            providerAddress,
            rubicProxyContractAddress[fromBlockchain],
            evmCommonCrossChainAbi
        );

        return {
            rubicProxy: {
                fixedFee: {
                    amount: fixedFeeAmount,
                    tokenSymbol: nativeTokensList[fromBlockchain].symbol
                },
                platformFee: {
                    percent: feePercent,
                    tokenSymbol: percentFeeToken.symbol
                }
            }
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

    public async getOnChainTrade(
        from: PriceTokenAmount,
        transitToken: TokenStruct<BlockchainName>,
        _availableDexes: string[],
        slippageTolerance: number
    ): Promise<EvmOnChainTrade | null> {
        const fromBlockchain = from.blockchain as MultichainProxyCrossChainSupportedBlockchain;
        if (compareAddresses(from.address, transitToken.address)) {
            return null;
        }

        const dexes = Object.values(typedTradeProviders[fromBlockchain]).filter(
            el => el.type === ON_CHAIN_TRADE_TYPE.QUICK_SWAP
        );
        //     .filter(
        //     dex => dex.supportReceiverAddress
        // );
        const to = await PriceToken.createToken(transitToken);
        const allOnChainTrades = await Promise.allSettled(
            dexes.map(dex =>
                dex.calculate(from, to, {
                    slippageTolerance,
                    gasCalculation: 'disabled'
                })
            )
        );
        const successSortedTrades = allOnChainTrades
            .filter(value => value.status === 'fulfilled')
            .map(value => (value as PromiseFulfilledResult<EvmOnChainTrade>).value)
            // .filter(onChainTrade =>
            //     availableDexes.some(availableDex =>
            //         compareAddresses(availableDex, onChainTrade.dexContractAddress)
            //     )
            // )
            .sort((a, b) => b.to.tokenAmount.comparedTo(a.to.tokenAmount));

        if (!successSortedTrades.length) {
            return null;
        }
        return successSortedTrades[0]!;
    }
}
