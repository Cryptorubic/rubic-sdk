import { PriceTokenAmount, Web3Pure } from 'src/core';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';

export function getFromWithoutFee(from: PriceTokenAmount, feeInfo: FeeInfo): PriceTokenAmount {
    const feeAmount = Web3Pure.toWei(
        from.tokenAmount.multipliedBy(feeInfo.platformFee!.percent).dividedBy(100),
        from.decimals,
        1
    );
    return new PriceTokenAmount({
        ...from.asStruct,
        weiAmount: from.weiAmount.minus(feeAmount)
    });
}
