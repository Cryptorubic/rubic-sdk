import {
    FeesInterface,
    PriceTokenAmount,
    PriceTokenAmountStruct,
    RoutingInterface
} from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { PriceToken } from 'src/common/tokens';
import { Any } from 'src/common/utils/types';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';

export class RubicApiParser {
    public static parseRoutingDto(routingDto: RoutingInterface[]): RubicStep[] {
        const steps: RubicStep[] = [];

        for (const route of routingDto) {
            const [from, to] = route.path;

            const fromToken = new PriceTokenAmount({
                ...(from as Any as PriceTokenAmountStruct),
                tokenAmount: from?.amount!
            });

            const toToken = new PriceTokenAmount({
                ...(to as Any as PriceTokenAmountStruct),
                tokenAmount: to?.amount!
            });

            steps.push({
                provider: route.provider,
                path: [fromToken, toToken],
                type: route.type
            });
        }

        return steps;
    }

    public static parseFeeInfoDto(feeInfoDto: FeesInterface): FeeInfo {
        const nativeToken = new PriceToken({
            ...feeInfoDto.gasTokenFees.nativeToken,
            price: new BigNumber(feeInfoDto.gasTokenFees.nativeToken.price!)
        });

        const protocolFee = feeInfoDto.gasTokenFees.protocol;
        const providerFee = feeInfoDto.gasTokenFees.provider;
        return {
            rubicProxy: {
                fixedFee: {
                    amount: new BigNumber(protocolFee.fixedAmount),
                    token: nativeToken
                }
            },
            provider: {
                cryptoFee: {
                    amount: new BigNumber(providerFee.fixedAmount),
                    token: nativeToken
                }
            }
        };
    }
}
