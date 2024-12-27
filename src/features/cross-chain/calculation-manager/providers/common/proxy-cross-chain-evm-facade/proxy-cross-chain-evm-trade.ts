import BigNumber from 'bignumber.js';
import { UnapprovedContractError } from 'src/common/errors/proxy/unapproved-contract-error';
import { UnapprovedMethodError } from 'src/common/errors/proxy/unapproved-method-error';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3PublicSupportedBlockchain } from 'src/core/blockchain/web3-public-service/models/web3-public-storage';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { ProxyBridgeParams } from 'src/features/cross-chain/calculation-manager/providers/common/models/proxy-bridge-params';
import { ProxySwapParams } from 'src/features/cross-chain/calculation-manager/providers/common/models/proxy-swap-params';
import { oneinchApiParams } from 'src/features/on-chain/calculation-manager/constants/constants';
import { AbiItem, utf8ToHex } from 'web3-utils';

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
        const nativeToken = await PriceToken.createFromToken(nativeTokensList[fromBlockchain]);

        return {
            rubicProxy: {
                fixedFee: {
                    amount: fixedFeeAmount,
                    token: nativeToken
                },
                platformFee: {
                    percent: feePercent,
                    token: percentFeeToken
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
        const toChainId = blockchainId[tradeParams.toTokenAmount.blockchain] || 9999;
        const fromToken = tradeParams.srcChainTrade
            ? tradeParams.srcChainTrade.toTokenAmountMin
            : tradeParams.fromTokenAmount;
        const hasSwapBeforeBridge = tradeParams.srcChainTrade !== null;
        const toAddress = tradeParams.toAddress || tradeParams.toTokenAmount.address;
        const receiverAddress = ProxyCrossChainEvmTrade.getReceiverAddress(
            swapOptions?.receiverAddress,
            tradeParams.walletAddress,
            toChainId
        );

        return [
            EvmWeb3Pure.randomHex(32),
            tradeParams.type.toLowerCase(),
            tradeParams.providerAddress,
            ProxyCrossChainEvmTrade.getReferrerAddress(swapOptions?.referrer),
            fromToken.isNative && fromToken.blockchain === BLOCKCHAIN_NAME.METIS
                ? toAddress
                : fromToken.address,
            toAddress,
            receiverAddress,
            tradeParams.fromAddress,
            fromToken.stringWeiAmount,
            toChainId,
            hasSwapBeforeBridge,
            Boolean(tradeParams?.dstChainTrade)
        ];
    }

    private static getReferrerAddress(referrer: string | undefined): string {
        if (referrer) {
            return '0x' + utf8ToHex(referrer).slice(2, 42).padStart(40, '0');
        }

        return '0x0000000000000000000000000000000000000000';
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

    private static getReceiverAddress(
        receiverAddress: string | undefined,
        walletAddress: string,
        toChainId: number
    ): string {
        if (
            toChainId === blockchainId[BLOCKCHAIN_NAME.BITCOIN] ||
            toChainId === blockchainId[BLOCKCHAIN_NAME.SOLANA] ||
            toChainId === blockchainId[BLOCKCHAIN_NAME.TON]
        ) {
            return walletAddress;
        }

        return receiverAddress || walletAddress;
    }
}
