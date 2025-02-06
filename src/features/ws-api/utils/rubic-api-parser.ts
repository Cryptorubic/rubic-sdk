import {
    FeesInterface,
    PriceTokenAmount,
    PriceTokenAmountStruct,
    RoutingInterface
} from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { MaxAmountError, MinAmountError, RubicSdkError } from 'src/common/errors';
import { PriceToken } from 'src/common/tokens';
import { Any } from 'src/common/utils/types';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';

import { RubicApiError, RubicApiErrorDto } from '../models/rubic-api-error';
import { RubicApiWarnings } from '../models/rubic-api-warnings';

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

    public static parseRubicApiErrors(err: RubicApiError): RubicSdkError {
        if (err.code === 205) {
            const data = err.data as {
                tokenSymbol: string;
                minAmount?: string;
                maxAmount?: string;
            };
            if (data.minAmount) {
                return new MinAmountError(new BigNumber(data.minAmount), data.tokenSymbol);
            }
            if (data.maxAmount) {
                return new MaxAmountError(new BigNumber(data.maxAmount), data.tokenSymbol);
            }
        }

        throw new RubicSdkError(err.reason);
    }

    public static parseRubicApiWarnings(warnings: RubicApiErrorDto[]): RubicApiWarnings {
        const parsedWarnings: RubicApiWarnings = { needAuthWallet: false };

        for (const warning of warnings) {
            if (warning.code === 409) {
                parsedWarnings.needAuthWallet = true;
            }
        }

        return parsedWarnings;
    }
}
