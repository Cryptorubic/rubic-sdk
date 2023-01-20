import { PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';

export function getFromWithoutFee<T extends BlockchainName>(
    from: PriceTokenAmount<T>,
    platformFeePercent: number | undefined
): PriceTokenAmount<T> {
    if (!platformFeePercent) {
        return new PriceTokenAmount({
            ...from.asStruct,
            weiAmount: from.weiAmount
        });
    }
    const feeAmount = Web3Pure.toWei(
        from.tokenAmount.multipliedBy(platformFeePercent).dividedBy(100),
        from.decimals,
        1
    );
    return new PriceTokenAmount({
        ...from.asStruct,
        weiAmount: from.weiAmount.minus(feeAmount)
    });
}
