import { PriceTokenAmount } from 'src/common/tokens';

export function getSolanaFee(from: PriceTokenAmount): number {
    const usdTokenAmount = from.tokenAmount.multipliedBy(from.price);

    if (usdTokenAmount.gt(2)) {
        return 0.02;
    }

    return 0;
}
