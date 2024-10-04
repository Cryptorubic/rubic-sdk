export const openOceanApiUrl = {
    tokenList: (chain: string) => `https://x-api.rubic.exchange/oo/api/token_list/${chain}`,
    quote: (chain: string) => `https://x-api.rubic.exchange/oo/api/v3/${chain}/quote`,
    swapQuote: (chain: string) => `https://x-api.rubic.exchange/oo/api/v3/${chain}/swap_quote`,
    gmxQuote: (chain: string) => `https://open-api.openocean.finance/v3/${chain}/gmx_quote`,
    gmxSwapQuote: (chain: string) => `https://open-api.openocean.finance/v3/${chain}/gmx_swap_quote`
};
