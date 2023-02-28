import { LimitOrder as OneinchLimitOrder } from '@1inch/limit-order-protocol-utils';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { Token } from 'src/common/tokens';
import { notNull } from 'src/common/utils/object';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { limitOrderContractAbi } from 'src/features/limit-order/constants/limit-order-contract-abi';
import { seriesNonceManagerAbi } from 'src/features/limit-order/constants/series-nonce-manager-abi';
import { LimitOrder } from 'src/features/limit-order/models/limit-order';
import {
    LimitOrderApi,
    LimitOrderApiResponse
} from 'src/features/limit-order/models/limit-order-api';
import { LIMIT_ORDER_STATUS } from 'src/features/limit-order/models/limit-order-status';
import { limitOrderSupportedBlockchains } from 'src/features/limit-order/models/supported-blockchains';

const baseApi = (chainId: number) => `https://limit-orders.1inch.io/v3.0/${chainId}/limit-order`;

export class LimitOrderApiService {
    private getApiOrders(
        chainId: number,
        userAddress: string,
        statuses = [1, 2]
    ): Promise<LimitOrderApiResponse> {
        return Injector.httpClient.get<LimitOrderApiResponse>(
            `${baseApi(chainId)}/address/${userAddress}`,
            {
                params: {
                    statuses: JSON.stringify(statuses),
                    sortBy: 'createDateTime'
                }
            }
        );
    }

    public async getUserOrders(userAddress: string): Promise<LimitOrder[]> {
        const orders = (
            await Promise.all(
                limitOrderSupportedBlockchains.map(async blockchain => {
                    const chainId = blockchainId[blockchain];
                    const ordersById = (
                        await Promise.all([
                            this.getApiOrders(chainId, userAddress, [1, 2]),
                            this.getApiOrders(chainId, userAddress, [3])
                        ])
                    ).flat();
                    try {
                        return (
                            await Promise.all(
                                ordersById.map(orderById =>
                                    this.parseLimitOrder(blockchain, orderById)
                                )
                            )
                        ).filter(notNull);
                    } catch {
                        return [];
                    }
                })
            )
        ).flat();
        this.sortOrders(orders);
        return orders;
    }

    private async parseLimitOrder(
        blockchain: BlockchainName,
        {
            orderHash,
            createDateTime,
            data: { makerAsset, takerAsset, makingAmount, takingAmount, interactions },
            orderInvalidReason,
            remainingMakerAmount,
            makerBalance
        }: LimitOrderApi
    ): Promise<LimitOrder | null> {
        if (orderInvalidReason !== null && remainingMakerAmount === makingAmount) {
            return null;
        }

        const [fromToken, toToken] = await Promise.all([
            Token.createToken({ address: makerAsset, blockchain }),
            Token.createToken({ address: takerAsset, blockchain })
        ]);

        let expiration: Date | null = null;
        try {
            const limitOrderContract = new ethers.utils.Interface(limitOrderContractAbi);

            const arbitraryStaticCallData = limitOrderContract.decodeFunctionData(
                'arbitraryStaticCall',
                interactions
            );
            const seriesNonceManagerData = arbitraryStaticCallData.data;

            const seriesNonceManagerContract = new ethers.utils.Interface(seriesNonceManagerAbi);
            const { timeNonceSeriesAccount } = seriesNonceManagerContract.decodeFunctionData(
                'timestampBelowAndNonceEquals',
                seriesNonceManagerData
            );
            expiration = new Date(Number(BigInt(timeNonceSeriesAccount) >> 216n) * 1000);
        } catch {}

        let status: LIMIT_ORDER_STATUS;
        if (orderInvalidReason === null) {
            status = LIMIT_ORDER_STATUS.VALID;
        } else if (orderInvalidReason === 'order filled') {
            status = LIMIT_ORDER_STATUS.FILLED;
        } else {
            status = LIMIT_ORDER_STATUS.EXPIRED;
        }

        return {
            hash: orderHash,
            creation: new Date(createDateTime),
            fromToken,
            toToken,
            fromAmount: Web3Pure.fromWei(makingAmount, fromToken?.decimals),
            toAmount: Web3Pure.fromWei(takingAmount, toToken?.decimals),
            fromBalance: Web3Pure.fromWei(makerBalance, fromToken?.decimals),
            expiration,
            status,
            filledPercent: new BigNumber(makingAmount)
                .minus(remainingMakerAmount)
                .div(makingAmount)
                .multipliedBy(100)
                .dp(2)
                .toNumber()
        };
    }

    private sortOrders(orders: LimitOrder[]): void {
        orders.sort((orderA, orderB) => {
            if (
                (orderA.status === LIMIT_ORDER_STATUS.VALID &&
                    orderB.status === LIMIT_ORDER_STATUS.VALID) ||
                (orderA.status !== LIMIT_ORDER_STATUS.VALID &&
                    orderB.status !== LIMIT_ORDER_STATUS.VALID)
            ) {
                return orderB.creation.getTime() - orderA.creation.getTime();
            }
            if (orderA.status === LIMIT_ORDER_STATUS.VALID) {
                return -1;
            }
            return 1;
        });
    }

    public async getOrderByHash(
        userAddress: string,
        blockchain: BlockchainName,
        hash: string
    ): Promise<LimitOrderApi | null> {
        const chainId = blockchainId[blockchain];
        try {
            const orders = await this.getApiOrders(chainId, userAddress);
            return (
                orders.find(({ orderHash }) => orderHash.toLowerCase() === hash.toLowerCase()) ||
                null
            );
        } catch {
            return null;
        }
    }

    public async createLimitOrder(
        chainId: number,
        body: {
            orderHash: string;
            signature: string;
            data: OneinchLimitOrder;
        }
    ): Promise<void> {
        await Injector.httpClient.post(
            `https://limit-orders.1inch.io/v3.0/${chainId}/limit-order`,
            body
        );
    }
}
