import { PriceTokenAmount, PriceTokenAmountStruct, RoutingInterface } from '@cryptorubic/core';
import { Any } from 'src/common/utils/types';
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
}
