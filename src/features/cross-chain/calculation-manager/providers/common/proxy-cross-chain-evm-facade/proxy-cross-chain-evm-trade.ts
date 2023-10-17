import BigNumber from 'bignumber.js';
import { UnapprovedContractError } from 'src/common/errors/proxy/unapproved-contract-error';
import { UnapprovedMethodError } from 'src/common/errors/proxy/unapproved-method-error';
import {
    nativeTokensList,
    PriceToken,
    PriceTokenAmount,
    wrappedNativeTokensList
} from 'src/common/tokens';
import { TokenBaseStruct } from 'src/common/tokens/models/token-base-struct';
import { compareAddresses } from 'src/common/utils/blockchain';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3PublicSupportedBlockchain } from 'src/core/blockchain/web3-public-service/models/web3-public-storage';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { ProxyBridgeParams } from 'src/features/cross-chain/calculation-manager/providers/common/models/proxy-bridge-params';
import { ProxySwapParams } from 'src/features/cross-chain/calculation-manager/providers/common/models/proxy-swap-params';
import { typedTradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/typed-trade-providers';
import { OnChainManager } from 'src/features/on-chain/calculation-manager/on-chain-manager';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { oneinchApiParams } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/constants';
import { AbiItem } from 'web3-utils';

type BridgeParams = [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    number,
    boolean,
    boolean
];

export class ProxyCrossChainEvmTrade {
    public static async getFeeInfo(
        fromBlockchain: Web3PublicSupportedBlockchain,
        providerAddress: string,
        percentFeeToken: PriceTokenAmount,
        useProxy: boolean
    ): Promise<FeeInfo> {
        const fixedFeeAmount = useProxy
            ? await ProxyCrossChainEvmTrade.getFixedFee(
                  fromBlockchain,
                  providerAddress,
                  rubicProxyContractAddress[fromBlockchain].router,
                  evmCommonCrossChainAbi
              )
            : new BigNumber(0);

        const feePercent = useProxy
            ? await ProxyCrossChainEvmTrade.getFeePercent(
                  fromBlockchain,
                  providerAddress,
                  rubicProxyContractAddress[fromBlockchain].router,
                  evmCommonCrossChainAbi
              )
            : 0;

        return {
            rubicProxy: {
                fixedFee: {
                    amount: fixedFeeAmount,
                    tokenSymbol: nativeTokensList?.[fromBlockchain]?.symbol || 'Unknown'
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
    private static async getFixedFee(
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
    private static async getFeePercent(
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

    public static async getOnChainTrade(
        from: PriceTokenAmount,
        transitToken: TokenBaseStruct,
        slippageTolerance: number,
        isCustomWeth = false
    ): Promise<EvmOnChainTrade | null> {
        const to = await PriceToken.createToken(transitToken);

        if (compareAddresses(from.address, transitToken.address) && !from.isNative) {
            return null;
        }

        const fromBlockchain = from.blockchain as EvmBlockchainName;

        if (from.isNative) {
            try {
                const wrapToken = isCustomWeth
                    ? to.asStruct
                    : wrappedNativeTokensList[fromBlockchain]!;

                const toWrap = new PriceToken({
                    ...wrapToken,
                    price: from.price
                });

                const trades = OnChainManager.getWrapTrade(from, toWrap, {
                    slippageTolerance
                });

                const trade = trades[0];
                if (trade) {
                    return trade;
                }
            } catch {}
        }

        const availableDexes = await ProxyCrossChainEvmTrade.getWhitelistedDexes(fromBlockchain);

        const dexes = Object.values(typedTradeProviders[fromBlockchain]);

        const allOnChainTrades = await Promise.allSettled(
            dexes.map(dex =>
                dex.calculate(from, to, {
                    slippageTolerance,
                    gasCalculation: 'disabled',
                    useProxy: false,
                    usedForCrossChain: true
                })
            )
        );
        const successSortedTrades = allOnChainTrades
            .filter(value => value.status === 'fulfilled')
            .map(value => (value as PromiseFulfilledResult<EvmOnChainTrade>).value)
            .filter(onChainTrade =>
                availableDexes.some(availableDex =>
                    compareAddresses(availableDex, onChainTrade.dexContractAddress)
                )
            )
            .sort((a, b) => b.to.tokenAmount.comparedTo(a.to.tokenAmount));

        if (!successSortedTrades.length) {
            return null;
        }
        return successSortedTrades[0]!;
    }

    public static async getWhitelistedDexes(fromBlockchain: EvmBlockchainName): Promise<string[]> {
        const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
        return web3Public.callContractMethod<string[]>(
            rubicProxyContractAddress[fromBlockchain].router,
            evmCommonCrossChainAbi,
            'approvedDexs'
        );
    }

    public static getBridgeData(
        swapOptions: GetContractParamsOptions,
        tradeParams: ProxyBridgeParams
    ): BridgeParams {
        const receiverAddress = swapOptions?.receiverAddress || tradeParams.walletAddress;
        const toChainId = blockchainId[tradeParams.toTokenAmount.blockchain] || 9999;
        const fromToken = tradeParams.srcChainTrade
            ? tradeParams.srcChainTrade.toTokenAmountMin
            : tradeParams.fromTokenAmount;
        const hasSwapBeforeBridge = tradeParams.srcChainTrade !== null;

        const toAddress = tradeParams.toAddress || tradeParams.toTokenAmount.address;

        return [
            EvmWeb3Pure.randomHex(32),
            tradeParams.type.toLowerCase(),
            tradeParams.providerAddress,
            EvmWeb3Pure.randomHex(20),
            fromToken.address,
            toAddress,
            receiverAddress,
            tradeParams.fromAddress,
            fromToken.stringWeiAmount,
            toChainId,
            hasSwapBeforeBridge,
            Boolean(tradeParams?.dstChainTrade)
        ];
    }

    public static async getSwapData(
        swapOptions: GetContractParamsOptions,
        tradeParams: ProxySwapParams
    ): Promise<[[string, string, string, string, string, string, boolean]]> {
        const fromAddress =
            swapOptions.fromAddress || tradeParams.walletAddress || oneinchApiParams.nativeAddress;
        const swapData = await tradeParams.onChainEncodeFn({
            fromAddress,
            receiverAddress: tradeParams.contractAddress,
            supportFee: false
        });

        const routerAddress = swapData.to;
        const signature = swapData.data.slice(0, 10);

        await ProxyCrossChainEvmTrade.checkDexWhiteList(
            tradeParams.fromTokenAmount.blockchain,
            routerAddress,
            signature
        );

        return [
            [
                routerAddress,
                routerAddress,
                tradeParams.fromTokenAmount.address,
                tradeParams.toTokenAmount.address,
                tradeParams.fromTokenAmount.stringWeiAmount,
                swapData.data,
                true
            ]
        ];
    }

    public static async getGenericProviderData(
        providerAddress: string,
        providerData: string,
        fromBlockchain: EvmBlockchainName,
        gatewayAddress: string,
        extraNative: string
    ): Promise<[string, string, string, string]> {
        await ProxyCrossChainEvmTrade.checkCrossChainWhiteList(
            fromBlockchain,
            providerAddress,
            providerData.slice(0, 10)
        );

        return [providerAddress, gatewayAddress, extraNative, providerData];
    }

    public static async checkCrossChainWhiteList(
        fromBlockchain: EvmBlockchainName,
        routerAddress: string,
        offset: string
    ): Promise<void | never> {
        const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
        const result = await web3Public.callContractMethod<{ isAvailable: boolean }>(
            rubicProxyContractAddress[fromBlockchain].router,
            evmCommonCrossChainAbi,
            'getSelectorInfo',
            [routerAddress, offset]
        );
        if (!result.isAvailable) {
            throw new UnapprovedContractError(offset, routerAddress);
        }
    }

    public static async checkDexWhiteList(
        fromBlockchain: EvmBlockchainName,
        routerAddress: string,
        method: string
    ): Promise<never | void> {
        const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);

        let isRouterApproved = false;
        try {
            isRouterApproved = await web3Public.callContractMethod<boolean>(
                rubicProxyContractAddress[fromBlockchain].router,
                evmCommonCrossChainAbi,
                'isContractApproved',
                [routerAddress]
            );
        } catch {}
        if (!isRouterApproved) {
            throw new UnapprovedContractError(method, routerAddress);
        }

        let isMethodApproved = false;
        try {
            isMethodApproved = await web3Public.callContractMethod<boolean>(
                rubicProxyContractAddress[fromBlockchain].router,
                evmCommonCrossChainAbi,
                'isFunctionApproved',
                [method]
            );
        } catch {}
        if (!isMethodApproved) {
            throw new UnapprovedMethodError(method, routerAddress);
        }
    }
}
