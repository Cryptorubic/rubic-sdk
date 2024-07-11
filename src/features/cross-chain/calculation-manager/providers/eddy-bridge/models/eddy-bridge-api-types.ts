export interface ZetaChainForeignCoinsRes {
    foreignCoins: ZetaChainForeignCoinInfo[];
}

interface ZetaChainForeignCoinInfo {
    zrc20_contract_address: string;
    liquidity_cap: string;
}
