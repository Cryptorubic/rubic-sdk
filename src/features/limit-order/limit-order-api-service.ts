import { ethers } from 'ethers';
import { Token } from 'src/common/tokens';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { limitOrderContractAbi } from 'src/features/limit-order/constants/limit-order-contract-abi';
import { seriesNonceManagerAbi } from 'src/features/limit-order/constants/series-nonce-manager-abi';
import { LimitOrder } from 'src/features/limit-order/models/limit-order';
import { LimitOrderApiResponse } from 'src/features/limit-order/models/limit-order-api';
import { LIMIT_ORDER_STATUS } from 'src/features/limit-order/models/limit-order-status';
import { limitOrderSupportedBlockchains } from 'src/features/limit-order/models/supported-blockchains';

export class LimitOrdersApiService {
    public async getUserOrders(userAddress: string): Promise<LimitOrder[]> {
        const orders = (
            await Promise.all(
                limitOrderSupportedBlockchains.map(async blockchain => {
                    const id = blockchainId[blockchain];
                    const ordersById = await Injector.httpClient.get<LimitOrderApiResponse[]>(
                        `https://limit-orders.1inch.io/v3.0/${id}/limit-order/address/${userAddress}?page=1&limit=100&statuses=%5B1,2%5D&sortBy=createDateTime`
                    );
                    return Promise.all(
                        ordersById.map(orderById => this.parseLimitOrder(blockchain, orderById))
                    );
                })
            )
        ).flat();
        orders.sort((orderA, orderB) => {
            if (orderA.status === orderB.status) {
                return orderB.creation.getTime() - orderA.creation.getTime();
            }
            if (orderA.status === LIMIT_ORDER_STATUS.INVALID) {
                return 1;
            }
            return -1;
        });
        return orders;
    }

    private async parseLimitOrder(
        blockchain: BlockchainName,
        {
            createDateTime,
            data: { makerAsset, takerAsset, makingAmount, takingAmount, interactions },
            orderInvalidReason
        }: LimitOrderApiResponse
    ): Promise<LimitOrder> {
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

        return {
            creation: new Date(createDateTime),
            fromToken,
            toToken,
            fromAmount: Web3Pure.fromWei(makingAmount, fromToken?.decimals),
            toAmount: Web3Pure.fromWei(takingAmount, toToken?.decimals),
            expiration,
            status:
                orderInvalidReason === null ? LIMIT_ORDER_STATUS.VALID : LIMIT_ORDER_STATUS.INVALID
        };
    }
}
